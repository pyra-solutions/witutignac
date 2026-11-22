@echo off
rem Odwolania2json: interfejs graficzny w przegladarce (http://127.0.0.1:8000).
rem Wgrywanie PDF-ow, podglad wynikow z PDF obok, poprawki i zatwierdzanie, konfiguracja silnika.
rem Korzysta z tego samego srodowiska engine\.venv co start.bat; brakujace pakiety (FastAPI, uvicorn) doinstalowuje.
rem Zmienna PORT zmienia port. Zatrzymanie: Ctrl+C w tym oknie.
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
  goto :fail
)

if not exist "engine\.venv\Scripts\python.exe" (
  echo Tworze srodowisko engine\.venv ^(jednorazowo, kilka minut^)...
  %PY% -m venv engine\.venv || goto :error
  "engine\.venv\Scripts\python.exe" -m pip install --upgrade pip || goto :error
)
"engine\.venv\Scripts\python.exe" -c "import docling, fastapi, uvicorn, multipart" >nul 2>nul
if errorlevel 1 (
  echo Instaluje zaleznosci silnika i interfejsu ^(backend\requirements.txt^)...
  "engine\.venv\Scripts\python.exe" -m pip install -r backend\requirements.txt || goto :error
)

if not defined PORT set "PORT=8000"
set "PYTHONPATH=%~dp0engine"
"engine\.venv\Scripts\python.exe" backend\manage.py serve --port %PORT% --open %*
if errorlevel 1 goto :fail
exit /b 0

:error
echo Instalacja zaleznosci nie powiodla sie.
:fail
pause
exit /b 1
