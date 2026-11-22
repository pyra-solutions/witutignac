"""Konwersja PDF -> Markdown przez Docling (lokalnie na CPU), z cache na dysku."""

import hashlib
import json
import logging
import os
import re
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from odwolania2json.config import ConversionProfile
from odwolania2json.layout import reorder_label_columns
from odwolania2json.textutil import PAGE_BREAK

log = logging.getLogger(__name__)

GRADES = ["poor", "fair", "good", "excellent"]
# Wersja algorytmu kolejności w layout.py. Zmiana algorytmu = nowa wersja, żeby cache nie zwracał
# Markdownu ułożonego poprzednią wersją.
LAYOUT_VERSION = 2


@dataclass
class Converted:
    markdown: str
    pages: int
    sha256: str
    low_grade: str | None = None
    mean_grade: str | None = None
    scanned: bool = False
    ocr_mode: str = "default"
    seconds: float = 0.0
    from_cache: bool = False
    notes: list[str] = field(default_factory=list)
    # Surowa warstwa tekstowa PDF (pypdfium2). Docling zamienia półpauzy na łączniki,
    # więc z tego tekstu przywracamy oryginalną typografię wartości.
    raw_text: str = ""


def _profile_key(profile: ConversionProfile, scanned: bool = True) -> str:
    """Profil do klucza cache. Pola dodane później pomijamy, gdy mają wartość domyślną,
    żeby wcześniejsze konwersje pozostały ważne. Opcje dotyczące tylko skanów nie zmieniają
    klucza dokumentów z warstwą tekstową."""
    later = {"ocr_scale", "ocr_model_size", "scanned_label_columns", "scanned_max_pages"}
    default = ConversionProfile()
    exclude = {f for f in later if getattr(profile, f) == getattr(default, f)}
    if not scanned:
        exclude.update({"scanned_label_columns", "scanned_max_pages"})
    key = profile.model_dump_json(exclude=exclude)
    if scanned and profile.scanned_label_columns:
        key += f"|layout{LAYOUT_VERSION}"
    return key


def _pages_to_convert(profile: ConversionProfile, scanned: bool) -> int:
    """Liczba pierwszych stron do konwersji: dla skanów `scanned_max_pages`, jeśli ustawione."""
    if scanned and profile.scanned_max_pages:
        return min(profile.max_pages, profile.scanned_max_pages)
    return profile.max_pages


def _sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def text_layer(path: Path, max_pages: int) -> tuple[str, int]:
    """Warstwa tekstowa pierwszych stron PDF i liczba tych stron (pusta dla skanów)."""
    import pypdfium2 as pdfium

    pdf = pdfium.PdfDocument(str(path))
    try:
        n = min(len(pdf), max_pages)
        parts = []
        for i in range(n):
            page = pdf[i]
            tp = page.get_textpage()
            parts.append(tp.get_text_range())
            tp.close()
            page.close()
        return "\n".join(parts), n
    finally:
        pdf.close()


def restore_dashes(value: str, raw: str) -> str:
    """Przywraca półpauzy/pauzy, które Docling zamienił na łącznik, jeśli wartość jest w tekście PDF."""
    if "-" not in value or not raw:
        return value
    pat = []
    for ch in value:
        if ch == "-":
            pat.append("([-–—])")
        elif ch.isspace():
            pat.append(r"\s+")
        else:
            pat.append(re.escape(ch))
    m = re.search("".join(pat), raw)
    if not m:
        return value
    dashes = iter(m.groups())
    return "".join(next(dashes) if ch == "-" else ch for ch in value)


