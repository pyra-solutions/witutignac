"""Konwersja PDF -> Markdown przez Docling (lokalnie na CPU), z cache na dysku."""

import hashlib
import json
import logging
import re
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from odwolania2json.config import ConversionProfile
from odwolania2json.textutil import PAGE_BREAK

log = logging.getLogger(__name__)

GRADES = ["poor", "fair", "good", "excellent"]


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


def _profile_key(profile: ConversionProfile) -> str:
    """Profil do klucza cache. Pola dodane później pomijamy, gdy mają wartość domyślną,
    żeby wcześniejsze konwersje pozostały ważne."""
    later = {"ocr_scale", "ocr_model_size"}
    default = ConversionProfile()
    exclude = {f for f in later if getattr(profile, f) == getattr(default, f)}
    return profile.model_dump_json(exclude=exclude)


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
            f"{sha}|{self._version()}|{_profile_key(profile)}|{ocr_mode}".encode()
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
                                                        page_range=(1, max(profile.max_pages, 1)))
        out = self._export(res, sha, scanned, ocr_mode)
        out.seconds = time.perf_counter() - t0
        self._save_cache(ckey, out)
        out.raw_text = raw
        return out

    @staticmethod
    def _export(res: Any, sha: str, scanned: bool, ocr_mode: str) -> Converted:
        from docling_core.types.doc import ContentLayer

        doc = res.document
        md = doc.export_to_markdown(
            included_content_layers={ContentLayer.BODY, ContentLayer.FURNITURE},
            page_break_placeholder=PAGE_BREAK,
            escape_underscores=False,
            escape_html=False,
            traverse_pictures=True,
        )
        conf = res.confidence
        def grade(g: Any) -> str | None:
            if g is None:
                return None
            return str(getattr(g, "value", g)).lower()

        return Converted(markdown=md, pages=len(doc.pages), sha256=sha,
                         low_grade=grade(conf.low_grade), mean_grade=grade(conf.mean_grade),
                         scanned=scanned, ocr_mode=ocr_mode)

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
        tmp = p.with_suffix(".tmp")
        tmp.write_text(json.dumps(conv.__dict__, ensure_ascii=False), encoding="utf-8")
        tmp.replace(p)
