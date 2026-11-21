"""Wydania konfiguracji: publikacja (niezmienny snapshot), aktywacja i plik `release.json`."""

import hashlib
import json
from pathlib import Path
from typing import Any

from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from . import models as m
from .config_store import export_release


class ReleaseError(Exception):
    pass


def canonical_json(snapshot: dict[str, Any]) -> str:
    return json.dumps(snapshot, sort_keys=True, ensure_ascii=False, separators=(",", ":"))


def snapshot_sha256(snapshot: dict[str, Any]) -> str:
    return hashlib.sha256(canonical_json(snapshot).encode("utf-8")).hexdigest()


def release_file_text(snapshot: dict[str, Any]) -> str:
    """Treść `release.json` w tym samym formacie co `odwolania2json build-release`."""
    return json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n"


def write_release_file(snapshot: dict[str, Any], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(release_file_text(snapshot), encoding="utf-8")


def list_releases(session: Session) -> list[m.ConfigRelease]:
    stmt = select(m.ConfigRelease).order_by(m.ConfigRelease.created_at.desc(), m.ConfigRelease.id.desc())
    return list(session.scalars(stmt))


def get_release(session: Session, version: str) -> m.ConfigRelease | None:
    return session.scalar(select(m.ConfigRelease).where(m.ConfigRelease.version == version))


def active_release(session: Session) -> m.ConfigRelease | None:
    return session.scalar(select(m.ConfigRelease).where(m.ConfigRelease.status == m.ReleaseStatus.ACTIVE))


def publish(
    session: Session, version: str, *, summary: str = "", author: str = "", activate: bool = True
) -> m.ConfigRelease:
    """Zapisuje bieżącą konfigurację z bazy jako niezmienne wydanie; domyślnie od razu je aktywuje."""
    if get_release(session, version) is not None:
        raise ReleaseError(f"Wydanie {version} już istnieje. Wydania są niezmienne: użyj nowej wersji.")
    snapshot = export_release(session, version).model_dump(mode="json")
    release = m.ConfigRelease(
        version=version,
        status=m.ReleaseStatus.DRAFT,
        snapshot=snapshot,
        sha256=snapshot_sha256(snapshot),
        summary=summary,
        author=author,
    )
    session.add(release)
    session.flush()
    if activate:
        activate_release(session, version)
    return release


def activate_release(session: Session, version: str) -> m.ConfigRelease:
    """Ustawia wydanie jako aktywne; poprzednie aktywne trafia do archiwum (tak działa też wycofanie)."""
    release = get_release(session, version)
    if release is None:
        raise ReleaseError(f"Nie ma wydania {version}")
    if release.status == m.ReleaseStatus.ACTIVE:
        return release
    session.execute(
        update(m.ConfigRelease)
        .where(m.ConfigRelease.status == m.ReleaseStatus.ACTIVE)
        .values(status=m.ReleaseStatus.ARCHIVED)
    )
    release.status = m.ReleaseStatus.ACTIVE
    release.activated_at = func.now()
    session.flush()
    session.refresh(release)
    return release
