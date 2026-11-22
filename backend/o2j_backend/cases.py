"""Sprawy wgrane przez GUI, zapisane w plikach (bez bazy danych).

Układ katalogu danych (domyślnie `<repo>/gui-data`, zmienna `O2J_GUI_DATA`):

    sprawy/<id>/case.json                 metadane sprawy i stan dokumentów
    sprawy/<id>/input/<plik>.pdf          wgrane pliki
    sprawy/<id>/output/<plik>.json        wynik silnika, tak jak w ./output z CLI
    sprawy/<id>/trace/<plik>.trace.json   ślad ekstrakcji (źródło każdej wartości)
    sprawy/<id>/markdown/<plik>.md        tekst po konwersji Docling: ten tekst czytają reguły i LLM
    sprawy/<id>/review/<plik>.json        wynik po weryfikacji przez człowieka
    audit.jsonl                           dziennik zdarzeń

Katalogi wejścia i wyjścia CLI (`./input`, `./output`) zostają nietknięte, więc praca w GUI
nie miesza się z przebiegiem oceniającym.
"""

import getpass
import io
import json
import os
import re
import secrets
import shutil
import threading
import unicodedata
import zipfile
from datetime import UTC, datetime
from enum import StrEnum
from pathlib import Path
from typing import Any

from pydantic import BaseModel, Field

from . import REPO_ROOT

MAX_FILE_BYTES = 50 * 1024 * 1024
MAX_ZIP_TOTAL_BYTES = 500 * 1024 * 1024
MAX_FILES_PER_CASE = 200

_CASE_ID_RE = re.compile(r"\d{8}-\d{6}-[0-9a-f]{4}")
_BAD_CHARS = re.compile(r'[\x00-\x1f\x7f<>:"/\\|?*]')
# Nazwy zarezerwowane w Windows (laptop oceniającego): "con.pdf" nie da się zapisać.
_WINDOWS_RESERVED = {"CON", "PRN", "AUX", "NUL", *(f"COM{i}" for i in range(1, 10)), *(f"LPT{i}" for i in range(1, 10))}


def default_data_dir() -> Path:
    return Path(os.environ.get("O2J_GUI_DATA") or REPO_ROOT / "gui-data")


def _now() -> datetime:
    return datetime.now(UTC).replace(microsecond=0)


class CaseError(Exception):
    pass


class DocStatus(StrEnum):
    QUEUED = "queued"
    CONVERTING = "converting"
    EXTRACTING = "extracting"
    DONE = "done"
    UNSUPPORTED = "unsupported"
    ERROR = "error"


PENDING = {DocStatus.QUEUED, DocStatus.CONVERTING, DocStatus.EXTRACTING}


class DocumentRecord(BaseModel):
    id: str
    file_name: str
    size: int
    status: DocStatus = DocStatus.QUEUED
    doc_type: str | None = None
    pages: int | None = None
    scanned: bool | None = None
    release: str | None = None
    errors: list[str] = Field(default_factory=list)
    seconds: float | None = None
    processed_at: datetime | None = None
    reviewed_at: datetime | None = None
    approved_at: datetime | None = None

    @property
    def stem(self) -> str:
        return Path(self.file_name).stem

    @property
    def output_file_name(self) -> str:
        return f"{self.stem}.json"


class CaseRecord(BaseModel):
    id: str
    name: str
    created_at: datetime
    documents: list[DocumentRecord]

    def document(self, doc_id: str) -> DocumentRecord | None:
        return next((d for d in self.documents if d.id == doc_id), None)


# --- pliki wejściowe -----------------------------------------------------------------


def safe_pdf_name(raw: str) -> str:
    """Bezpieczna nazwa pliku: bez katalogów i znaków niedozwolonych w Windows, z rozszerzeniem .pdf."""
    name = unicodedata.normalize("NFC", raw).replace("\\", "/").split("/")[-1]
    name = _BAD_CHARS.sub("_", name).strip().lstrip(".")
    stem, ext = os.path.splitext(name)
    stem = stem.strip().rstrip(".")[:120] or "dokument"
    if stem.upper() in _WINDOWS_RESERVED:
        stem = f"_{stem}"
    return stem + (ext if ext.lower() == ".pdf" else ".pdf")


