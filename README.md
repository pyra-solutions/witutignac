# Odwołania2json

**Ekstrakcja danych z dokumentów odwołań do Krajowej Izby Odwoławczej do modelu JSON.**

Rozwiązanie wyzwania Urzędu Zamówień Publicznych na HackNation 2026. Program czyta pliki PDF sprawy
(odwołanie, pełnomocnictwo, potwierdzenie przelewu), rozpoznaje rodzaj dokumentu po treści, wyodrębnia
dane i zapisuje jeden plik JSON na dokument, w strukturze z `oczekiwane-json`.

Działa lokalnie na CPU, bez GPU. Tekst z PDF, także ze skanów, odczytuje Docling z OCR. W tekście skanów
silnik przywraca polskie znaki zgubione przez OCR słownikiem SJP (licencja Apache 2.0). Pola odczytują
reguły i mały otwarty model językowy Qwen3.5-9B (licencja Apache 2.0) przez endpoint UE Eden AI (dostawca FlexAI,
przetwarzanie w UE).

## Uruchomienie

Wymagany jest Python 3.13 lub nowszy.

1. Umieść pliki w `input/<sprawa>/*.pdf`.
2. Uruchom skrypt z katalogu głównego:

   ```bat
   start.bat
   ```

   Na Linuksie: `./start_linux.sh` (albo `./start.sh`, który działa też na macOS).
   Na serwerze oceny organizatora: `sudo bash run.sh`, opis w [RUN.md](RUN.md).

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

### Interfejs graficzny

```bat
gui.bat
```

Na Linuksie i macOS: `./gui.sh`. Skrypt korzysta z tego samego środowiska `engine/.venv` co `start.bat`
(brakujące pakiety FastAPI i uvicorn doinstalowuje), uruchamia serwer na tym komputerze i otwiera
w przeglądarce adres http://127.0.0.1:8000. Zatrzymanie: Ctrl+C w oknie skryptu. Inny port: zmienna `PORT`.

W interfejsie można:

- wgrać pliki PDF sprawy (albo archiwum ZIP) i przetworzyć je tym samym silnikiem co `start.bat`,
- obejrzeć wynik obok PDF-u: przy każdym polu źródło wartości (reguła, LLM, wyliczona), strona, cytat
  i ostrzeżenia walidatorów, a po kliknięciu pola jego podświetlenie w PDF,
- zobaczyć tekst z Docling, wynikowy JSON i przebieg przetwarzania: wyniki klasyfikacji, OCR, wywołania LLM
  z dostawcą i regionem przetwarzania,
- poprawić pola, zatwierdzić dokument i pobrać wyniki sprawy jako ZIP w układzie katalogu `output`,
- przejrzeć konfigurację silnika: typy dokumentów, słowniki, modele LLM, profile Docling, wydania i dziennik zmian.

Sprawy z interfejsu trafiają do katalogu `gui-data/`, a nie do `input/` i `output/`.
Node.js nie jest potrzebny: zbudowany interfejs jest w `backend/o2j_backend/static`.

### Klucz API modelu językowego

Klucz musi być w pliku `.env` w katalogu głównym, na wzór `.env.example`:

```
EDEN_AI_API_KEY=...
```

Zmienna `EDEN_AI_API_KEY` ustawiona w systemie albo poleceniem `set` ma pierwszeństwo przed plikiem `.env`.
Na starcie program podaje, skąd wziął klucz i ile ma on znaków (bez samej wartości). Gdy API odrzuci klucz
(HTTP 401), program pisze to raz i resztę dokumentów przetwarza samymi regułami.

Bez klucza program działa na samych regułach i nadal zapisuje wszystkie pliki JSON, ale odczytuje mniej pól.

### Diagnoza, gdy coś nie działa

```bat
diagnoza.bat
```

Na Linuksie i macOS: `./diagnoza.sh`. Skrypt wymaga środowiska założonego wcześniej przez `start.bat`.
Sprawdza po kolei Pythona i zależności, konfigurację, plik `.env` i klucz API, próbne zapytanie do API,
dane wejściowe, zapis wyników i konwersję jednego PDF-a przez Docling. Każdy problem ma podpowiedź,
co zrobić. Raport trafia do `diagnoza.txt` i można go przesłać: nie zawiera klucza, tylko jego źródło, długość
i odcisk SHA-256 (8 znaków). Po odcisku można porównać klucze na dwóch komputerach.
Opcje `--no-api` i `--no-convert` pomijają zapytanie do API i konwersję PDF-a.
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
| [backend/README.md](backend/README.md) | serwer interfejsu graficznego: API i wydania konfiguracji |
| [apps/web/README.md](apps/web/README.md) | interfejs graficzny: ekrany i praca nad kodem |

Nowy rodzaj dokumentu to nowy plik YAML w `config/seed/document_types/`, bez zmian w kodzie.

## Struktura repozytorium

| Katalog | Zawartość |
| --- | --- |
| `engine/` | silnik ekstrakcji w Pythonie (CLI `odwolania2json`) i jego konfiguracja `engine/config/release.json` |
| `config/seed/` | definicje rodzajów dokumentów, słowniki i profile modeli (YAML); jedyne źródło konfiguracji |
| `config/releases/` | opublikowane, niezmienne wydania konfiguracji (historia `release.json`) |
| `input/`, `output/` | pliki wejściowe i wyniki |
| `backend/` | serwer interfejsu graficznego (FastAPI) i zbudowany interfejs; niepotrzebny do uruchomienia ekstrakcji |
| `apps/web/` | kod źródłowy interfejsu graficznego (Angular) |
| `gui-data/` | sprawy wgrane przez interfejs graficzny (tworzony przy pierwszym użyciu, poza repozytorium) |
| `docs/` | dokumentacja |
| `deploy/` | instalacja na serwerze oceny (`deploy/install.sh`); uruchomienie: `run.sh`, opis w `RUN.md` |
