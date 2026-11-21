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
