#!/usr/bin/env bash
# Odwołania2json na serwerze oceny: wszystkie PDF-y z input/ -> pliki JSON w output/.
#
#   cd /opt/solution && sudo bash odwolania2json/run.sh            przetwarzanie (komenda z RUN.md)
#   cd /opt/solution && sudo bash odwolania2json/run.sh diagnoza   diagnoza środowiska, raport w logs/diagnoza.txt
#
# Katalogi input/ i output/ oraz plik .env z kluczem API są w katalogu, z którego uruchamia się komendę
# (na serwerze /opt/solution). Inne katalogi: zmienne O2J_INPUT i O2J_OUTPUT.
# Python, pakiety i modele są w katalogu rozwiązania (tam, gdzie ten skrypt); instaluje je wcześniej
# deploy/install.sh. Skrypt niczego nie pobiera z internetu poza wywołaniami API modelu językowego.
# Dodatkowe argumenty trafiają do polecenia `run`, np. --no-llm.
set -euo pipefail
ROOT="$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")" && pwd)"
INPUT_DIR="${O2J_INPUT:-$PWD/input}"
OUTPUT_DIR="${O2J_OUTPUT:-$PWD/output}"

VENV_PY="$ROOT/engine/.venv/bin/python"
if [ ! -x "$VENV_PY" ]; then
  echo "Brak środowiska $ROOT/engine/.venv. Zainstaluj je poleceniem: bash $ROOT/deploy/install.sh" >&2
  exit 1
fi

# Modele Docling leżą w katalogu rozwiązania, nie w katalogu domowym: pod sudo HOME to /root.
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

mkdir -p "$ROOT/logs"

if [ "${1:-}" = "diagnoza" ]; then
  shift
  exec "$VENV_PY" -m odwolania2json doctor --report "$ROOT/logs/diagnoza.txt" "$@"
fi

if [ ! -d "$INPUT_DIR" ]; then
  echo "Brak katalogu wejściowego $INPUT_DIR." >&2
  echo "Uruchom komendę z katalogu, w którym są input/ i output/ (na serwerze: cd /opt/solution)." >&2
  exit 1
fi
mkdir -p "$OUTPUT_DIR"

LOG="$ROOT/logs/run-$(date +%Y%m%d-%H%M%S).log"
echo "Odwołania2json: $INPUT_DIR -> $OUTPUT_DIR (dziennik: $LOG)"
"$VENV_PY" -m odwolania2json run --input "$INPUT_DIR" --output "$OUTPUT_DIR" "$@" 2>&1 | tee "$LOG"
