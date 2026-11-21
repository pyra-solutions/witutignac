"""Backend platformy Odwołania2json: API i wydania konfiguracji zapisane w plikach.

Silnik ekstrakcji (`engine/odwolania2json`) nie jest instalowanym pakietem, więc dołączamy
jego katalog do ścieżki importu. Backend używa modeli konfiguracji silnika (Pydantic)
jako jedynej definicji formatu wydania i wartości domyślnych.
"""

import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
ENGINE_DIR = REPO_ROOT / "engine"

if str(ENGINE_DIR) not in sys.path:
    sys.path.append(str(ENGINE_DIR))

__version__ = "0.1.0"
