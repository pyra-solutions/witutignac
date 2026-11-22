#!/usr/bin/env bash
# Odwołania2json na serwerze oceny: wszystkie PDF-y z ./input -> pliki JSON w ./output.
#
#   cd /opt/solution && sudo bash run.sh              przetwarzanie (komenda z RUN.md)
#   cd /opt/solution && sudo bash run.sh diagnoza     diagnoza środowiska, raport w logs/diagnoza.txt
#
# Python, pakiety i modele instaluje wcześniej deploy/install.sh. Ten skrypt niczego nie pobiera z internetu
# poza wywołaniami API modelu językowego. Dodatkowe argumenty trafiają do polecenia `run`, np. --no-llm.
set -euo pipefail
ROOT="$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")" && pwd)"
cd "$ROOT"

VENV_PY="$ROOT/engine/.venv/bin/python"
if [ ! -x "$VENV_PY" ]; then
  echo "Brak środowiska engine/.venv. Zainstaluj je poleceniem: bash deploy/install.sh" >&2
  exit 1
fi

# Modele Docling leżą w katalogu projektu, nie w katalogu domowym: pod sudo HOME to /root.
# Tryb offline: modele są już na dysku, więc ocena nie zależy od dostępności Hugging Face.
export HF_HOME="$ROOT/.cache/huggingface"
export DOCLING_CACHE_DIR="$ROOT/.cache/docling"
export HF_HUB_OFFLINE=1
export TRANSFORMERS_OFFLINE=1
export HF_HUB_DISABLE_TELEMETRY=1
export PYTHONPATH="$ROOT/engine"
export PYTHONUNBUFFERED=1
# Każde uruchomienie liczy wyniki od nowa, bez cache konwersji i odpowiedzi LLM z wcześniejszych uruchomień.
export O2J_CACHE_DIR=none

mkdir -p input output logs

if [ "${1:-}" = "diagnoza" ]; then
  shift
  exec "$VENV_PY" -m odwolania2json doctor --report "$ROOT/logs/diagnoza.txt" "$@"
fi

LOG="logs/run-$(date +%Y%m%d-%H%M%S).log"
echo "Odwołania2json: $ROOT/input -> $ROOT/output (dziennik: $ROOT/$LOG)"
"$VENV_PY" -m odwolania2json run --input input --output output "$@" 2>&1 | tee "$LOG"
