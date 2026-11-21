# Odwołania2json

**Ekstrakcja danych z dokumentów odwołań do Krajowej Izby Odwoławczej do modelu JSON.**

Rozwiązanie wyzwania Urzędu Zamówień Publicznych na HackNation 2026. Program czyta pliki PDF sprawy
(odwołanie, pełnomocnictwo, potwierdzenie przelewu), rozpoznaje rodzaj dokumentu po treści, wyodrębnia
dane i zapisuje jeden plik JSON na dokument, w strukturze z `oczekiwane-json`.

Działa lokalnie na CPU, bez GPU. Tekst z PDF, także ze skanów, odczytuje Docling z OCR. Pola odczytują
reguły i mały otwarty model językowy Qwen3.5-9B przez API OVHcloud z serwerami we Francji.

## Uruchomienie

Wymagany jest Python 3.13 lub nowszy.

1. Umieść pliki w `input/<sprawa>/*.pdf`.
2. Uruchom skrypt z katalogu głównego:

   ```bat
   start.bat
   ```

   Na Linuksie i macOS: `./start.sh`.

3. Wyniki znajdziesz w `output/<sprawa>/<nazwa pliku>.json`.

Pierwsze uruchomienie tworzy środowisko `engine/.venv` i instaluje zależności (około 2 GB, kilka minut).
Docling pobiera wtedy też swoje modele (około 0,5 GB), więc potrzebny jest dostęp do internetu.
Kolejne uruchomienia korzystają z gotowego środowiska.

Uruchomienie bez skryptu:

```bash
pip install -r requirements.txt
PYTHONPATH=engine python -m odwolania2json run --input input --output output
```

Na Windows zamiast `PYTHONPATH=engine` wykonaj najpierw `set PYTHONPATH=engine`.

### Klucz API modelu językowego

Klucz musi być w pliku `.env` w katalogu głównym, na wzór `.env.example`:

```
OVH_AI_ENDPOINTS_ACCESS_TOKEN=...
```

Bez klucza program działa na samych regułach i nadal zapisuje wszystkie pliki JSON, ale odczytuje mniej pól.
Zmienne `LLM_BASE_URL`, `LLM_MODEL` i `LLM_API_KEY` pozwalają podłączyć inny serwer zgodny z API OpenAI
bez zmian w plikach.

## Wejście i wynik

```
input/                          output/
├── case1/                      ├── case1/
│   ├── odwolanie_nr_1.pdf      │   ├── odwolanie_nr_1.json
│   ├── pelnomocnictwo_nr_1.pdf │   ├── pelnomocnictwo_nr_1.json
│   └── przelew_nr_1.pdf        │   └── przelew_nr_1.json
```

- Każdy wynik nazywa się tak samo jak plik wejściowy i leży w podkatalogu o tej samej nazwie.
- Rodzaj dokumentu jest rozpoznawany wyłącznie po treści, nazwa pliku nie ma znaczenia.
- Dokument spoza obsługiwanych rodzajów dostaje plik z zawartością `{}`.
- Uszkodzony plik nie zatrzymuje przetwarzania; jego wynik to również `{}`.

Opcje dodatkowe przekazywane do skryptu, np. `start.bat --trace-dir slady`:

| Opcja | Działanie |
| --- | --- |
| `--trace-dir DIR` | ślad ekstrakcji każdego dokumentu: skąd pochodzi każda wartość (reguła, LLM, cytat, strona) |
| `--no-llm` | tylko reguły, bez wywołań modelu językowego |

## Dokumentacja

| Dokument | Zawartość |
| --- | --- |
| [docs/llm.md](docs/llm.md) | wykorzystany model językowy, dostawca, parametry i sposób użycia |
| [docs/silnik.md](docs/silnik.md) | działanie silnika i dodawanie nowych rodzajów dokumentów samą konfiguracją |
| [docs/raport-jakosci.md](docs/raport-jakosci.md) | wyniki własnych testów jakości (F1) |
| [docs/plan.md](docs/plan.md) | plan rozwiązania i architektura |
| [backend/README.md](backend/README.md) | platforma: API i wydania konfiguracji |

Nowy rodzaj dokumentu to nowy plik YAML w `config/seed/document_types/`, bez zmian w kodzie.

## Struktura repozytorium

| Katalog | Zawartość |
| --- | --- |
| `engine/` | silnik ekstrakcji w Pythonie (CLI `odwolania2json`) i jego konfiguracja `engine/config/release.json` |
| `config/seed/` | definicje rodzajów dokumentów, słowniki i profile modeli (YAML); jedyne źródło konfiguracji |
| `config/releases/` | opublikowane, niezmienne wydania konfiguracji (historia `release.json`) |
| `input/`, `output/` | pliki wejściowe i wyniki |
| `backend/` | API (FastAPI) dla interfejsu graficznego, działa na plikach; niepotrzebne do uruchomienia ekstrakcji |
| `apps/web/` | interfejs graficzny (Angular) |
| `docs/` | dokumentacja |
