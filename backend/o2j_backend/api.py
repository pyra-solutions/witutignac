"""API HTTP platformy (FastAPI): wydania konfiguracji, podgląd szkicu z plików YAML i dostawcy LLM."""

from datetime import datetime
from typing import Annotated, Any

from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel

from . import __version__
from . import releases as rel


def get_files() -> rel.ConfigFiles:
    return rel.ConfigFiles()


FilesDep = Annotated[rel.ConfigFiles, Depends(get_files)]

app = FastAPI(title="Odwołania2json API", version=__version__)


class ReleaseSummary(BaseModel):
    version: str
    status: rel.ReleaseStatus
    sha256: str
    author: str
    summary: str
    created_at: datetime


class ReleaseDetail(ReleaseSummary):
    snapshot: dict[str, Any]


def _summary(record: rel.ReleaseRecord, status: rel.ReleaseStatus) -> ReleaseSummary:
    return ReleaseSummary(**record.model_dump(exclude={"snapshot"}), status=status)


def _detail(record: rel.ReleaseRecord, status: rel.ReleaseStatus) -> ReleaseDetail:
    return ReleaseDetail(**record.model_dump(), status=status)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/releases")
def list_releases(files: FilesDep) -> list[ReleaseSummary]:
    return [_summary(r, s) for r, s in rel.list_releases(files)]


@app.get("/api/releases/active")
def get_active_release(files: FilesDep) -> ReleaseDetail:
    record = rel.active_release(files)
    if record is None:
        raise HTTPException(
            status_code=404,
            detail="engine/config/release.json nie odpowiada żadnemu opublikowanemu wydaniu",
        )
    return _detail(record, rel.ReleaseStatus.ACTIVE)


@app.get("/api/releases/{version}")
def get_release(version: str, files: FilesDep) -> ReleaseDetail:
    try:
        record = rel.get_release(files, version)
    except rel.ReleaseError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e
    if record is None:
        raise HTTPException(status_code=404, detail=f"Nie ma wydania {version}")
    return _detail(record, rel.status_of(record, rel.active_sha256(files)))


@app.get("/api/config/draft")
def get_draft_config(files: FilesDep) -> dict[str, Any]:
    """Bieżąca konfiguracja z `config/seed/*.yaml` w formacie `release.json` (jeszcze nieopublikowana)."""
    try:
        return rel.build_draft(files).model_dump(mode="json")
    except rel.ReleaseError as e:
        raise HTTPException(status_code=409, detail=str(e)) from e


@app.get("/api/llm-providers")
def list_llm_providers(files: FilesDep) -> list[rel.ProviderInfo]:
    try:
        return rel.load_providers(files)
    except rel.ReleaseError as e:
        raise HTTPException(status_code=409, detail=str(e)) from e
