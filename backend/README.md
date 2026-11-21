# Backend Odwołania2json (Python)

API (FastAPI) dla interfejsu graficznego i wydania konfiguracji silnika. Backend nie ma bazy danych:
pracuje na plikach w repozytorium, więc nie wymaga Dockera ani żadnej usługi w tle. Korzysta z modeli
konfiguracji silnika (`engine/odwolania2json/config.py`), więc format wydania i wartości domyślne pól
definiuje wyłącznie silnik.

Do uruchomienia ekstrakcji (`start.sh`, `start.bat`) backend nie jest potrzebny.

## Uruchomienie

```bash
python3 -m venv backend/.venv               # bez ensurepip: python3 -m venv --without-pip backend/.venv
python3 -m pip --python backend/.venv/bin/python install -r backend/requirements-dev.txt
backend/.venv/bin/python backend/manage.py serve --reload   # API: http://127.0.0.1:8000/docs
```

## Gdzie jest konfiguracja

| Ścieżka | Rola |
| --- | --- |
| `config/seed/*.yaml` | konfiguracja robocza (szkic) i jedyne źródło prawdy: typy dokumentów, słowniki, profile Docling i LLM |
| `config/seed/llm_providers.yaml` | metadane dostawców LLM dla GUI (lokalizacja danych, opis); silnik ich nie czyta |
| `config/releases/<wersja>.json` | opublikowane wydanie: wersja, SHA-256, autor, data, opis zmian i snapshot `release.json` |
| `engine/config/release.json` | aktywne wydanie, które czyta CLI silnika |

```
config/seed/*.yaml ──publish──▶ config/releases/<wersja>.json ──activate──▶ engine/config/release.json
  (edycja: plik lub GUI)          (niezmienne, SHA-256)                       (CLI oceniane przez organizatora)
```

- **Publikacja** buduje wydanie z YAML tak samo jak `odwolania2json build-release` i sprawdza je modelami
  silnika. Plik wydania powstaje tylko wtedy, gdy jeszcze nie istnieje, więc opublikowanej wersji nie da
  się nadpisać.
- **Aktywacja** zapisuje snapshot wydania do `engine/config/release.json` w formacie bajt w bajt zgodnym
  z `build-release`. Wycofanie zmian to aktywacja poprzedniej wersji. Wydanie, którego plik zmieniono po
  publikacji (niezgodny SHA-256), nie zostanie aktywowane.
- **Status.** Aktywne jest wydanie o tym samym SHA-256 co `engine/config/release.json`. Gdy ten plik
  zbudowano poleceniem `build-release` bez publikacji, żadne wydanie nie jest aktywne.

Pliki wydań trafiają do repozytorium, więc historia konfiguracji jest też w historii git.

## Polecenia `manage.py`

| Polecenie | Co robi |
| --- | --- |
| `publish --version V [--summary] [--author] [--no-activate]` | zapisuje konfigurację z `config/seed` jako niezmienne wydanie i domyślnie je aktywuje |
| `activate --version V` | aktywuje istniejące wydanie, także przy wycofaniu zmian |
| `releases` | lista wydań ze statusem |
| `serve [--host] [--port] [--reload]` | uruchamia API (uvicorn) |

## API

| Metoda i ścieżka | Wynik |
| --- | --- |
| `GET /api/health` | stan usługi |
| `GET /api/releases` | lista wydań (bez snapshotu) |
| `GET /api/releases/active` | aktywne wydanie ze snapshotem; 404, gdy `release.json` nie odpowiada żadnemu wydaniu |
| `GET /api/releases/{wersja}` | wydanie ze snapshotem |
| `GET /api/config/draft` | bieżąca konfiguracja z YAML w formacie `release.json`; 409, gdy pliki nie przechodzą walidacji |
| `GET /api/llm-providers` | dostawcy LLM z `config/seed/llm_providers.yaml` |

## Testy

```bash
cd backend && .venv/bin/python -m pytest -q
```

Testy działają na kopii `config/seed` w katalogu tymczasowym i nie zmieniają plików repozytorium.
