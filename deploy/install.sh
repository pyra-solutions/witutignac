#!/usr/bin/env bash
# Instalacja Odwołania2json na serwerze oceny (Ubuntu 24.04, 2 vCPU, bez GPU). Nie wymaga sudo.
#
#   cd /opt/solution && bash odwolania2json/deploy/install.sh
#
# Uruchamiaj z katalogu, w którym są input/, output/ i .env z kluczem API (na serwerze /opt/solution).
# Wszystko trafia do katalogu rozwiązania, więc run.sh działa także pod sudo (HOME=/root) i bez pobierania:
#   .tools/python      Python 3.14 (uv; systemowy Python 3.12 jest za stary, projekt wymaga 3.13+)
#   engine/.venv       pakiety w wersjach z engine/requirements.lock.txt (rapidocr trzyma tu swoje modele)
#   .cache/huggingface modele układu strony Docling
# Na końcu: przebieg próbny na kilku PDF-ach organizatora (cyfrowe i skany), drugi przebieg w trybie offline
# (sprawdza, że niczego nie brakuje) i diagnoza z próbnym zapytaniem do API (wymaga pliku .env z kluczem).
# Skrypt można uruchamiać wielokrotnie, np. po `git pull`.
set -euo pipefail
ROOT="$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")/.." && pwd)"
CALL_DIR="$PWD"
cd "$ROOT"

PY_VERSION="${PY_VERSION:-3.14}"
TOOLS="$ROOT/.tools"
VENV_PY="$ROOT/engine/.venv/bin/python"
export UV_PYTHON_INSTALL_DIR="$TOOLS/python"
export UV_CACHE_DIR="$TOOLS/uv-cache"
export UV_PYTHON_PREFERENCE=only-managed
# Pliki pakietów kopiowane do venv (nie dowiązania do cache), więc usunięcie .tools/uv-cache nic nie psuje.
export UV_LINK_MODE=copy
export HF_HOME="$ROOT/.cache/huggingface"
export DOCLING_CACHE_DIR="$ROOT/.cache/docling"
export HF_HUB_DISABLE_TELEMETRY=1
export PYTHONPATH="$ROOT/engine"

step() { printf '\n==> %s\n' "$*"; }

step "uv (instalator Pythona i pakietów)"
if [ ! -x "$TOOLS/uv-venv/bin/uv" ]; then
  python3 -m venv "$TOOLS/uv-venv"
  "$TOOLS/uv-venv/bin/pip" install --quiet --upgrade pip uv
fi
UV="$TOOLS/uv-venv/bin/uv"
"$UV" --version

step "Python $PY_VERSION"
"$UV" python install "$PY_VERSION"

step "Środowisko engine/.venv"
if [ -x "$VENV_PY" ] && ! "$VENV_PY" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 13) else 1)' 2>/dev/null; then
  echo "engine/.venv ma za stary albo uszkodzony Python, tworzę od nowa."
  rm -rf engine/.venv
fi
[ -x "$VENV_PY" ] || "$UV" venv --seed --python "$PY_VERSION" engine/.venv
"$VENV_PY" -V
"$UV" pip install --python "$VENV_PY" --index-strategy unsafe-best-match -r engine/requirements.lock.txt

step "Dane organizatora do przebiegu próbnego (submoduł hacknation-2026)"
DANE="$ROOT/hacknation-2026/dane"
if [ ! -d "$DANE/przyklad_01" ]; then
  git submodule update --init --depth 1 hacknation-2026
fi

WARM="$ROOT/.cache/warmup"
rm -rf "$WARM"
mkdir -p "$WARM/in/cyfrowe" "$WARM/in/skany"
cp "$DANE"/przyklad_01/*.pdf "$WARM/in/cyfrowe/"
for d in odwolania pelnomocnictwa potwierdzenia; do
  f="$(find "$DANE/skany/$d" -name '*.pdf' | sort | head -n 1)"
  cp "$f" "$WARM/in/skany/${d}_$(basename "$f")"
done

step "Przebieg próbny 1/2: pobranie modeli Docling i RapidOCR (bez LLM)"
"$VENV_PY" -m odwolania2json run --input "$WARM/in" --output "$WARM/out1" --cache none --no-llm
# Zapasowy OCR (RapidOCR z domyślnymi modelami) uruchamia się tylko przy słabym tekście skanu, więc jego
# modele pobieramy wprost.
"$VENV_PY" -c 'import numpy as np; from odwolania2json.convert import _get_rapidocr; _get_rapidocr()(np.full((64, 256, 3), 255, np.uint8))' >/dev/null

step "Przebieg próbny 2/2: tryb offline, wyniki muszą być identyczne"
HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 \
  "$VENV_PY" -m odwolania2json run --input "$WARM/in" --output "$WARM/out2" --cache none --no-llm
diff -r "$WARM/out1" "$WARM/out2"
echo "OK: modele są na dysku, wyniki obu przebiegów identyczne."

step "Diagnoza (plik .env, klucz API, próbne zapytanie do API)"
mkdir -p logs
if [ ! -f "$CALL_DIR/.env" ] && [ ! -f "$ROOT/.env" ]; then
  echo "UWAGA: brak pliku $CALL_DIR/.env. Utwórz go na wzór $ROOT/.env.example (EDEN_AI_API_KEY=...)." >&2
fi
(cd "$CALL_DIR" && HF_HUB_OFFLINE=1 "$VENV_PY" -m odwolania2json doctor --report "$ROOT/logs/diagnoza.txt" --no-convert) \
  || echo "UWAGA: diagnoza zgłosiła problemy, szczegóły powyżej i w $ROOT/logs/diagnoza.txt." >&2

step "Gotowe. Komenda oceny: cd $CALL_DIR && sudo bash $(realpath --relative-to="$CALL_DIR" "$ROOT")/run.sh"
