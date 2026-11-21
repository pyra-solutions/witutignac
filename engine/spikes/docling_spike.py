"""Spike: Docling (CPU) -> Markdown on KIO training cases.

Usage: python engine/spikes/docling_spike.py <dane_dir> <out_dir> <case> [<case> ...]

For each case: converts the 3 original PDFs and a simulated scan of each
(rasterised at 150 dpi, greyscale, rotated 0.7 deg, saved as image-only PDF).
Measures time, Docling confidence grades and how many ground-truth string
values appear verbatim (after light normalisation) in the default vs tuned
Markdown export.
"""

import json
import re
import sys
import time
from pathlib import Path

import pypdfium2 as pdfium
from docling.datamodel.accelerator_options import AcceleratorDevice, AcceleratorOptions
from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions, RapidOcrOptions
from docling.document_converter import DocumentConverter, PdfFormatOption
from docling_core.types.doc import ContentLayer

PAGE_BREAK = "<!-- page break -->"
GT_FOR = {"odwolanie": "odwolanie.json", "pelnomocnictwo": "pelnomocnictwo.json", "potwierdzenie_przelewu": "przelew.json"}
SKIP_KEYS = {"czynnosc_powod_id", "czynnosc_opis", "przez-pelnomocnika", "prowadzacy_postepowanie", "typ", "kwota"}
ISO_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def build_converter() -> DocumentConverter:
    opts = PdfPipelineOptions(
        do_ocr=True,
        ocr_options=RapidOcrOptions(lang=["pl"], replace_broken_text_layer=True),
        do_table_structure=True,
        accelerator_options=AcceleratorOptions(num_threads=4, device=AcceleratorDevice.CPU),
        document_timeout=180,
    )
    return DocumentConverter(format_options={InputFormat.PDF: PdfFormatOption(pipeline_options=opts)})


def make_scan(src: Path, dst: Path) -> None:
    pdf = pdfium.PdfDocument(str(src))
    pages = []
    for page in pdf:
        img = page.render(scale=150 / 72).to_pil().convert("L").rotate(0.7, expand=True, fillcolor=255)
        pages.append(img)
    pages[0].save(dst, format="PDF", save_all=True, append_images=pages[1:], resolution=150)


def leaves(obj, key=None):
    if isinstance(obj, dict):
        for k, v in obj.items():
            yield from leaves(v, k)
    elif isinstance(obj, list):
        for v in obj:
            yield from leaves(v, key)
    elif obj is not None and key not in SKIP_KEYS:
        s = str(obj)
        if not ISO_DATE.match(s):
            yield key, s


def norm(s: str) -> str:
    s = s.casefold().replace("„", '"').replace("”", '"').replace("–", "-").replace("\\_", "_")
    return re.sub(r"\s+", "", s)


def coverage(gt: dict, md: str) -> tuple[int, int, list[str]]:
    hay = norm(md)
    found, total, missing = 0, 0, []
    for key, val in leaves(gt):
        total += 1
        if norm(val) in hay:
            found += 1
        else:
            missing.append(f"{key}={val}")
    return found, total, missing


def main() -> None:
    dane, out = Path(sys.argv[1]), Path(sys.argv[2])
    cases = sys.argv[3:]
    out.mkdir(parents=True, exist_ok=True)
    t0 = time.perf_counter()
    conv = build_converter()
    conv.initialize_pipeline(InputFormat.PDF)
    report = {"init_s": round(time.perf_counter() - t0, 1), "docs": []}

    for case in cases:
        cdir = dane / case
        cout = out / case
        cout.mkdir(exist_ok=True)
        for stem, gt_name in GT_FOR.items():
            gt = json.loads((cdir / gt_name).read_text(encoding="utf-8"))
            scan = cout / f"{stem}__skan.pdf"
            make_scan(cdir / f"{stem}.pdf", scan)
            for variant, path in (("cyfrowy", cdir / f"{stem}.pdf"), ("skan", scan)):
                t = time.perf_counter()
                res = conv.convert(path, max_num_pages=10)
                dt = time.perf_counter() - t
                doc = res.document
                md_default = doc.export_to_markdown()
                md_tuned = doc.export_to_markdown(
                    included_content_layers={ContentLayer.BODY, ContentLayer.FURNITURE},
                    page_break_placeholder=PAGE_BREAK,
                    escape_underscores=False,
                    escape_html=False,
                    traverse_pictures=True,
                )
                tag = f"{stem}.{variant}"
                (cout / f"{tag}.default.md").write_text(md_default, encoding="utf-8")
                (cout / f"{tag}.tuned.md").write_text(md_tuned, encoding="utf-8")
                fd, tot, _ = coverage(gt, md_default)
                ft, _, miss = coverage(gt, md_tuned)
                conf = res.confidence
                row = {
                    "case": case,
                    "doc": stem,
                    "variant": variant,
                    "pages": len(doc.pages),
                    "seconds": round(dt, 2),
                    "mean_grade": str(conf.mean_grade).split(".")[-1],
                    "low_grade": str(conf.low_grade).split(".")[-1],
                    "furniture_items": sum(1 for _ in doc.iterate_items(included_content_layers={ContentLayer.FURNITURE})),
                    "values_total": tot,
                    "found_default": fd,
                    "found_tuned": ft,
                    "missing_tuned": miss,
                }
                report["docs"].append(row)
                print(json.dumps(row, ensure_ascii=False), flush=True)

    import resource

    report["peak_rss_mb"] = round(resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024)
    print(json.dumps({"peak_rss_mb": report["peak_rss_mb"], "init_s": report["init_s"]}), flush=True)
    (out / "report.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
    main()
