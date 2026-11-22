#!/usr/bin/env bash
# Odwołania2json: interfejs graficzny w przeglądarce (http://127.0.0.1:8000).
# Wgrywanie PDF-ów, podgląd wyników z PDF obok, poprawki i zatwierdzanie, konfiguracja silnika.
# Korzysta z tego samego środowiska engine/.venv co start.sh; brakujące pakiety (FastAPI, uvicorn) doinstalowuje.
# Zmienna PORT zmienia port; dodatkowe argumenty trafiają do `manage.py serve`, np. ./gui.sh --host 0.0.0.0
set -euo pipefail
cd "$(dirname "$0")"

# Python 3.13+: zmienna PYTHON, potem konkretne wersje, na końcu python3.
PY="${PYTHON:-}"
if [ -z "$PY" ]; then
  for c in python3.13 python3.14 python3.15 python3; do
    if command -v "$c" >/dev/null 2>&1 \
      && "$c" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 13) else 1)' 2>/dev/null; then
      PY="$c"
      break
    fi
  done
fi
PY="${PY:-python3}"
"$PY" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 13) else 1)' \
  || { echo "Wymagany Python 3.13 lub nowszy (ustaw zmienną PYTHON)." >&2; exit 1; }

VENV_PY="engine/.venv/bin/python"
if [ ! -x "$VENV_PY" ]; then
  echo "Tworzę środowisko engine/.venv (jednorazowo, kilka minut)..."
  if "$PY" -m venv engine/.venv 2>/dev/null; then
    "$VENV_PY" -m pip install --upgrade pip
  else
    # Systemy bez ensurepip (np. Debian/Ubuntu bez python3-venv): pip systemowy instaluje do venv.
    rm -rf engine/.venv
    "$PY" -m venv --without-pip engine/.venv
  fi
fi
if ! "$VENV_PY" -c 'import docling, fastapi, uvicorn, multipart' 2>/dev/null; then
  echo "Instaluję zależności silnika i interfejsu (backend/requirements.txt)..."
  if "$VENV_PY" -m pip --version >/dev/null 2>&1; then
    "$VENV_PY" -m pip install -r backend/requirements.txt
  else
    "$PY" -m pip --python "$VENV_PY" install -r backend/requirements.txt
  fi
fi

export PYTHONPATH="$PWD/engine${PYTHONPATH:+:$PYTHONPATH}"
exec "$VENV_PY" backend/manage.py serve --port "${PORT:-8000}" --open "$@"
