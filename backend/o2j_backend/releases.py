"""Konfiguracja i wydania w plikach.

* `config/seed/*.yaml` to konfiguracja robocza (szkic) i jedyne źródło prawdy.
* `config/releases/<wersja>.json` to opublikowane wydanie: metadane i snapshot w formacie `release.json`.
  Pliku wydania nigdy się nie nadpisuje.
* `engine/config/release.json` to aktywne wydanie, które czyta CLI silnika. Aktywacja kopiuje do niego
  snapshot wybranego wydania, więc wycofanie zmian to aktywacja poprzedniej wersji.

Aktywne jest to wydanie, którego snapshot ma ten sam skrót SHA-256 co `engine/config/release.json`.
Gdy plik zbudowano poleceniem `build-release` bez publikacji, żadne wydanie nie jest aktywne.
"""

import hashlib
import json
import re
from dataclasses import dataclass
from datetime import UTC, datetime
from enum import StrEnum
from pathlib import Path
from typing import Any

import yaml
from pydantic import BaseModel, ValidationError

from odwolania2json.config import Release, build_from_seed

from . import REPO_ROOT

_VERSION_RE = re.compile(r"[0-9A-Za-z][0-9A-Za-z._-]{0,63}")


class ReleaseError(Exception):
    pass


class ReleaseStatus(StrEnum):
    ACTIVE = "active"
    INACTIVE = "inactive"


@dataclass(frozen=True)
class ConfigFiles:
    seed_dir: Path = REPO_ROOT / "config" / "seed"
    releases_dir: Path = REPO_ROOT / "config" / "releases"
    active_file: Path = REPO_ROOT / "engine" / "config" / "release.json"


class ReleaseRecord(BaseModel):
    """Zawartość pliku `config/releases/<wersja>.json`."""

    version: str
    sha256: str
    author: str
    summary: str
    created_at: datetime
    snapshot: dict[str, Any]


class ProviderInfo(BaseModel):
    """Dostawca API LLM z `config/seed/llm_providers.yaml` (metadane dla GUI; silnik ich nie czyta)."""

    code: str
    name: str
    base_url: str
    data_location: str | None = None
    note: str = ""


class ModelInfo(BaseModel):
    """Model z `config/seed/llm_providers.yaml` (sekcja models): wielkość i licencja dla GUI."""

    model: str
    name: str
    vendor: str = ""
    params_billions: float | None = None
    license: str = ""
    note: str = ""


def canonical_json(snapshot: dict[str, Any]) -> str:
    return json.dumps(snapshot, sort_keys=True, ensure_ascii=False, separators=(",", ":"))


def snapshot_sha256(snapshot: dict[str, Any]) -> str:
    return hashlib.sha256(canonical_json(snapshot).encode("utf-8")).hexdigest()


def release_file_text(snapshot: dict[str, Any]) -> str:
    """Treść `release.json` w tym samym formacie co `odwolania2json build-release`."""
    return json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n"


def check_version(version: str) -> str:
    if not _VERSION_RE.fullmatch(version):
        raise ReleaseError(
            f"Niepoprawna wersja {version!r}: dozwolone są litery, cyfry, '.', '_' i '-' (do 64 znaków)."
        )
    return version


def _record_path(files: ConfigFiles, version: str) -> Path:
    return files.releases_dir / f"{check_version(version)}.json"


def build_draft(files: ConfigFiles, version: str = "draft") -> Release:
    """Bieżąca konfiguracja z plików YAML, sprawdzona modelami silnika."""
    try:
        release = build_from_seed(files.seed_dir)
    except (ValidationError, yaml.YAMLError, OSError) as e:
        raise ReleaseError(f"Konfiguracja w {files.seed_dir} nie przechodzi walidacji silnika:\n{e}") from e
    return release.model_copy(update={"version": version})


