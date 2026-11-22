# Backend Odwołania2json (Python)

Serwer interfejsu graficznego (FastAPI) i wydania konfiguracji silnika. Backend nie ma bazy danych:
pracuje na plikach, więc nie wymaga Dockera ani żadnej usługi w tle. Sprawy wgrane w GUI przetwarza tym samym
kodem co CLI (`odwolania2json.pipeline.Engine`), a format wydania i wartości domyślne pól definiują wyłącznie
modele konfiguracji silnika (`engine/odwolania2json/config.py`).

Do uruchomienia ekstrakcji (`start.sh`, `start.bat`) backend nie jest potrzebny.

## Uruchomienie

Najprościej `gui.bat` albo `./gui.sh` z katalogu głównego: używają środowiska `engine/.venv`, doinstalowują
FastAPI i uvicorn, uruchamiają serwer i otwierają http://127.0.0.1:8000. Ręcznie, w osobnym środowisku:

```bash
python3 -m venv backend/.venv               # bez ensurepip: python3 -m venv --without-pip backend/.venv
python3 -m pip --python backend/.venv/bin/python install -r backend/requirements-dev.txt
backend/.venv/bin/python backend/manage.py serve --reload   # GUI: http://127.0.0.1:8000, API: /docs
```

Serwer serwuje zbudowany interfejs z `o2j_backend/static` (budowanie: `npm run build` w katalogu głównym).
Klucz API modelu językowego czyta z `.env` w katalogu głównym, tak jak CLI.

## Sprawy z interfejsu

| Ścieżka | Zawartość |
| --- | --- |
| `gui-data/sprawy/<id>/case.json` | nazwa sprawy, stan i metadane dokumentów |
| `gui-data/sprawy/<id>/input/` | wgrane PDF-y (z archiwum ZIP rozpakowane) |
| `gui-data/sprawy/<id>/output/` | wyniki silnika, jeden JSON na PDF, jak w `./output` z CLI |
| `gui-data/sprawy/<id>/trace/`, `markdown/` | ślad ekstrakcji i tekst z Docling każdego dokumentu |
| `gui-data/sprawy/<id>/review/` | wyniki po poprawkach i zatwierdzeniu przez człowieka |
| `gui-data/audit.jsonl` | dziennik zdarzeń: wgranie, przetworzenie, poprawki pól, zatwierdzenia |

Katalog zmienia zmienna `O2J_GUI_DATA`. Przetwarzanie: jeden wątek konwertuje dokumenty po kolei (Docling na CPU),
a wywołania LLM idą do puli wątków (`settings.llm_concurrency`). Dokumenty przerwane restartem serwera wracają
do kolejki. Zmiana `engine/config/release.json` działa od następnego dokumentu, bez restartu. `O2J_NO_LLM=1`
wyłącza model językowy.

## Gdzie jest konfiguracja

| Ścieżka | Rola |
| --- | --- |
| `config/seed/*.yaml` | konfiguracja robocza (szkic) i jedyne źródło prawdy: typy dokumentów, słowniki, profile Docling i LLM |
| `config/seed/llm_providers.yaml` | metadane dostawców i modeli LLM dla GUI (lokalizacja danych, wielkość, licencja); silnik ich nie czyta |
| `config/releases/<wersja>.json` | opublikowane wydanie: wersja, SHA-256, autor, data, opis zmian i snapshot `release.json` |
| `engine/config/release.json` | aktywne wydanie, które czyta CLI silnika |

```
config/seed/*.yaml ──publish──▶ config/releases/<wersja>.json ──activate──▶ engine/config/release.json
  (edycja: plik lub GUI)          (niezmienne, SHA-256)                       (CLI oceniane przez organizatora)
```

- **Publikacja** buduje wydanie z YAML tak samo jak `odwolania2json build-release` i sprawdza je modelami
  silnika oraz tak jak `validate-config`: nazwy normalizatorów i walidatorów, regexy, sekcje, słowniki,
  grupy i profile (`config_problems` w `engine/odwolania2json/config.py`). Plik wydania powstaje tylko wtedy,
  gdy jeszcze nie istnieje, więc opublikowanej wersji nie da się nadpisać.