def _zip_member_name(info: zipfile.ZipInfo) -> str:
    """Nazwa pliku w ZIP. Bez flagi UTF-8 Eksplorator Windows zapisuje nazwy w CP852 (polskie znaki)."""
    if info.flag_bits & 0x800:
        return info.filename
    raw = info.filename.encode("cp437", errors="replace")
    for enc in ("utf-8", "cp852"):
        try:
            return raw.decode(enc)
        except UnicodeDecodeError:
            continue
    return info.filename


def _is_pdf(data: bytes) -> bool:
    return b"%PDF-" in data[:1024]


def collect_pdfs(uploads: list[tuple[str, bytes]]) -> tuple[list[tuple[str, bytes]], list[str]]:
    """PDF-y z wgranych plików i archiwów ZIP oraz opisy odrzuconych plików."""
    accepted: list[tuple[str, bytes]] = []
    rejected: list[str] = []
    for name, data in uploads:
        if name.lower().endswith(".zip"):
            try:
                pdfs, skipped = _extract_zip(data)
            except (zipfile.BadZipFile, CaseError) as e:
                rejected.append(f"{name}: {e}")
                continue
            accepted += pdfs
            rejected += [f"{name}: {s}" for s in skipped]
        elif len(data) > MAX_FILE_BYTES:
            rejected.append(f"{name}: plik większy niż {MAX_FILE_BYTES // 2**20} MB")
        elif not _is_pdf(data):
            rejected.append(f"{name}: to nie jest plik PDF")
        else:
            accepted.append((name, data))
    return accepted, rejected


def _extract_zip(data: bytes) -> tuple[list[tuple[str, bytes]], list[str]]:
    out: list[tuple[str, bytes]] = []
    skipped: list[str] = []
    total = 0
    with zipfile.ZipFile(io.BytesIO(data)) as zf:
        for info in zf.infolist():
            name = _zip_member_name(info)
            if info.is_dir() or name.startswith("__MACOSX/") or Path(name).name.startswith("._"):
                continue
            if not name.lower().endswith(".pdf"):
                skipped.append(f"{name}: pominięty (to nie jest PDF)")
                continue
            with zf.open(info) as f:
                content = f.read(MAX_FILE_BYTES + 1)
            if len(content) > MAX_FILE_BYTES:
                skipped.append(f"{name}: plik większy niż {MAX_FILE_BYTES // 2**20} MB")
                continue
            total += len(content)
            if total > MAX_ZIP_TOTAL_BYTES:
                raise CaseError(f"archiwum po rozpakowaniu przekracza {MAX_ZIP_TOTAL_BYTES // 2**20} MB")
            if not _is_pdf(content):
                skipped.append(f"{name}: to nie jest plik PDF")
                continue
            out.append((name, content))
    return out, skipped


# --- magazyn -------------------------------------------------------------------------


