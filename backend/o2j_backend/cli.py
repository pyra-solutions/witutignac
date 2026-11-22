"""Polecenia backendu: publikacja i aktywacja wydań konfiguracji, lista wydań, serwer API i GUI."""

import argparse
import getpass
import sys
from pathlib import Path

from . import REPO_ROOT

BACKEND_DIR = Path(__file__).resolve().parents[1]


def _display(path: Path) -> str:
    path = path.resolve()
    return str(path.relative_to(REPO_ROOT)) if path.is_relative_to(REPO_ROOT) else str(path)


def cmd_publish(a: argparse.Namespace) -> int:
    from .releases import ConfigFiles, publish

    files = ConfigFiles()
    r = publish(files, a.version, summary=a.summary, author=a.author, activate=not a.no_activate)
    print(f"Opublikowano wydanie {r.version} (sha256 {r.sha256[:12]}) w {_display(files.releases_dir)}.")
    if not a.no_activate:
        print(f"Aktywne wydanie zapisane do {_display(files.active_file)}.")
    return 0


def cmd_activate(a: argparse.Namespace) -> int:
    from .releases import ConfigFiles, activate_release

    files = ConfigFiles()
    r = activate_release(files, a.version)
    print(f"Aktywne wydanie: {r.version}, zapisane do {_display(files.active_file)}.")
    return 0


def cmd_releases(_: argparse.Namespace) -> int:
    from .releases import ConfigFiles, list_releases

    rows = list_releases(ConfigFiles())
    if not rows:
        print("Brak wydań. Utwórz pierwsze: publish --version <wersja>")
    for r, status in rows:
        print(f"{r.version:<24} {status.value:<8} {r.created_at.astimezone():%Y-%m-%d %H:%M}  {r.sha256[:12]}  {r.summary}")
    return 0


def cmd_serve(a: argparse.Namespace) -> int:
    import logging
    import threading
    import webbrowser

    import uvicorn

    # Komunikaty silnika (konwersja, klucz API, LLM) na konsoli, tak jak w CLI.
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s", datefmt="%H:%M:%S")
    for noisy in ("docling", "httpx", "RapidOCR", "rapidocr", "transformers", "huggingface_hub"):
        logging.getLogger(noisy).setLevel(logging.WARNING)
    url = f"http://{'127.0.0.1' if a.host in ('0.0.0.0', '::') else a.host}:{a.port}/"
    print(f"Interfejs: {url}  (API: {url}docs). Zatrzymanie: Ctrl+C.", flush=True)
    if a.open:
        threading.Timer(2.0, webbrowser.open, [url]).start()
    uvicorn.run(
        "o2j_backend.api:app",
        host=a.host,
        port=a.port,
        reload=a.reload,
        reload_dirs=[str(BACKEND_DIR / "o2j_backend"), str(REPO_ROOT / "engine" / "odwolania2json")] if a.reload else None,
    )
    return 0


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="manage.py", description="Backend Odwołania2json")
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("publish", help="opublikuj konfigurację z config/seed jako niezmienne wydanie")
    s.add_argument("--version", required=True)
    s.add_argument("--summary", default="")
    s.add_argument("--author", default=getpass.getuser())
    s.add_argument("--no-activate", action="store_true", help="nie zmieniaj engine/config/release.json")
    s.set_defaults(fn=cmd_publish)

    s = sub.add_parser("activate", help="aktywuj istniejące wydanie (także wycofanie zmian)")
    s.add_argument("--version", required=True)
    s.set_defaults(fn=cmd_activate)

    s = sub.add_parser("releases", help="lista wydań")
    s.set_defaults(fn=cmd_releases)

    s = sub.add_parser("serve", help="uruchom API (uvicorn)")
    s.add_argument("--host", default="127.0.0.1")
    s.add_argument("--port", type=int, default=8000)
    s.add_argument("--reload", action="store_true", help="restart po zmianie kodu (praca lokalna)")
    s.add_argument("--open", action="store_true", help="otwórz interfejs w przeglądarce po starcie")
    s.set_defaults(fn=cmd_serve)

    a = p.parse_args(argv)
    from .releases import ReleaseError

    try:
        return a.fn(a)
    except ReleaseError as e:
        print(f"Błąd: {e}", file=sys.stderr)
        return 1
