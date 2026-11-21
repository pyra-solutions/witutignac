"""Ustawienia backendu ze zmiennych środowiskowych (oraz pliku .env w katalogu repozytorium)."""

import os

from odwolania2json.llm import load_dotenv

from . import REPO_ROOT

# Zgodne z wartościami domyślnymi w docker-compose.yml (tylko do pracy lokalnej).
DEFAULT_DATABASE_URL = "postgresql+psycopg://o2j:o2j@localhost:5432/odwolania2json"

load_dotenv(REPO_ROOT / ".env")


def normalize_database_url(url: str) -> str:
    """Przyjmuje też adresy `postgresql://` i `postgres://`; SQLAlchemy dostaje sterownik psycopg 3."""
    for prefix in ("postgresql://", "postgres://"):
        if url.startswith(prefix):
            return "postgresql+psycopg://" + url[len(prefix):]
    return url


def database_url() -> str:
    return normalize_database_url(os.environ.get("DATABASE_URL") or DEFAULT_DATABASE_URL)
