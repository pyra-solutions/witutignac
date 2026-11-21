#!/usr/bin/env bash
# Odwołania2json na Linuksie: przetwarza PDF-y z ./input i zapisuje JSON-y do ./output.
# Odpowiednik start.bat dla Windows. Całą pracę wykonuje start.sh (wspólny dla Linuksa i macOS):
# przy pierwszym uruchomieniu tworzy engine/.venv i instaluje zależności.
# Dodatkowe argumenty trafiają do polecenia `run`, np.: ./start_linux.sh --trace-dir slady
exec bash "$(dirname "$0")/start.sh" "$@"
