#!/usr/bin/env bash
# Odwołania2json: przetwarza PDF-y z ./input i zapisuje JSON-y do ./output.
# Pierwsze uruchomienie tworzy środowisko engine/.venv i instaluje zależności.
# Dodatkowe argumenty trafiają do polecenia `run`, np.: ./start.sh --no-llm --trace-dir traces
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
  echo "Tworzę środowisko engine/.venv i instaluję zależności (jednorazowo, kilka minut)..."
  if "$PY" -m venv engine/.venv 2>/dev/null; then
    "$VENV_PY" -m pip install --upgrade pip
    "$VENV_PY" -m pip install -r engine/requirements.txt
  else
    # Systemy bez ensurepip (np. Debian/Ubuntu bez python3-venv): pip systemowy instaluje do venv.
    rm -rf engine/.venv
    "$PY" -m venv --without-pip engine/.venv
    "$PY" -m pip --python "$VENV_PY" install -r engine/requirements.txt
  fi
fi

export PYTHONPATH="$PWD/engine${PYTHONPATH:+:$PYTHONPATH}"
exec "$VENV_PY" -m odwolania2json run --input input --output output "$@"