- **Aktywacja** zapisuje snapshot wydania do `engine/config/release.json` w formacie bajt w bajt zgodnym
  z `build-release`. Wycofanie zmian to aktywacja poprzedniej wersji. Wydanie, którego plik zmieniono po
  publikacji (niezgodny SHA-256) albo które odwołuje się do wtyczki usuniętej z kodu, nie zostanie aktywowane.
- **Status.** Aktywne jest wydanie o tym samym SHA-256 co `engine/config/release.json`. Gdy ten plik
  zbudowano poleceniem `build-release` bez publikacji, żadne wydanie nie jest aktywne.

Pliki wydań trafiają do repozytorium, więc historia konfiguracji jest też w historii git.

## Polecenia `manage.py`

| Polecenie | Co robi |
| --- | --- |
| `publish --version V [--summary] [--author] [--no-activate]` | zapisuje konfigurację z `config/seed` jako niezmienne wydanie i domyślnie je aktywuje |
| `activate --version V` | aktywuje istniejące wydanie, także przy wycofaniu zmian |
| `releases` | lista wydań ze statusem |
| `serve [--host] [--port] [--reload] [--open]` | uruchamia serwer GUI i API (uvicorn); `--open` otwiera przeglądarkę |

## API

| Metoda i ścieżka | Wynik |
| --- | --- |
| `GET /api/health` | stan usługi |
| `GET /api/system` | wydanie konfiguracji, model LLM i źródło klucza (bez wartości), wersja Docling, kolejka |
| `GET /api/cases`, `POST /api/cases` | lista spraw z wynikami; nowa sprawa z plików PDF lub ZIP (`multipart/form-data`: `files`, `name`) |
| `GET`, `DELETE /api/cases/{id}` | sprawa z wynikami i ostrzeżeniami walidatorów; usunięcie |
| `POST /api/cases/{id}/reprocess` | ponowne przetworzenie (usuwa poprawki) |
| `GET /api/cases/{id}/results.zip` | wyniki sprawy w układzie `output/<sprawa>/<plik>.json`, z poprawkami |
| `GET /api/cases/{id}/documents/{dok}/pdf`, `/markdown`, `/trace` | PDF, tekst z Docling, ślad ekstrakcji |
| `PUT`, `DELETE /api/cases/{id}/documents/{dok}/review` | zapis poprawek i zatwierdzenia; przywrócenie wyniku silnika |
| `GET /api/audit` | dziennik zdarzeń |
| `GET /api/config/active` | konfiguracja, której używa silnik (`engine/config/release.json`) |
| `GET /api/document-types/{kod}/llm-schemas`, `/source` | schematy JSON wysyłane do LLM; plik YAML typu |
| `GET /api/llm-models` | wielkość i licencja modeli z `config/seed/llm_providers.yaml` |
| `GET /api/releases` | lista wydań (bez snapshotu) |
| `GET /api/releases/active` | aktywne wydanie ze snapshotem; 404, gdy `release.json` nie odpowiada żadnemu wydaniu |
| `GET /api/releases/{wersja}` | wydanie ze snapshotem |
| `POST /api/releases` | publikacja z GUI, jak `publish` (JSON: `version`, `summary`, `author`, `activate`); 409, gdy wersja już istnieje albo YAML nie przechodzi walidacji |
| `POST /api/releases/{wersja}/activate` | aktywacja z GUI, jak `activate`; wycofanie zmian to aktywacja starszego wydania |
| `GET /api/config/draft` | bieżąca konfiguracja z YAML w formacie `release.json`; 409, gdy pliki nie przechodzą walidacji |
| `GET /api/llm-providers` | dostawcy LLM z `config/seed/llm_providers.yaml` |

## Testy

```bash
cd backend && .venv/bin/python -m pytest -q
```

Testy działają na kopii `config/seed` i sprawach w katalogu tymczasowym, z kolejką bez silnika, więc nie
zmieniają plików repozytorium i nie uruchamiają Docling.
