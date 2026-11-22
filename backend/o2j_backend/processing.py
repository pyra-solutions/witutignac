"""Przetwarzanie spraw z GUI tym samym silnikiem co CLI (`odwolania2json.pipeline.Engine`).

Jeden wątek roboczy konwertuje dokumenty po kolei (Docling na CPU), a wywołania LLM idą do puli
wątków, więc konwersja następnego dokumentu nie czeka na odpowiedź modelu. Silnik czyta aktywne
wydanie konfiguracji (`engine/config/release.json`); po jego zmianie następny dokument użyje nowego
wydania bez restartu serwera.
"""

import json
import logging
import queue
import re
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from .cases import PENDING, CaseStore, DocStatus

log = logging.getLogger(__name__)


# --- aktywna konfiguracja --------------------------------------------------------------


def active_config_path() -> Path:
    """Ten sam wybór co w CLI silnika: release.json, a gdy go brak, katalog config/seed."""
    from odwolania2json.cli import DEFAULT_RELEASE, DEFAULT_SEED

    return DEFAULT_RELEASE if DEFAULT_RELEASE.exists() else DEFAULT_SEED


class ActiveRelease:
    """Wydanie z `engine/config/release.json`, wczytywane ponownie po zmianie pliku."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._key: tuple[Any, ...] | None = None
        self._release: Any = None

    def get(self) -> Any:
        from odwolania2json.config import load_release

        path = active_config_path()
        st = path.stat()
        key = (str(path), st.st_mtime_ns, st.st_size)
        with self._lock:
            if key != self._key:
                self._release = load_release(path)
                self._key = key
            return self._release


# --- walidacja wyniku -------------------------------------------------------------------

_ISO_DATE = re.compile(r"\d{4}-\d{2}-\d{2}")


def validate_result(release: Any, doc_type: str | None, result: Any) -> dict[str, list[str]]:
    """Ostrzeżenia walidatorów silnika dla wartości wyniku, po kluczu z indeksami (np. `Odwolujacy[0].nip`)."""
    import odwolania2json.validators  # noqa: F401 — rejestracja walidatorów
    from odwolania2json.assemble import build_tree, flatten, generic
    from odwolania2json.registry import validators

    dt = next((d for d in release.document_types if d.code == doc_type), None)
    if dt is None or not isinstance(result, dict):
        return {}
    fdefs = {f.path: f for f in dt.fields}
    out: dict[str, list[str]] = {}
    for key, value in flatten(build_tree(dt.fields), result).items():
        f = fdefs.get(generic(key))
        if f is None or value is None or value == "":
            continue
        msgs: list[str] = []
        if f.type == "date" and not (isinstance(value, str) and _ISO_DATE.fullmatch(value)):
            msgs.append("data powinna mieć format RRRR-MM-DD")
        elif f.type == "integer" and not (isinstance(value, int) and not isinstance(value, bool)):
            msgs.append("wartość powinna być liczbą całkowitą")
        elif f.type == "number" and not (isinstance(value, (int, float)) and not isinstance(value, bool)):
            msgs.append("wartość powinna być liczbą")
        if f.enum is not None and value not in f.enum:
            msgs.append(f"wartość spoza dozwolonej listy: {', '.join(map(str, f.enum))}")
        for v in f.validators:
            try:
                msg = validators.get(v.name)(value, **v.args)
            except Exception as e:  # noqa: BLE001 — błąd walidatora nie psuje odpowiedzi API
                msg = f"walidator {v.name} nie zadziałał: {e}"
            if msg:
                msgs.append(msg)
        if msgs:
            out[key] = msgs
    return out


# --- kolejka przetwarzania ---------------------------------------------------------------


def _now() -> datetime:
    return datetime.now(UTC).replace(microsecond=0)


class Processor:
    def __init__(self, store: CaseStore, release: ActiveRelease, cache_dir: Path | None, use_llm: bool = True) -> None:
        self.store = store
        self.release = release
        self.cache_dir = cache_dir
        self.use_llm = use_llm
        self._queue: queue.Queue[tuple[str, str] | None] = queue.Queue()
        self._thread: threading.Thread | None = None
        self._pool: ThreadPoolExecutor | None = None
        self._engine: Any = None
        self._engine_release: Any = None
        self._converter: Any = None
        self._busy = 0
        self._busy_lock = threading.Lock()

    # sterowanie
    def start(self) -> None:
        if self._thread is not None:
            return
        self._thread = threading.Thread(target=self._loop, name="o2j-processor", daemon=True)
        self._thread.start()
        # Dokumenty przerwane restartem serwera wracają do kolejki.
        for record in self.store.list():
            for doc in record.documents:
                if doc.status in PENDING:
                    self.store.update_document(record.id, doc.id, status=DocStatus.QUEUED)
                    self.enqueue(record.id, doc.id)

    def stop(self) -> None:
        if self._thread is None:
            return
        self._queue.put(None)
        self._thread.join(timeout=5)
        if self._pool is not None:
            self._pool.shutdown(wait=False, cancel_futures=True)
        self._thread = None

    def enqueue(self, case_id: str, doc_id: str) -> None:
        with self._busy_lock:
            self._busy += 1
        self._queue.put((case_id, doc_id))

    @property
    def pending(self) -> int:
        """Dokumenty w kolejce i w trakcie przetwarzania."""
        with self._busy_lock:
            return self._busy

    def _done_one(self) -> None:
        with self._busy_lock:
            self._busy = max(0, self._busy - 1)

    # praca
    def _loop(self) -> None:
        while True:
            item = self._queue.get()
            if item is None:
                return
            try:
                self._process(*item)
            except Exception:  # noqa: BLE001 — wątek roboczy nie może zginąć
                log.exception("błąd przetwarzania %s/%s", *item)
                self.store.update_document(item[0], item[1], status=DocStatus.ERROR,
                                           errors=["wewnętrzny błąd serwera, szczegóły w logu"])
                self._done_one()

    def _get_engine(self) -> Any:
        from odwolania2json.pipeline import Engine

        release = self.release.get()
        if self._engine is None or release is not self._engine_release:
            engine = Engine(release, self.cache_dir, use_llm=self.use_llm)
            if self._converter is not None:  # modele Docling zostają w pamięci między wydaniami
                engine.converter = self._converter
            self._converter = engine.converter
            self._engine, self._engine_release = engine, release
            log.info("Silnik: wydanie %s; LLM: %s", release.version, engine.llm_status())
        if self._pool is None:
            self._pool = ThreadPoolExecutor(max_workers=max(1, release.settings.llm_concurrency),
                                            thread_name_prefix="o2j-llm")
        return self._engine

    def _process(self, case_id: str, doc_id: str) -> None:
        record = self.store.get(case_id)
        doc = record.document(doc_id) if record else None
        if record is None or doc is None:
            self._done_one()
            return
        engine = self._get_engine()
        t0 = time.perf_counter()
        self.store.update_document(case_id, doc_id, status=DocStatus.CONVERTING, errors=[], doc_type=None,
                                   release=engine.release.version)
        prep = engine.prepare(self.store.input_path(case_id, doc), Path(case_id) / doc.file_name)
        changes: dict[str, Any] = {"doc_type": prep.doc_type.code if prep.doc_type else None}
        if prep.conv is not None:
            changes |= {"pages": prep.conv.pages, "scanned": prep.conv.scanned}
            self.store.write_file(self.store.markdown_path(case_id, doc), prep.conv.markdown)
        if prep.doc_type is not None and engine.use_llm:
            self.store.update_document(case_id, doc_id, status=DocStatus.EXTRACTING, **changes)
            assert self._pool is not None
            self._pool.submit(self._finish, engine, case_id, doc_id, prep, t0)
        else:
            self.store.update_document(case_id, doc_id, **changes)
            self._finish(engine, case_id, doc_id, prep, t0)

    def _finish(self, engine: Any, case_id: str, doc_id: str, prep: Any, t0: float) -> None:
        try:
            engine.run_llm(prep)
            out, trace = engine.finalize(prep)
            record = self.store.get(case_id)
            doc = record.document(doc_id) if record else None
            if record is None or doc is None:
                return
            text = engine.release.settings.unsupported_output if out is None else (
                json.dumps(out, ensure_ascii=False, indent=2) + "\n")
            self.store.write_file(self.store.output_path(case_id, doc), text)
            self.store.write_file(self.store.trace_path(case_id, doc),
                                  json.dumps(trace, ensure_ascii=False, indent=2, default=str) + "\n")
            if prep.conv is None:
                status = DocStatus.ERROR
            elif prep.doc_type is None:
                status = DocStatus.UNSUPPORTED
            else:
                status = DocStatus.DONE
            seconds = round(time.perf_counter() - t0, 1)
            self.store.update_document(case_id, doc_id, status=status, errors=prep.errors, seconds=seconds,
                                       processed_at=_now())
            self.store.audit("dokument_przetworzony", case_id, doc_id, status=status.value,
                             doc_type=trace.get("doc_type"), release=engine.release.version, seconds=seconds)
        except Exception as e:  # noqa: BLE001
            log.exception("błąd ekstrakcji %s/%s", case_id, doc_id)
            self.store.update_document(case_id, doc_id, status=DocStatus.ERROR, errors=[f"{type(e).__name__}: {e}"])
        finally:
            self._done_one()
