# Odwołania2json: uruchomienie oceny

## Komenda

```bash
cd /opt/solution && sudo bash run.sh
```

Komenda przetwarza wszystkie pliki PDF z `/opt/solution/input`, także w podkatalogach spraw, i zapisuje wyniki
do `/opt/solution/output`. Nie zadaje pytań, nie otwiera przeglądarki i kończy się sama po ostatnim pliku.
Nie korzysta z Dockera ani z usług działających w tle, więc nie trzeba niczego uruchamiać wcześniej,
także po restarcie serwera.

Postęp widać na ekranie. Kopia przebiegu trafia do `/opt/solution/logs/run-<data>-<godzina>.log`.

## Wynik

Każdy PDF dostaje jeden plik JSON o tej samej nazwie i w tym samym podkatalogu:

```
input/case1/odwolanie_nr_1.pdf   ->  output/case1/odwolanie_nr_1.json
input/case1/przelew_nr_1.pdf     ->  output/case1/przelew_nr_1.json
```

- Rodzaj dokumentu (odwołanie, pełnomocnictwo, potwierdzenie przelewu) program rozpoznaje wyłącznie po treści.
  Nazwa pliku nie ma znaczenia.
- Dokument spoza tych rodzajów dostaje plik z zawartością `{}`.
- Uszkodzony plik nie zatrzymuje przetwarzania. Jego wynik to również `{}`.

## Usługi zewnętrzne i klucz API

Program korzysta z jednej usługi zewnętrznej:

| | |
|---|---|
| Usługa | Eden AI, endpoint UE `https://api.eu.edenai.run/v3` (Eden AI SAS, Francja) |
| Model | Qwen3.5-9B (licencja Apache 2.0), dostawca FlexAI, przetwarzanie w UE |
| Klucz | `/opt/solution/.env`, zmienna `EDEN_AI_API_KEY` |

Na starcie program podaje, skąd wziął klucz i ile ma on znaków, ale nie wypisuje samej wartości. Jeśli API
odrzuci klucz albo nie odpowiada, program pisze o tym i przetwarza resztę dokumentów samymi regułami.
Zapisuje wtedy nadal wszystkie pliki JSON, tylko z mniejszą liczbą pól.

Tekst z PDF-ów, także OCR skanów, program odczytuje lokalnie na CPU (Docling i RapidOCR). Modele są już
na dysku w `/opt/solution`, więc w czasie oceny program niczego nie pobiera.

## Gdy coś nie działa

```bash
cd /opt/solution && sudo bash run.sh diagnoza
```

Diagnoza sprawdza po kolei Pythona i pakiety, konfigurację, plik `.env` i klucz API, próbne zapytanie do API,
pliki wejściowe, zapis wyników i konwersję jednego PDF-a. Przy każdym problemie podaje, co zrobić.
Raport trafia do `/opt/solution/logs/diagnoza.txt` i nie zawiera wartości klucza.

## Środowisko na serwerze

| Ścieżka | Zawartość |
|---|---|
| `/opt/solution` | repozytorium projektu (kod, konfiguracja `engine/config/release.json`, dokumentacja `docs/`) |
| `/opt/solution/.tools/python` | Python 3.14 (systemowy Python 3.12 jest za stary, projekt wymaga 3.13+) |
| `/opt/solution/engine/.venv` | pakiety w wersjach z `engine/requirements.lock.txt` oraz modele RapidOCR |
| `/opt/solution/.cache/huggingface` | modele układu strony Docling |

Zespół przygotował środowisko wcześniej poleceniem `bash deploy/install.sh` (bez `sudo`). Opis rozwiązania
i dodawania nowych rodzajów dokumentów samą konfiguracją: [README.md](README.md) i [docs/](docs/).
