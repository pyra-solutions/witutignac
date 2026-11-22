"""Interfejs wiersza poleceń: run, evaluate, build-release, validate-config, plugins, doctor."""

import argparse
import json
import logging
import os
import sys
import time
from pathlib import Path

ENGINE_DIR = Path(__file__).resolve().parents[1]
REPO_DIR = ENGINE_DIR.parent
DEFAULT_RELEASE = ENGINE_DIR / "config" / "release.json"
DEFAULT_SEED = REPO_DIR / "config" / "seed"


def _default_config() -> Path:
    return DEFAULT_RELEASE if DEFAULT_RELEASE.exists() else DEFAULT_SEED


def _cache_dir(arg: str | None) -> Path | None:
    v = arg or os.environ.get("O2J_CACHE_DIR") or str(REPO_DIR / ".o2j-cache")
    return None if v.lower() == "none" else Path(v)


def _load(config: str | None):  # noqa: ANN202
    from odwolania2json.config import load_release

    path = Path(config) if config else _default_config()
    return load_release(path), path


def _workers_arg(v: str) -> int:
    if v.isdigit() and int(v) >= 1:
        return int(v)
    raise argparse.ArgumentTypeError("podaj liczbę procesów (1, 2, …)")


def cmd_run(a: argparse.Namespace) -> int:
    from odwolania2json import normalizers, validators  # noqa: F401 — rejestracja wtyczek
    from odwolania2json.pipeline import Engine

    release, path = _load(a.config)
    if a.llm_profile:
        release.llm_profile(a.llm_profile)  # sprawdza, czy profil istnieje
        release.settings.default_llm_profile = a.llm_profile
    logging.getLogger(__name__).info("Konfiguracja: %s (wydanie %s, %s)", path, release.version,
                                     release.fingerprint())
    t0 = time.perf_counter()
    engine = Engine(release, _cache_dir(a.cache), use_llm=not a.no_llm)
    summary = engine.run(Path(a.input), Path(a.output), Path(a.trace_dir) if a.trace_dir else None,
                         workers=a.workers)
    errs = [s for s in summary if s["errors"]]
    unsupported = sum(1 for s in summary if s["doc_type"] is None)
    print(f"Gotowe: {len(summary)} dokumentów w {time.perf_counter() - t0:.0f} s; "
          f"nieobsługiwane: {unsupported}; z błędami: {len(errs)}. Wyniki: {a.output}")
    for s in errs:
        print(f"  {s['file']}: {'; '.join(s['errors'])}", file=sys.stderr)
    return 0