def _llm_meta(files: ConfigFiles, section: str, model: type[BaseModel]) -> list[Any]:
    path = files.seed_dir / "llm_providers.yaml"
    if not path.is_file():
        return []
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
        return [model.model_validate(item) for item in data.get(section) or []]
    except (ValidationError, yaml.YAMLError) as e:
        raise ReleaseError(f"Plik {path} jest niepoprawny:\n{e}") from e


def load_providers(files: ConfigFiles) -> list[ProviderInfo]:
    return _llm_meta(files, "providers", ProviderInfo)


def load_models(files: ConfigFiles) -> list[ModelInfo]:
    return _llm_meta(files, "models", ModelInfo)


def active_sha256(files: ConfigFiles) -> str | None:
    """SHA-256 snapshotu w `engine/config/release.json` albo None, gdy pliku nie ma."""
    if not files.active_file.is_file():
        return None
    return snapshot_sha256(json.loads(files.active_file.read_text(encoding="utf-8")))


def status_of(record: ReleaseRecord, active_sha: str | None) -> ReleaseStatus:
    return ReleaseStatus.ACTIVE if record.sha256 == active_sha else ReleaseStatus.INACTIVE


def list_releases(files: ConfigFiles) -> list[tuple[ReleaseRecord, ReleaseStatus]]:
    """Wydania od najnowszego, ze statusem."""
    if not files.releases_dir.is_dir():
        return []
    records = [
        ReleaseRecord.model_validate_json(p.read_text(encoding="utf-8"))
        for p in files.releases_dir.glob("*.json")
    ]
    records.sort(key=lambda r: (r.created_at, r.version), reverse=True)
    active_sha = active_sha256(files)
    return [(r, status_of(r, active_sha)) for r in records]


def get_release(files: ConfigFiles, version: str) -> ReleaseRecord | None:
    path = _record_path(files, version)
    if not path.is_file():
        return None
    return ReleaseRecord.model_validate_json(path.read_text(encoding="utf-8"))


def active_release(files: ConfigFiles) -> ReleaseRecord | None:
    for record, status in list_releases(files):
        if status is ReleaseStatus.ACTIVE:
            return record
    return None


def publish(
    files: ConfigFiles, version: str, *, summary: str = "", author: str = "", activate: bool = True
) -> ReleaseRecord:
    """Zapisuje bieżącą konfigurację z YAML jako niezmienne wydanie; domyślnie od razu je aktywuje."""
    path = _record_path(files, version)
    snapshot = build_draft(files, version).model_dump(mode="json")
    record = ReleaseRecord(
        version=version,
        sha256=snapshot_sha256(snapshot),
        author=author,
        summary=summary,
        created_at=datetime.now(UTC).replace(microsecond=0),
        snapshot=snapshot,
    )
    files.releases_dir.mkdir(parents=True, exist_ok=True)
    try:
        # Tryb "x" tworzy plik tylko wtedy, gdy jeszcze nie istnieje: wydania są niezmienne.
        with path.open("x", encoding="utf-8") as f:
            f.write(record.model_dump_json(indent=2) + "\n")
    except FileExistsError:
        raise ReleaseError(f"Wydanie {version} już istnieje. Wydania są niezmienne: użyj nowej wersji.") from None
    if activate:
        activate_release(files, version)
    return record


def activate_release(files: ConfigFiles, version: str) -> ReleaseRecord:
    """Zapisuje snapshot wydania jako `engine/config/release.json` (tak działa też wycofanie zmian)."""
    record = get_release(files, version)
    if record is None:
        raise ReleaseError(f"Nie ma wydania {version}")
    if snapshot_sha256(record.snapshot) != record.sha256:
        raise ReleaseError(f"Plik wydania {version} został zmieniony po publikacji (niezgodny SHA-256).")
    Release.model_validate(record.snapshot)  # wydanie nadal pasuje do modelu silnika
    files.active_file.parent.mkdir(parents=True, exist_ok=True)
    tmp = files.active_file.with_suffix(".json.tmp")
    tmp.write_text(release_file_text(record.snapshot), encoding="utf-8")
    tmp.replace(files.active_file)
    return record
