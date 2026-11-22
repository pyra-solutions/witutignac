"""Testy backendu na plikach w katalogu tymczasowym; konfiguracja pochodzi z prawdziwego `config/seed`."""

import shutil
import sys
from pathlib import Path

import pytest

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from o2j_backend import REPO_ROOT  # noqa: E402
from o2j_backend.releases import ConfigFiles  # noqa: E402

SEED_DIR = REPO_ROOT / "config" / "seed"


@pytest.fixture
def files(tmp_path: Path) -> ConfigFiles:
    """Kopia `config/seed`, pusty katalog wydań i brak aktywnego `release.json`."""
    seed = tmp_path / "seed"
    shutil.copytree(SEED_DIR, seed)
    return ConfigFiles(
        seed_dir=seed,
        releases_dir=tmp_path / "releases",
        active_file=tmp_path / "engine" / "release.json",
    )


class FakeProcessor:
    """Kolejka bez silnika: zapamiętuje zlecenia, nie konwertuje PDF-ów."""

    def __init__(self) -> None:
        self.queued: list[tuple[str, str]] = []

    def start(self) -> None:
        pass

    def stop(self) -> None:
        pass

    def enqueue(self, case_id: str, doc_id: str) -> None:
        self.queued.append((case_id, doc_id))

    @property
    def pending(self) -> int:
        return len(self.queued)


@pytest.fixture(autouse=True)
def gui_state(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    """Sprawy GUI w katalogu tymczasowym i kolejka bez silnika, także dla testów wydań."""
    from o2j_backend import api
    from o2j_backend.cases import CaseStore

    store = CaseStore(tmp_path / "gui-data")
    processor = FakeProcessor()
    monkeypatch.setattr(api, "_store", store)
    monkeypatch.setattr(api, "_processor", processor)
    return store, processor
