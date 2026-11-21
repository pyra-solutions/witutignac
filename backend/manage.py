"""Punkt wejścia backendu, działa z dowolnego katalogu: python backend/manage.py <polecenie>.

Polecenia: migrate, seed, export, publish, activate, releases, serve (szczegóły: --help).
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from o2j_backend.cli import main  # noqa: E402

if __name__ == "__main__":
    sys.exit(main())
