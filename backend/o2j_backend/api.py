"""API HTTP platformy (FastAPI). Na razie: stan usługi, wydania konfiguracji i podgląd szkicu."""

from collections.abc import AsyncIterator, Iterator
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Annotated, Any

from fastapi import Depends, FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from . import __version__, db
from . import releases as rel
from .config_store import ConfigStoreError, export_release
from .models import ReleaseStatus


def get_session() -> Iterator[Session]:
    with db.session_factory()() as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    yield
    db.dispose()


app = FastAPI(title="Odwołania2json API", version=__version__, lifespan=lifespan)


class ReleaseSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    version: str
    status: ReleaseStatus
    sha256: str
    author: str
    summary: str
    created_at: datetime
    activated_at: datetime | None


class ReleaseDetail(ReleaseSummary):
    snapshot: dict[str, Any]


@app.get("/api/health")
def health(session: SessionDep) -> JSONResponse:
    try:
        session.execute(text("SELECT 1"))
    except SQLAlchemyError:
        return JSONResponse(status_code=503, content={"status": "error", "database": "unavailable"})
    return JSONResponse(content={"status": "ok", "database": "ok"})


@app.get("/api/releases")
def list_releases(session: SessionDep) -> list[ReleaseSummary]:
    return [ReleaseSummary.model_validate(r) for r in rel.list_releases(session)]


@app.get("/api/releases/active")
def get_active_release(session: SessionDep) -> ReleaseDetail:
    release = rel.active_release(session)
    if release is None:
        raise HTTPException(status_code=404, detail="Brak aktywnego wydania konfiguracji")
    return ReleaseDetail.model_validate(release)


@app.get("/api/releases/{version}")
def get_release(version: str, session: SessionDep) -> ReleaseDetail:
    release = rel.get_release(session, version)
    if release is None:
        raise HTTPException(status_code=404, detail=f"Nie ma wydania {version}")
    return ReleaseDetail.model_validate(release)


@app.get("/api/config/draft")
def get_draft_config(session: SessionDep) -> dict[str, Any]:
    """Bieżąca konfiguracja z bazy w formacie `release.json` (jeszcze nieopublikowana)."""
    try:
        return export_release(session, "draft").model_dump(mode="json")
    except ConfigStoreError as e:
        raise HTTPException(status_code=409, detail=str(e)) from e
