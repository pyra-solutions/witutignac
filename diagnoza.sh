#!/usr/bin/env bash
# Diagnoza Odwołania2json (Linux, macOS): odpowiednik diagnoza.bat. Raport bez wartości klucza: diagnoza.txt.
# Opcje: --no-api, --no-convert
set -euo pipefail
cd "$(dirname "$0")"
if [ ! -x engine/.venv/bin/python ]; then
  echo "Brak środowiska engine/.venv. Uruchom najpierw ./start.sh, który je instaluje." >&2
  exit 1
fi
export PYTHONPATH="$PWD/engine${PYTHONPATH:+:$PYTHONPATH}"
exec engine/.venv/bin/python -m odwolania2json doctor "$@"
