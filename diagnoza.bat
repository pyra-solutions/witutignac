@echo off
rem Diagnoza Odwolania2json: Python, zaleznosci, plik .env i klucz API, polaczenie z API, dane, Docling.
rem Raport bez wartosci klucza trafia do diagnoza.txt. Opcje: --no-api, --no-convert
setlocal
cd /d "%~dp0"
set PYTHONUTF8=1
set PYTHONIOENCODING=utf-8

if not exist "engine\.venv\Scripts\python.exe" (
  echo Brak srodowiska engine\.venv. Uruchom najpierw start.bat, ktory je instaluje.
  echo Jesli start.bat konczy sie bledem, przeslij caly tekst z okna.
  exit /b 1
)

set "PYTHONPATH=%~dp0engine"
"engine\.venv\Scripts\python.exe" -m odwolania2json doctor %*
exit /b %errorlevel%
