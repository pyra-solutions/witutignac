"""Testy na prawdziwym PostgreSQL (baza odwolania2json_test z docker-compose).

Adres: TEST_DATABASE_URL, domyślnie baza testowa w kontenerze `db`. Gdy baza jest
niedostępna, testy wymagające bazy są pomijane.
"""

import os
import sys
from collections.abc import Iterator
from pathlib import Path

import pytest
from sqlalchemy import Engine, create_engine, text
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from o2j_backend import REPO_ROOT  # noqa: E402
from o2j_backend.settings import normalize_database_url  # noqa: E402

TEST_DATABASE_URL = normalize_database_url(
    os.environ.get("TEST_DATABASE_URL", "postgresql+psycopg://o2j:o2j@localhost:5432/odwolania2json_test")
)
SEED_DIR = REPO_ROOT / "config" / "seed"


@pytest.fixture(scope="session")
def engine() -> Iterator[Engine]:
    from alembic import command
    from alembic.config import Config

    eng = create_engine(TEST_DATABASE_URL)
    try:
        with eng.connect() as conn:
            conn.execute(text("SELECT 1"))
    except OperationalError:
        pytest.skip(f"Brak bazy testowej ({TEST_DATABASE_URL}); uruchom: docker compose up -d db")

    # Pełny cykl migracji: w dół do zera i z powrotem, więc testujemy też downgrade.
    cfg = Config(str(BACKEND_DIR / "alembic.ini"))
    cfg.attributes["configure_logger"] = False
    with eng.begin() as conn:
        cfg.attributes["connection"] = conn
        command.downgrade(cfg, "base")
        command.upgrade(cfg, "head")
    yield eng
    eng.dispose()


@pytest.fixture
def session(engine: Engine) -> Iterator[Session]:
    """Sesja w transakcji wycofywanej po teście."""
    with engine.connect() as conn:
        trans = conn.begin()
        s = Session(bind=conn, join_transaction_mode="create_savepoint", expire_on_commit=False)
        try:
            yield s
        finally:
            s.close()
            trans.rollback()
