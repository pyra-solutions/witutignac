@echo off
rem Odwolania2json: przetwarza PDF-y z .\input i zapisuje JSON-y do .\output.
rem Pierwsze uruchomienie tworzy srodowisko engine\.venv i instaluje zaleznosci.
rem Dodatkowe argumenty trafiaja do polecenia run, np.: start.bat --no-llm
setlocal
cd /d "%~dp0"
set PYTHONUTF8=1
set PYTHONIOENCODING=utf-8

rem Python 3.13+: najpierw konkretne wersje przez launcher py (domyslny "py -3" bywa starszy),
rem potem "python" z PATH. Zmienna PYTHON pozwala wskazac interpreter recznie.
set "PY=%PYTHON%"
for %%V in (3.13 3.14 3.15) do (
  if not defined PY (
    py -%%V -c "import sys" >nul 2>nul && set "PY=py -%%V"
  )
)
if not defined PY set "PY=python"

%PY% -c "import sys; sys.exit(0 if sys.version_info >= (3, 13) else 1)"
if errorlevel 1 (
  echo Wymagany Python 3.13 lub nowszy.
  exit /b 1
)

if not exist "engine\.venv\Scripts\python.exe" (
  echo Tworze srodowisko engine\.venv i instaluje zaleznosci ^(jednorazowo, kilka minut^)...
  %PY% -m venv engine\.venv || goto :error
  "engine\.venv\Scripts\python.exe" -m pip install --upgrade pip || goto :error
  "engine\.venv\Scripts\python.exe" -m pip install -r engine\requirements.txt || goto :error
)

set "PYTHONPATH=%~dp0engine"
"engine\.venv\Scripts\python.exe" -m odwolania2json run --input input --output output %*
exit /b %errorlevel%

:error
echo Instalacja zaleznosci nie powiodla sie.
exit /b 1
