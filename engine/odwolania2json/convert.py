"""Konwersja PDF -> Markdown przez Docling (lokalnie na CPU), z cache na dysku."""

import hashlib
import json
import logging
import os
import re
import threading
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
LAYOUT_VERSION = 3


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
    exclude = {f for f in later if getattr(profile, f) == getattr(default, f)} | {"scanned_bleed_cutoff"}
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
        n_pages = max(_pages_to_convert(profile, scanned), 1)
        # max_num_pages odrzuca dłuższe dokumenty, więc ustawiamy je wysoko,
        # a liczbę przetwarzanych stron ogranicza page_range.
        res = self._converter(profile, ocr_mode).convert(path, max_num_pages=10_000, page_range=(1, n_pages))
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


def remove_bleed_gray(gray: Any, cutoff: int) -> tuple[Any, bool]:
    """Czyści jasnoszary szum/prześwit z odwrotu kartki powyżej `cutoff` do bieli (pomija szary papier >30%)."""
    import numpy as np

    mid_frac = float(((gray > cutoff) & (gray < 240)).mean())
    if mid_frac <= 0.008 or mid_frac >= 0.30:
        return gray, False
    return np.where(gray > cutoff, 255, gray).astype(np.uint8), True


def _render_scan_pages(path: Path, n_pages: int, scale: float) -> list[Any]:
    import cv2
    import pypdfium2 as pdfium

    pdf = pdfium.PdfDocument(str(path))
    pages = []
    try:
        for i in range(min(len(pdf), n_pages)):
            page = pdf[i]
            arr = page.render(scale=scale).to_numpy()
            page.close()
            pages.append(cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY) if arr.ndim == 3 else arr)
    finally:
        pdf.close()
    return pages


_rapid_lock = threading.Lock()
_rapid_ocr: Any = None


def _get_rapidocr() -> Any:
    global _rapid_ocr
    with _rapid_lock:
        if _rapid_ocr is None:
            from rapidocr import RapidOCR

            _rapid_ocr = RapidOCR()
        return _rapid_ocr


def boxes_to_lines(boxes: Any, txts: Any) -> str:
    """Składa ramki RapidOCR w wiersze `etykieta | wartość` z zachowaniem zawiniętych linii kolumny wartości."""
    items = []
    for box, txt in zip(boxes if boxes is not None else (), txts if txts is not None else ()):
        t = (txt or "").strip()
        if not t:
            continue
        ys = [float(pt[1]) for pt in box]
        xs = [float(pt[0]) for pt in box]
        items.append((min(ys), max(ys), min(xs), max(xs), t))
    items.sort(key=lambda x: (x[0], x[2]))

    # Grupowanie w wiersze po pasie Y niezależnie od kolejności X (odporne na lekkie przekrzywienie skanu).
    rows: list[list[Any]] = []  # [y0, y1, [(x0, x1, h, txt), ...]]
    for y0, y1, x0, x1, txt in items:
        h = max(y1 - y0, 1.0)
        yc = 0.5 * (y0 + y1)
        placed = False
        for row in reversed(rows[-4:]):
            ry0, ry1, cells = row
            rh = max(ry1 - ry0, 1.0)
            ryc = 0.5 * (ry0 + ry1)
            ov = min(y1, ry1) - max(y0, ry0)
            if (ov >= 0.35 * min(h, rh) or abs(yc - ryc) <= 0.45 * min(h, rh)) and all(
                x1 <= cx0 + 0.3 * rh or x0 >= cx1 - 0.3 * rh for cx0, cx1, _, _ in cells
            ):
                row[0] = min(ry0, y0)
                row[1] = max(ry1, y1)
                cells.append((x0, x1, h, txt))
                placed = True
                break
        if not placed:
            rows.append([y0, y1, [(x0, x1, h, txt)]])

    rows.sort(key=lambda r: r[0])
    lines: list[str] = []
    prev_val_x0: float | None = None
    prev_y1 = 0.0
    prev_h = 0.0
    for y0, y1, cells in rows:
        cells.sort(key=lambda c: c[0])
        h = max(y1 - y0, 1.0)
        parts = [cells[0][3]]
        val_x0: float | None = None
        for (_, px1, ph, _), (cx0, _cx1, ch, ctxt) in zip(cells, cells[1:]):
            if cx0 - px1 > 0.6 * min(ph, ch):
                parts.append(" | " + ctxt)
                if val_x0 is None:
                    val_x0 = cx0
            else:
                parts.append(" " + ctxt)
        line = "".join(parts)
        mh = max(h, prev_h)
        is_cont = (
            len(cells) == 1
            and prev_val_x0 is not None
            and lines
            and abs(cells[0][0] - prev_val_x0) <= 1.5 * mh
            and -0.6 * mh <= y0 - prev_y1 <= 1.1 * mh
        )
        if is_cont:
            lines[-1] = lines[-1] + " " + line
        else:
            lines.append(line)
            if val_x0 is not None:
                prev_val_x0 = val_x0
            elif not (len(cells) == 1 and prev_val_x0 is not None and abs(cells[0][0] - prev_val_x0) <= 1.5 * mh):
                prev_val_x0 = None
        prev_y1 = y1
        prev_h = h
    return "\n".join(lines)


def rapidocr_pages_text(path: Path, profile: ConversionProfile, bleed_cutoff: int | None = None,
                        upscale_1bit: bool = False) -> tuple[str, bool]:
    """Bezpośredni OCR przez pypdfium2 + RapidOCR z opcjonalnym odcięciem prześwitu i powiększeniem 1-bit."""
    import cv2

    n_pages = max(_pages_to_convert(profile, scanned=True), 1)
    grays = _render_scan_pages(path, n_pages, profile.ocr_scale)
    ocr = _get_rapidocr()
    pages_md: list[str] = []
    bleed_cleaned = False
    for gray in grays:
        if bleed_cutoff:
            gray, changed = remove_bleed_gray(gray, bleed_cutoff)
            bleed_cleaned = bleed_cleaned or changed
        if upscale_1bit and float(((gray > 30) & (gray < 225)).mean()) < 0.02:
            gray = cv2.resize(gray, None, fx=1.5, fy=1.5, interpolation=cv2.INTER_CUBIC)
        res = ocr(gray)
        pages_md.append(boxes_to_lines(res.boxes, res.txts))
    return f"\n\n{PAGE_BREAK}\n\n".join(pages_md), bleed_cleaned


def rapidocr_transfer_text(path: Path, profile: ConversionProfile) -> str:
    """Zapasowy OCR przez pypdfium2 + RapidOCR dla słabych skanów potwierdzeń przelewów."""
    md, _ = rapidocr_pages_text(path, profile, bleed_cutoff=profile.scanned_bleed_cutoff, upscale_1bit=True)
    return md


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