class DoclingConverter:
    """Opakowanie konwertera Docling. Modele ładują się raz na proces."""

    SCAN_CHARS_PER_PAGE = 80

    def __init__(self, cache_dir: Path | None) -> None:
        self.cache_dir = cache_dir
        self._converters: dict[str, Any] = {}

    def _version(self) -> str:
        from importlib.metadata import version

        return version("docling")

    def _converter(self, profile: ConversionProfile, ocr_mode: str) -> Any:
        key = f"{profile.model_dump_json()}|{ocr_mode}"
        if key in self._converters:
            return self._converters[key]
        from docling.datamodel.accelerator_options import AcceleratorDevice, AcceleratorOptions
        from docling.datamodel.base_models import InputFormat
        from docling.datamodel.pipeline_options import (
            OcrMode,
            PdfPipelineOptions,
            RapidOcrOptions,
            TesseractCliOcrOptions,
        )
        from docling.document_converter import DocumentConverter, PdfFormatOption

        mode = OcrMode.FULL_PAGE if ocr_mode == "full_page" else OcrMode.DEFAULT
        if profile.ocr_engine == "tesseract":
            ocr = TesseractCliOcrOptions(lang=profile.ocr_lang, mode=mode,
                                         replace_broken_text_layer=profile.replace_broken_text_layer)
        else:
            ocr = RapidOcrOptions(lang=profile.ocr_lang, mode=mode,
                                  replace_broken_text_layer=profile.replace_broken_text_layer,
                                  scale=profile.ocr_scale, model_size=profile.ocr_model_size)
        opts = PdfPipelineOptions(
            do_ocr=True,
            ocr_options=ocr,
            do_table_structure=profile.table_structure,
            accelerator_options=AcceleratorOptions(num_threads=profile.num_threads, device=AcceleratorDevice.CPU),
            document_timeout=profile.document_timeout_s,
        )
        conv = DocumentConverter(format_options={InputFormat.PDF: PdfFormatOption(pipeline_options=opts)})
        self._converters[key] = conv
        return conv

    def convert(self, path: Path, profile: ConversionProfile) -> Converted:
        sha = _sha256(path)
        raw, n_pages = text_layer(path, profile.max_pages)
        scanned = len(raw.strip()) / max(n_pages, 1) < self.SCAN_CHARS_PER_PAGE
        ocr_mode = profile.ocr_mode
        if scanned and profile.scanned_ocr_mode:
            ocr_mode = profile.scanned_ocr_mode
        ckey = hashlib.sha256(
            f"{sha}|{self._version()}|{_profile_key(profile, scanned)}|{ocr_mode}".encode()
        ).hexdigest()[:32]
        cached = self._load_cache(ckey)
        if cached:
            cached.from_cache = True
            cached.raw_text = raw
            return cached

        t0 = time.perf_counter()
        # max_num_pages odrzuca dłuższe dokumenty, więc ustawiamy je wysoko,
        # a liczbę przetwarzanych stron ogranicza page_range.
        res = self._converter(profile, ocr_mode).convert(path, max_num_pages=10_000,
                                                        page_range=(1, max(_pages_to_convert(profile, scanned), 1)))
        reorder = scanned and profile.scanned_label_columns
        out = self._export(res.document, res.confidence, sha, scanned, ocr_mode, reorder)
        out.seconds = time.perf_counter() - t0
        self._save_cache(ckey, out)
        out.raw_text = raw
        return out

    @staticmethod
    def _export(doc: Any, conf: Any, sha: str, scanned: bool, ocr_mode: str, reorder: bool = False) -> Converted:
        md, notes = export_markdown(doc, reorder)
        def grade(g: Any) -> str | None:
            if g is None:
                return None
            return str(getattr(g, "value", g)).lower()

        return Converted(markdown=md, pages=len(doc.pages), sha256=sha,
                         low_grade=grade(getattr(conf, "low_grade", None)),
                         mean_grade=grade(getattr(conf, "mean_grade", None)),
                         scanned=scanned, ocr_mode=ocr_mode, notes=notes)

    def _load_cache(self, key: str) -> Converted | None:
        if not self.cache_dir:
            return None
        p = self.cache_dir / "convert" / f"{key}.json"
        if not p.exists():
            return None
        try:
            return Converted(**json.loads(p.read_text(encoding="utf-8")))
        except (OSError, ValueError, TypeError):
            log.warning("uszkodzony wpis cache %s, konwertuję ponownie", p)
            return None

    def _save_cache(self, key: str, conv: Converted) -> None:
        if not self.cache_dir:
            return
        p = self.cache_dir / "convert" / f"{key}.json"
        p.parent.mkdir(parents=True, exist_ok=True)
        tmp = p.with_suffix(f".{os.getpid()}.tmp")  # osobny plik dla każdego procesu konwersji
        tmp.write_text(json.dumps(conv.__dict__, ensure_ascii=False), encoding="utf-8")
        tmp.replace(p)


def export_markdown(doc: Any, reorder: bool = False) -> tuple[str, list[str]]:
    """Markdown z dokumentu Docling; przy `reorder` najpierw poprawia kolejność par etykieta–wartość
    (layout.reorder_label_columns). Zwraca też opis tych zmian."""
    from docling_core.types.doc import ContentLayer

    notes = reorder_label_columns(doc) if reorder else []
    md = doc.export_to_markdown(
        included_content_layers={ContentLayer.BODY, ContentLayer.FURNITURE},
        page_break_placeholder=PAGE_BREAK,
        escape_underscores=False,
        escape_html=False,
        traverse_pictures=True,
    )
    return md, notes


def page_count(path: Path, max_pages: int) -> int:
    """Liczba stron do konwersji (do kolejności w puli procesów: najdłuższe dokumenty najpierw)."""
    try:
        import pypdfium2 as pdfium

        pdf = pdfium.PdfDocument(str(path))
        try:
            return min(len(pdf), max_pages)
        finally:
            pdf.close()
    except Exception:  # uszkodzony plik: błąd zgłosi konwersja
        return 0


# --- konwersja w osobnych procesach (pipeline.Engine.run, settings.convert_workers) ---------------------
# Każdy proces ładuje własne modele Docling (ok. 2 GB RAM) i konwertuje kolejne dokumenty.

_worker: DoclingConverter | None = None


def worker_init(cache_dir: str | None) -> None:
    global _worker
    logging.basicConfig(level=logging.WARNING)
    for noisy in ("docling", "RapidOCR", "rapidocr", "transformers", "huggingface_hub"):
        logging.getLogger(noisy).setLevel(logging.WARNING)
    _worker = DoclingConverter(Path(cache_dir) if cache_dir else None)


def worker_convert(pdf: str, profile_json: str) -> Converted:
    assert _worker is not None, "worker_init nie został wywołany"
    return _worker.convert(Path(pdf), ConversionProfile.model_validate_json(profile_json))