class CaseStore:
    """Sprawy w katalogu na dysku. Metadane trzyma też w pamięci; zapis atomowy, pod blokadą."""

    def __init__(self, root: Path | None = None) -> None:
        self.root = root or default_data_dir()
        self.cases_dir = self.root / "sprawy"
        self.audit_file = self.root / "audit.jsonl"
        self._lock = threading.RLock()
        self._cases: dict[str, CaseRecord] = {}
        self._load()

    def _load(self) -> None:
        if not self.cases_dir.is_dir():
            return
        for meta in self.cases_dir.glob("*/case.json"):
            try:
                record = CaseRecord.model_validate_json(meta.read_text(encoding="utf-8"))
            except ValueError:
                continue
            self._cases[record.id] = record

    # ścieżki
    def case_dir(self, case_id: str) -> Path:
        if not _CASE_ID_RE.fullmatch(case_id):
            raise CaseError(f"niepoprawny identyfikator sprawy {case_id!r}")
        return self.cases_dir / case_id

    def input_path(self, case_id: str, doc: DocumentRecord) -> Path:
        return self.case_dir(case_id) / "input" / doc.file_name

    def output_path(self, case_id: str, doc: DocumentRecord) -> Path:
        return self.case_dir(case_id) / "output" / doc.output_file_name

    def trace_path(self, case_id: str, doc: DocumentRecord) -> Path:
        return self.case_dir(case_id) / "trace" / f"{doc.stem}.trace.json"

    def markdown_path(self, case_id: str, doc: DocumentRecord) -> Path:
        return self.case_dir(case_id) / "markdown" / f"{doc.stem}.md"

    def review_path(self, case_id: str, doc: DocumentRecord) -> Path:
        return self.case_dir(case_id) / "review" / doc.output_file_name

    # odczyt
    def list(self) -> list[CaseRecord]:
        with self._lock:
            records = [r.model_copy(deep=True) for r in self._cases.values()]
        return sorted(records, key=lambda r: (r.created_at, r.id), reverse=True)

    def get(self, case_id: str) -> CaseRecord | None:
        with self._lock:
            record = self._cases.get(case_id)
            return record.model_copy(deep=True) if record else None

    def read_json(self, path: Path) -> Any:
        if not path.is_file():
            return None
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except ValueError:
            return None

    # zapis
    def _save(self, record: CaseRecord) -> None:
        d = self.case_dir(record.id)
        d.mkdir(parents=True, exist_ok=True)
        tmp = d / "case.json.tmp"
        tmp.write_text(record.model_dump_json(indent=2) + "\n", encoding="utf-8")
        tmp.replace(d / "case.json")

    def create(self, name: str, pdfs: list[tuple[str, bytes]]) -> CaseRecord:
        if not pdfs:
            raise CaseError("brak plików PDF do przetworzenia")
        if len(pdfs) > MAX_FILES_PER_CASE:
            raise CaseError(f"za dużo plików w jednej sprawie (limit {MAX_FILES_PER_CASE})")
        with self._lock:
            case_id = f"{datetime.now():%Y%m%d-%H%M%S}-{secrets.token_hex(2)}"
            while case_id in self._cases:
                case_id = f"{datetime.now():%Y%m%d-%H%M%S}-{secrets.token_hex(2)}"
            input_dir = self.case_dir(case_id) / "input"
            input_dir.mkdir(parents=True)
            docs: list[DocumentRecord] = []
            used: set[str] = set()
            for raw_name, data in pdfs:
                file_name = safe_pdf_name(raw_name)
                stem, ext = os.path.splitext(file_name)
                n = 2
                while stem.lower() in used:
                    stem = f"{os.path.splitext(file_name)[0]} ({n})"
                    n += 1
                used.add(stem.lower())
                file_name = stem + ext
                (input_dir / file_name).write_bytes(data)
                docs.append(DocumentRecord(id=stem, file_name=file_name, size=len(data)))
            record = CaseRecord(
                id=case_id, name=name.strip()[:200] or f"Sprawa {case_id}", created_at=_now(), documents=docs
            )
            self._save(record)
            self._cases[case_id] = record
        self.audit("sprawa_utworzona", case_id, documents=len(docs))
        return record.model_copy(deep=True)

    def update_document(self, case_id: str, doc_id: str, **changes: Any) -> DocumentRecord | None:
        """Zmienia pola dokumentu; None, gdy sprawę w międzyczasie usunięto."""
        with self._lock:
            record = self._cases.get(case_id)
            doc = record.document(doc_id) if record else None
            if record is None or doc is None:
                return None
            for k, v in changes.items():
                setattr(doc, k, v)
            self._save(record)
            return doc.model_copy(deep=True)

    def write_file(self, path: Path, text: str) -> None:
        with self._lock:
            if not path.parents[1].is_dir():  # sprawa usunięta w trakcie przetwarzania
                return
            path.parent.mkdir(parents=True, exist_ok=True)
            tmp = path.with_name(path.name + ".tmp")
            tmp.write_text(text, encoding="utf-8")
            tmp.replace(path)

    def delete(self, case_id: str) -> bool:
        with self._lock:
            if case_id not in self._cases:
                return False
            shutil.rmtree(self.case_dir(case_id), ignore_errors=True)
            del self._cases[case_id]
        self.audit("sprawa_usunieta", case_id)
        return True

    # dziennik
    def audit(self, event: str, case_id: str | None = None, document: str | None = None, **data: Any) -> None:
        entry = {"at": _now().isoformat(), "event": event, "user": _user(), "case_id": case_id,
                 "document": document, **data}
        with self._lock:
            self.root.mkdir(parents=True, exist_ok=True)
            with self.audit_file.open("a", encoding="utf-8") as f:
                f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    def audit_entries(self, limit: int = 200) -> list[dict[str, Any]]:
        if not self.audit_file.is_file():
            return []
        lines = self.audit_file.read_text(encoding="utf-8").splitlines()
        out = []
        for line in reversed(lines):
            try:
                out.append(json.loads(line))
            except ValueError:
                continue
            if len(out) >= limit:
                break
        return out


def _user() -> str:
    try:
        return getpass.getuser()
    except (OSError, KeyError):
        return "nieznany"
