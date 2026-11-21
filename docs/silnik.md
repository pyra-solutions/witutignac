# Silnik ekstrakcji (engine/)

Silnik zamienia PDF-y odwołań KIO na pliki JSON. Działa lokalnie na CPU: Docling czyta PDF i eksportuje Markdown, reguły i LLM wyciągają z niego pola, a konfiguracja decyduje o wszystkim, co zależy od typu dokumentu.

## Uruchomienie

```bash
./start.sh            # Linux/macOS
start.bat             # Windows
```

Skrypt przy pierwszym uruchomieniu tworzy `engine/.venv` i instaluje `engine/requirements.txt` (Python 3.13+). Potem przetwarza `./input/<sprawa>/*.pdf` do `./output/<sprawa>/<nazwa pliku>.json`.

Dodatkowe argumenty trafiają do polecenia `run`:

| Argument | Działanie |
| --- | --- |
| `--no-llm` | tylko reguły deterministyczne, bez wywołań LLM |
| `--trace-dir DIR` | zapisuje ślad ekstrakcji `*.trace.json` dla każdego dokumentu |
| `--llm-profile ID` | inny profil LLM z konfiguracji (np. `gemini-dev`) |
| `--config PATH` | inny `release.json` albo katalog YAML (`config/seed`) |
| `--cache DIR` | katalog cache konwersji i LLM (`none` wyłącza) |

LLM wymaga klucza API w zmiennej wskazanej przez profil (domyślnie `OVH_AI_ENDPOINTS_ACCESS_TOKEN`). Silnik czyta też plik `.env` z katalogu głównego. Bez klucza działa na samych regułach i zawsze zapisuje JSON.

Zmienne `LLM_BASE_URL`, `LLM_MODEL` i `LLM_API_KEY` nadpisują profil, więc można podłączyć dowolny serwer zgodny z API OpenAI bez edycji plików.

## Pozostałe polecenia

```bash
export PYTHONPATH=engine
P=engine/.venv/bin/python
$P -m odwolania2json evaluate --pred output --gold ścieżka/do/dane   # F1 względem wzorców
$P -m odwolania2json build-release                                   # config/seed/*.yaml -> engine/config/release.json
$P -m odwolania2json validate-config --config config/seed            # sprawdzenie konfiguracji
$P -m odwolania2json plugins                                         # lista normalizatorów i walidatorów
$P -m pytest engine/tests                                            # testy jednostkowe
```

## Jak przetwarzany jest dokument

1. **Konwersja (Docling, CPU).** Wynik trafia do cache po SHA-256 pliku, wersji Docling i profilu konwersji. Plik bez warstwy tekstowej (skan) jest czytany OCR całych stron.
2. **Klasyfikacja.** Wzorce z wagami z konfiguracji, sprawdzane wyłącznie w treści, bo organizator zastrzega, że nazwa pliku może być dowolna. Wzorce mogą mieć ujemną wagę dla cech dokumentów spoza klas, np. sygnatury orzeczenia KIO. Dokument, który nie osiąga progu żadnego typu, dostaje `{}` (ustawienie `unsupported_output`).
3. **Reguły deterministyczne.** Regexy w nazwanych sekcjach tekstu i dopasowanie słowników.
4. **LLM.** Jedno wywołanie na grupę pól, ze schematem JSON zbudowanym z definicji pól i wymuszoną odpowiedzią.
5. **Arbitraż.** Strategia pola (`llm_first`, `rules_first`, `rules_only`, `llm_only`) wybiera źródło. Wartość z LLM, której nie ma w tekście (`grounding`), jest odrzucana.
6. **Normalizacja, walidacja, pola wyliczane, limity list.** Potem zapis JSON w kolejności pól z konfiguracji.

## Jak dodać nowy typ dokumentu (bez zmian w kodzie)

1. Dodaj plik `config/seed/document_types/<kod>.yaml`. Najprościej skopiować `przelew.yaml`.
2. Ustaw `classification`: wzorce charakterystyczne dla treści tego dokumentu i próg `min_score`. Nie używaj `filename_patterns`, bo nazwy plików w zbiorze testowym mogą być dowolne. Jedna cecha nie powinna wystarczać do przekroczenia progu. Sprawdź, czy dokumenty z `dane/negatywne` zostają poniżej progu.
3. Opisz pola w `fields`. Ścieżka pola wyznacza kształt wyniku: `A.b` to obiekt, `A[].b` to lista obiektów. Kolejność pól to kolejność kluczy w JSON.
4. Dla każdego pola podaj `instruction` dla LLM i przypisz je do grupy z `groups`. Opcjonalnie dodaj `rules` (regex), `normalizers`, `validators` i `strategy`.
5. Uruchom `validate-config`, potem `build-release`, a następnie `run` na kilku przykładach z `--trace-dir`, żeby zobaczyć, skąd pochodzi każda wartość.

Przykład pola:

```yaml
- path: ZamowieniePubliczne.numer_ted
  group: strony_i_postepowanie
  instruction: Numer ogłoszenia TED w formacie 'NNNNNN-RRRR'.
  strategy: rules_first
  grounding: tokens
  rules:
    - {pattern: '(\d{4}\s*/\s*S\s*\d{1,3}\s*-\s*\d{4,7})', section: dotyczy}
  normalizers: [{name: ted_number}]
```

Nowy rodzaj normalizatora lub walidatora to jedna funkcja z dekoratorem `@normalizers.register("nazwa")` w `engine/odwolania2json/normalizers.py` (albo `validators.py`). Reszta potoku się nie zmienia.

## Struktura

```text
engine/
├── odwolania2json/
│   ├── cli.py          polecenia run, evaluate, build-release, validate-config, plugins
│   ├── config.py       model konfiguracji (Pydantic), wczytywanie YAML/JSON
│   ├── convert.py      Docling -> Markdown, wykrywanie skanów, cache
│   ├── rules.py        klasyfikacja i ekstraktory deterministyczne
│   ├── llm.py          klient API zgodnego z OpenAI, ponawianie, cache
│   ├── assemble.py     drzewo pól: wynik JSON, schemat JSON dla LLM
│   ├── pipeline.py     etapy potoku i arbitraż
│   ├── normalizers.py  rejestr normalizatorów
│   ├── validators.py   rejestr walidatorów (NIP, REGON, PESEL, KRS, IBAN...)
│   └── evaluate.py     F1 pole po polu
├── config/release.json wydanie konfiguracji używane przez CLI
├── tests/
└── requirements.txt
config/seed/            źródłowe pliki YAML konfiguracji
```
