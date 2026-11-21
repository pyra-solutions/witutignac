"""Połączenie z bazą: silnik SQLAlchemy i sesje."""

from collections.abc import Iterator
from contextlib import contextmanager

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker

from . import settings

_engine: Engine | None = None
_sessions: sessionmaker[Session] | None = None


def get_engine() -> Engine:
    global _engine
    if _engine is None:
        _engine = create_engine(settings.database_url(), pool_pre_ping=True)
    return _engine


def session_factory() -> sessionmaker[Session]:
    global _sessions
    if _sessions is None:
        _sessions = sessionmaker(bind=get_engine(), expire_on_commit=False)
    return _sessions


@contextmanager
def session_scope() -> Iterator[Session]:
    """Sesja z transakcją: commit przy sukcesie, rollback przy wyjątku."""
    with session_factory().begin() as session:
        yield session


def dispose() -> None:
    global _engine, _sessions
    if _engine is not None:
        _engine.dispose()
    _engine = None
    _sessions = None
