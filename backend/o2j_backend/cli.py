"""Polecenia backendu: migracje, seed z YAML, eksport, publikacja i aktywacja wydań, serwer API."""

import argparse
import getpass
import sys
from pathlib import Path

from . import REPO_ROOT

BACKEND_DIR = Path(__file__).resolve().parents[1]
DEFAULT_SEED_DIR = REPO_ROOT / "config" / "seed"


def _alembic_config():
    from alembic.config import Config

    return Config(str(BACKEND_DIR / "alembic.ini"))


def _display(path: Path) -> str:
    path = path.resolve()
    return str(path.relative_to(REPO_ROOT)) if path.is_relative_to(REPO_ROOT) else str(path)


def cmd_migrate(a: argparse.Namespace) -> int:
    from alembic import command

    command.upgrade(_alembic_config(), a.revision)
    return 0


def cmd_downgrade(a: argparse.Namespace) -> int:
    from alembic import command

    command.downgrade(_alembic_config(), a.revision)
    return 0


def cmd_seed(a: argparse.Namespace) -> int:
    from .config_store import import_release, load_seed
    from .db import session_scope
    from .releases import list_releases, publish

    seed_dir = Path(a.seed_dir)
    release, providers = load_seed(seed_dir)
    with session_scope() as s:
        counts = import_release(s, release, providers)
        print(f"Zaimportowano konfigurację z {_display(seed_dir)}:", ", ".join(f"{k}={v}" for k, v in counts.items()))
        if a.no_publish:
            return 0
        if not list_releases(s):
            r = publish(s, release.version, summary=f"Konfiguracja startowa z {_display(seed_dir)}", author="seed")
            print(f"Opublikowano i aktywowano wydanie {r.version} (sha256 {r.sha256[:12]}).")
        else:
            print("Wydania już istnieją; nowe opublikujesz poleceniem: publish --version <wersja>")
    return 0


def cmd_export(a: argparse.Namespace) -> int:
    from .config_store import export_release
    from .db import session_scope
    from .releases import release_file_text, write_release_file

    with session_scope() as s:
        snapshot = export_release(s, a.version).model_dump(mode="json")
    if a.out:
        write_release_file(snapshot, Path(a.out))
        print(f"Zapisano {a.out}", file=sys.stderr)
    else:
        sys.stdout.write(release_file_text(snapshot))
    return 0


def cmd_publish(a: argparse.Namespace) -> int:
    from .db import session_scope
    from .releases import publish, write_release_file

    with session_scope() as s:
        r = publish(s, a.version, summary=a.summary, author=a.author, activate=not a.no_activate)
        print(f"Opublikowano wydanie {r.version} ({r.status.value}, sha256 {r.sha256[:12]}).")
        if a.out:
            write_release_file(r.snapshot, Path(a.out))
            print(f"Zapisano {a.out}")
    return 0


def cmd_activate(a: argparse.Namespace) -> int:
    from .db import session_scope
    from .releases import activate_release, write_release_file

    with session_scope() as s:
        r = activate_release(s, a.version)
        print(f"Aktywne wydanie: {r.version}")
        if a.out:
            write_release_file(r.snapshot, Path(a.out))
            print(f"Zapisano {a.out}")
    return 0


def cmd_releases(_: argparse.Namespace) -> int:
    from .db import session_scope
    from .releases import list_releases

    with session_scope() as s:
        rows = list_releases(s)
        if not rows:
            print("Brak wydań. Uruchom: seed")
        for r in rows:
            print(f"{r.version:<24} {r.status.value:<9} {r.created_at:%Y-%m-%d %H:%M}  {r.sha256[:12]}  {r.summary}")
    return 0


def cmd_serve(a: argparse.Namespace) -> int:
    import uvicorn

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

    s = sub.add_parser("migrate", help="zastosuj migracje bazy (alembic upgrade)")
    s.add_argument("revision", nargs="?", default="head")
    s.set_defaults(fn=cmd_migrate)

    s = sub.add_parser("downgrade", help="cofnij migracje do wskazanej rewizji; 'base' usuwa cały schemat")
    s.add_argument("revision")
    s.set_defaults(fn=cmd_downgrade)

    s = sub.add_parser("seed", help="wczytaj konfigurację z config/seed/*.yaml do bazy")
    s.add_argument("--seed-dir", default=str(DEFAULT_SEED_DIR))
    s.add_argument("--no-publish", action="store_true", help="nie twórz wydania startowego")
    s.set_defaults(fn=cmd_seed)

    s = sub.add_parser("export", help="zapisz bieżącą konfigurację z bazy jako release.json (bez publikacji)")
    s.add_argument("--version", default="draft")
    s.add_argument("--out", help="plik wyjściowy (domyślnie standardowe wyjście)")
    s.set_defaults(fn=cmd_export)

    s = sub.add_parser("publish", help="opublikuj bieżącą konfigurację jako niezmienne wydanie")
    s.add_argument("--version", required=True)
    s.add_argument("--summary", default="")
    s.add_argument("--author", default=getpass.getuser())
    s.add_argument("--no-activate", action="store_true")
    s.add_argument("--out", help="zapisz też plik, np. engine/config/release.json")
    s.set_defaults(fn=cmd_publish)

    s = sub.add_parser("activate", help="aktywuj istniejące wydanie (także wycofanie zmian)")
    s.add_argument("--version", required=True)
    s.add_argument("--out", help="zapisz też plik, np. engine/config/release.json")
    s.set_defaults(fn=cmd_activate)

    s = sub.add_parser("releases", help="lista wydań")
    s.set_defaults(fn=cmd_releases)

    s = sub.add_parser("serve", help="uruchom API (uvicorn)")
    s.add_argument("--host", default="127.0.0.1")
    s.add_argument("--port", type=int, default=8000)
    s.add_argument("--reload", action="store_true", help="restart po zmianie kodu (praca lokalna)")
    s.set_defaults(fn=cmd_serve)

    a = p.parse_args(argv)
    from .config_store import ConfigStoreError
    from .releases import ReleaseError

    try:
        return a.fn(a)
    except (ConfigStoreError, ReleaseError) as e:
        print(f"Błąd: {e}", file=sys.stderr)
        return 1