def cmd_evaluate(a: argparse.Namespace) -> int:
    from odwolania2json.evaluate import evaluate, format_report

    name_map = dict(m.split("=", 1) for m in a.map)
    rep = evaluate(Path(a.pred), Path(a.gold), name_map)
    print(format_report(rep, a.worst))
    if a.errors:
        Path(a.errors).write_text(json.dumps(rep.errors, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"\nSzczegóły błędów: {a.errors}")
    return 0


def cmd_build_release(a: argparse.Namespace) -> int:
    from odwolania2json.config import build_from_seed

    rel = build_from_seed(Path(a.seed))
    _check(rel)
    out = Path(a.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(rel.model_dump(mode="json"), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wydanie {rel.version} ({rel.fingerprint()}) zapisane do {out}")
    return 0


def cmd_validate(a: argparse.Namespace) -> int:
    rel, path = _load(a.config)
    _check(rel)
    n = sum(len(d.fields) for d in rel.document_types)
    print(f"Konfiguracja {path} jest poprawna: {len(rel.document_types)} typów dokumentów, {n} pól.")
    return 0


def _check(rel) -> None:  # noqa: ANN001
    """Sprawdza odwołania: wtyczki, sekcje, słowniki, grupy, regexy, schemat drzewa (config.config_problems)."""
    from odwolania2json.config import config_problems

    problems = config_problems(rel)
    if problems:
        raise SystemExit("Błędy konfiguracji:\n  " + "\n  ".join(problems))


def cmd_plugins(_a: argparse.Namespace) -> int:
    from odwolania2json import normalizers, validators  # noqa: F401
    from odwolania2json.registry import normalizers as nreg
    from odwolania2json.registry import validators as vreg

    print("Normalizatory:", ", ".join(nreg.names()))
    print("Walidatory:   ", ", ".join(vreg.names()))
    return 0


def cmd_doctor(a: argparse.Namespace) -> int:
    from odwolania2json.doctor import run

    return run(REPO_DIR, Path(a.report), api=not a.no_api, convert=not a.no_convert)


def main(argv: list[str] | None = None) -> int:
    from odwolania2json.llm import load_dotenv

    load_dotenv(Path.cwd() / ".env")
    load_dotenv(REPO_DIR / ".env")

    ap = argparse.ArgumentParser(prog="odwolania2json", description="Ekstrakcja danych z odwołań KIO do JSON.")
    ap.add_argument("-v", "--verbose", action="store_true")
    sub = ap.add_subparsers(dest="cmd", required=True)

    r = sub.add_parser("run", help="przetwórz katalog input/ do output/")
    r.add_argument("--input", default=str(REPO_DIR / "input"))
    r.add_argument("--output", default=str(REPO_DIR / "output"))
    r.add_argument("--config", help="release.json albo katalog seed (domyślnie engine/config/release.json)")
    r.add_argument("--cache", help="katalog cache ('none' wyłącza); domyślnie .o2j-cache")
    r.add_argument("--trace-dir", help="katalog na ślady ekstrakcji (*.trace.json)")
    r.add_argument("--no-llm", action="store_true", help="tylko reguły, bez wywołań LLM")
    r.add_argument("--llm-profile", help="profil LLM z konfiguracji zamiast domyślnego (np. eden-ministral-8b)")
    r.add_argument("--workers", type=_workers_arg,
                   help="liczba procesów konwersji (domyślnie settings.convert_workers z konfiguracji, zwykle 1)")
    r.set_defaults(fn=cmd_run)

    e = sub.add_parser("evaluate", help="F1 względem plików wzorcowych")
    e.add_argument("--pred", default=str(REPO_DIR / "output"))
    e.add_argument("--gold", required=True)
    e.add_argument("--map", nargs="*", default=["potwierdzenie_przelewu=przelew"],
                   help="nazwa pliku wejściowego=nazwa pliku wzorca")
    e.add_argument("--worst", type=int, default=25)
    e.add_argument("--errors", help="zapisz listę błędów do pliku JSON")
    e.set_defaults(fn=cmd_evaluate)

    b = sub.add_parser("build-release", help="zbuduj release.json z plików YAML")
    b.add_argument("--seed", default=str(DEFAULT_SEED))
    b.add_argument("--out", default=str(DEFAULT_RELEASE))
    b.set_defaults(fn=cmd_build_release)

    v = sub.add_parser("validate-config", help="sprawdź poprawność konfiguracji")
    v.add_argument("--config")
    v.set_defaults(fn=cmd_validate)

    p = sub.add_parser("plugins", help="lista normalizatorów i walidatorów")
    p.set_defaults(fn=cmd_plugins)

    d = sub.add_parser("doctor", help="diagnostyka środowiska, klucza API i Docling (raport bez wartości klucza)")
    d.add_argument("--report", default=str(REPO_DIR / "diagnoza.txt"), help="plik raportu")
    d.add_argument("--no-api", action="store_true", help="bez próbnego zapytania do API LLM")
    d.add_argument("--no-convert", action="store_true", help="bez próbnej konwersji PDF przez Docling")
    d.set_defaults(fn=cmd_doctor)

    a = ap.parse_args(argv)
    logging.basicConfig(level=logging.DEBUG if a.verbose else logging.INFO,
                        format="%(asctime)s %(levelname)s %(message)s", datefmt="%H:%M:%S", stream=sys.stderr)
    for noisy in ("docling", "httpx", "RapidOCR", "rapidocr", "transformers", "huggingface_hub"):
        logging.getLogger(noisy).setLevel(logging.WARNING)
    return a.fn(a)
