# Backend Odwołania2json (Python)

API (FastAPI), baza PostgreSQL (SQLAlchemy 2, migracje Alembic) i wydania konfiguracji silnika.
Backend korzysta z modeli konfiguracji silnika (`engine/odwolania2json/config.py`). Format wydania
i wartości domyślne pól definiuje więc wyłącznie silnik.

## Uruchomienie

```bash
docker compose up -d db                     # PostgreSQL 18 na 127.0.0.1:5432
python3 -m venv backend/.venv               # bez ensurepip: python3 -m venv --without-pip backend/.venv
python3 -m pip --python backend/.venv/bin/python install -r backend/requirements-dev.txt
backend/.venv/bin/python backend/manage.py migrate   # schemat bazy
backend/.venv/bin/python backend/manage.py seed      # konfiguracja z config/seed/*.yaml + wydanie startowe
backend/.venv/bin/python backend/manage.py serve --reload   # API: http://127.0.0.1:8000/docs
```

Adres bazy pochodzi z `DATABASE_URL` (zmienna środowiskowa albo `.env` w katalogu repozytorium).
Domyślnie backend łączy się z `postgresql://o2j:o2j@localhost:5432/odwolania2json`, czyli z kontenerem
z `docker-compose.yml`. Dane bazy są w wolumenie `pgdata`; `docker compose down -v` je usuwa.

## Polecenia `manage.py`

| Polecenie | Co robi |
| --- | --- |
| `migrate [rewizja]` | stosuje migracje (domyślnie do `head`) |
| `downgrade <rewizja>` | cofa migracje; `base` usuwa cały schemat |
| `seed [--seed-dir DIR] [--no-publish]` | zastępuje konfigurację w bazie treścią `config/seed/*.yaml`; przy pustej liście wydań publikuje wydanie startowe |
| `export [--version V] [--out PLIK]` | bieżąca konfiguracja z bazy jako `release.json`, bez publikacji |
| `publish --version V [--summary] [--no-activate] [--out PLIK]` | zapisuje niezmienne wydanie i domyślnie je aktywuje |
| `activate --version V [--out PLIK]` | aktywuje istniejące wydanie, także przy wycofaniu zmian |
| `releases` | lista wydań |
| `serve [--host] [--port] [--reload]` | uruchamia API (uvicorn) |

Aby CLI silnika używał konfiguracji z bazy:
`manage.py publish --version 2026.11.22 --summary "…" --out engine/config/release.json`.

## Jak konfiguracja przechodzi przez bazę

```
config/seed/*.yaml ──seed──▶ tabele konfiguracji ──publish──▶ config_release.snapshot ──▶ engine/config/release.json
                           (edycja przez API/UI)            (niezmienne, SHA-256)          (CLI oceniane przez organizatora)
```

- **Import** (`seed`) waliduje YAML modelami silnika, zapisuje komplet wartości i usuwa z bazy elementy,
  których nie ma w plikach. Potem eksportuje konfigurację z powrotem i porównuje ją ze źródłem. Jeśli
  silnik dostanie nowe pole, a baza nie będzie miała na nie kolumny, import zatrzyma się z komunikatem,
  zamiast to pole po cichu zgubić.
- **Eksport** daje plik bajt w bajt identyczny z `odwolania2json build-release`. Profile i słowniki są
  posortowane po kodzie, a typy dokumentów zachowują kolejność ze źródła, bo przy remisie klasyfikacji
  silnik wybiera typ wcześniejszy.
- **Wydania** są niezmienne: trigger `config_release_immutable` blokuje zmianę wersji, treści i skrótu.
  Częściowy indeks unikalny pozwala na tylko jedno aktywne wydanie.

## Schemat

Konfiguracja (kolumny nazwane jak pola silnika):

| Tabela | Zawartość |
| --- | --- |
| `engine_settings` | ustawienia wydania (jeden wiersz): wynik dla nieobsługiwanych dokumentów, domyślny profil LLM, równoległość |
| `conversion_profile` | ustawienia Docling (OCR, tabele, limity) |
| `llm_provider` | dostawca API: adres, lokalizacja danych, opis (`config/seed/llm_providers.yaml`) |
| `llm_profile` | model i parametry wywołań; nazwa zmiennej z kluczem API (samego klucza baza nie przechowuje) |
| `dictionary`, `dictionary_entry` | słowniki, np. powody czynności 1–12 |
| `document_type` | typ dokumentu i reguły klasyfikacji |
| `document_section`, `list_definition`, `extraction_group`, `field_definition` | sekcje tekstu, listy, grupy wywołań LLM, pola z regułami, normalizatorami i walidatorami |
| `config_release` | niezmienne wydania: snapshot `release.json`, SHA-256, status `draft`/`active`/`archived` |

Dane robocze, przygotowane pod sprawy, weryfikację i ewaluację (API jeszcze ich nie obsługuje):
`case_file`, `document`, `conversion_artifact`, `processing_job`, `document_result`, `field_result`,
`correction`, `evaluation_run`, `audit_log`.

Struktury należące do silnika (reguły, normalizatory, walidatory, wzorce klasyfikacji) oraz snapshot
wydania i wynikowy JSON dokumentu mają typ `json`. Zachowuje on kolejność kluczy, więc pliki odtworzone
z bazy są identyczne ze źródłem. Pozostałe dokumenty JSON mają typ `jsonb`.

## Zmiana schematu

1. Zmień `o2j_backend/models.py`.
2. `cd backend && .venv/bin/alembic revision --autogenerate -m "opis"`. Przejrzyj wygenerowany plik w
   `migrations/versions/`; autogenerate nie obsługuje triggerów ani usuwania typów enum.
3. `manage.py migrate`, potem `cd backend && .venv/bin/alembic check` (schemat zgodny z modelami).

## Testy

```bash
cd backend && .venv/bin/python -m pytest -q
```

Testy działają na osobnej bazie `odwolania2json_test`, którą kontener tworzy przy pierwszym starcie
(`deploy/postgres/initdb/`). Każdy test działa w transakcji wycofywanej po zakończeniu, a całość
zaczyna się od pełnego cyklu migracji w dół i w górę. Gdy baza jest niedostępna, testy są pomijane.
