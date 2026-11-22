# Silnik ekstrakcji (engine/)

Silnik zamienia PDF-y odwołań KIO na pliki JSON. Działa lokalnie na CPU: Docling czyta PDF i eksportuje Markdown, reguły i LLM wyciągają z niego pola, a konfiguracja decyduje o wszystkim, co zależy od typu dokumentu.

## Uruchomienie

```bash
./start_linux.sh      # Linux (to samo co ./start.sh)
./start.sh            # Linux/macOS
start.bat             # Windows
```

Skrypt przy pierwszym uruchomieniu tworzy `engine/.venv` i instaluje `engine/requirements.txt` (Python 3.13+). Potem przetwarza `./input/<sprawa>/*.pdf` do `./output/<sprawa>/<nazwa pliku>.json`.

Na serwerze oceny organizatora (Ubuntu 24.04, 2 vCPU, Python 3.12 w systemie) układ katalogów jest taki, jak wymaga organizator:

```text
/opt/solution/
├── RUN.md              kopia RUN.md z repozytorium: komenda oceny
├── .env                klucz API (EDEN_AI_API_KEY)
├── input/              dokumenty do przetworzenia
├── output/             wyniki
└── odwolania2json/     repozytorium: kod, konfiguracja, Python, pakiety i modele
```

```bash
cd /opt/solution && git clone -b diagnoza-klucz-bzp https://github.com/pyra-solutions/witutignac.git odwolania2json
cd /opt/solution && bash odwolania2json/deploy/install.sh   # raz, przed oceną, bez sudo
cp /opt/solution/odwolania2json/RUN.md /opt/solution/RUN.md
cd /opt/solution && sudo bash odwolania2json/run.sh         # komenda oceny z RUN.md
```

`run.sh` bierze `input/`, `output/` i `.env` z katalogu, z którego uruchamia się komendę (`/opt/solution`). `deploy/install.sh` instaluje Pythona 3.14 przez uv w `.tools/` i pakiety w wersjach z `engine/requirements.lock.txt`. Pobiera też modele Docling i RapidOCR do katalogu projektu. Na koniec robi przebieg próbny, powtarza go bez dostępu do Hugging Face i porównuje wyniki, a potem uruchamia diagnozę klucza API. `run.sh` niczego nie pobiera (`HF_HUB_OFFLINE=1`), działa bez cache i zapisuje dziennik do `logs/`. Pod `sudo` katalog domowy to `/root`, dlatego modele leżą w `/opt/solution/odwolania2json/.cache`, a nie w `~/.cache`. `sudo bash odwolania2json/run.sh diagnoza` uruchamia diagnozę środowiska.

Dodatkowe argumenty trafiają do polecenia `run`:

| Argument | Działanie |
| --- | --- |
| `--no-llm` | tylko reguły deterministyczne, bez wywołań LLM |
| `--trace-dir DIR` | zapisuje ślad ekstrakcji `*.trace.json` dla każdego dokumentu |
| `--llm-profile ID` | inny profil LLM z konfiguracji (np. `eden-ministral-8b`) |
| `--config PATH` | inny `release.json` albo katalog YAML (`config/seed`) |
| `--cache DIR` | katalog cache konwersji i LLM (`none` wyłącza) |

LLM wymaga klucza API w zmiennej wskazanej przez profil (domyślnie `EDEN_AI_API_KEY`). Silnik czyta też plik `.env` z katalogu głównego. Bez klucza działa na samych regułach i zawsze zapisuje JSON.

Zmienne `LLM_BASE_URL`, `LLM_MODEL` i `LLM_API_KEY` nadpisują profil, więc można podłączyć dowolny serwer zgodny z API OpenAI bez edycji plików.

## Pozostałe polecenia

```bash
export PYTHONPATH=engine
P=engine/.venv/bin/python
$P -m odwolania2json evaluate --pred output --gold ścieżka/do/dane   # F1 względem wzorców (całe drzewo katalogów, także dane/skany)
$P -m odwolania2json build-release                                   # config/seed/*.yaml -> engine/config/release.json
$P -m odwolania2json validate-config --config config/seed            # sprawdzenie konfiguracji
$P -m odwolania2json plugins                                         # lista normalizatorów i walidatorów
$P -m pytest engine/tests                                            # testy jednostkowe
```

## Jak przetwarzany jest dokument

0. **Wstępna klasyfikacja PDF-ów cyfrowych** (`settings.preclassify_pages: 2`, `preclassify_margin: 1.0`). Przed Doclingiem silnik odczytuje warstwę tekstową 2 pierwszych stron, co trwa kilka milisekund, i liczy na niej te same wzorce co w punkcie 2. Dokument, któremu do progu każdego rodzaju brakuje co najmniej 1 punktu, dostaje `{}` bez konwersji. Długie dokumenty spoza klas zajmowały wcześniej 11–30 s każdy. Skany (poniżej 80 znaków warstwy tekstowej na stronę) i dokumenty bliższe progu idą pełną ścieżką, a ostateczną klasyfikację dokumentów spraw robi się jak dotąd na tekście z Doclinga. Decyzję zapisuje ślad ekstrakcji (`preclassification`) i dziennik („bez konwersji: warstwa tekstowa 2 s.”).
1. **Konwersja (Docling, CPU).** Wynik trafia do cache po SHA-256 pliku, wersji Docling i profilu konwersji. Plik bez warstwy tekstowej (skan) jest czytany OCR całych stron (RapidOCR PP-OCRv6 `pl`; porównanie z Tesseractem i EasyOCR w [`raport-jakosci.md`](raport-jakosci.md)), tylko 3 pierwsze strony (`scanned_max_pages`), bo OCR to około 5 s na stronę, a wartości pól są prawie zawsze na stronach 1–2. Dokumenty są konwertowane po kolei (`settings.convert_workers`, domyślnie 1: na 6-rdzeniowym laptopie kilka procesów nie skracało czasu), a wywołania LLM startują od razu po konwersji każdego dokumentu. Budżet czasu partii (`settings.batch_time_budget_s`, w wydaniu 2400 s przy limicie organizatora 45 min na 150 PDF-ów) działa tak:
   - Po pierwszych dokumentach (przy 150: po 10) silnik przed każdym kolejnym prognozuje czas pozostałych ze średniej dotychczasowej.
   - Gdy prognoza przekracza 85% pozostałego budżetu, czyta ze skanów 2 strony.
   - Gdy przekracza cały budżet, czyta 1 stronę.
   - Gdy na dokument zostaje mniej niż 5 s, czyta 1 stronę i używa modelu OCR `tiny`.
   - Gdy tempo wraca, wraca do ustawień bazowych.

   Liczba stron PDF-ów cyfrowych się nie zmienia, a każdą zmianę poziomu zapisuje dziennik („Budżet czasu …”). Pomiary na serwerze oceny są w [`raport-jakosci.md`](raport-jakosci.md). W tekście skanów silnik poprawia typowe pomyłki OCR: „Ñ” na „Ń”, „o” w liczbach na „0” („9994328o29”), „Sp. z 0.o.” na „Sp. z o.o.”, gravis i daszek, których nie ma w polskim tekście („Systèmy” → „Systemy”), oraz przecinek w adresie e-mail („a,wrobel@” → „a.wrobel@”). Przywraca też polskie znaki zgubione przez OCR („odwolania” → „odwołania”) słownikiem SJP i pisownią z tego samego dokumentu (`settings.ocr_restore_diacritics`, `diacritics.py`; zasady i wynik w [`raport-jakosci.md`](raport-jakosci.md)). Na skanach z nagłówkiem w dwóch kolumnach (etykiety „Odwołujący:”, „Zamawiający:”, „Dotyczy:” po lewej, dane po prawej) Docling wypisuje najpierw wszystkie etykiety, potem wszystkie dane. Silnik układa wtedy elementy na nowo według ich położenia na stronie: etykieta, jej dane, następna etykieta (`scanned_label_columns` w profilu konwersji, `layout.py`).
2. **Klasyfikacja.** Wzorce z wagami z konfiguracji, sprawdzane wyłącznie w treści, bo organizator zastrzega, że nazwa pliku może być dowolna. Wzorce mogą mieć ujemną wagę dla cech dokumentów spoza klas, np. sygnatury orzeczenia KIO. Dokument, który nie osiąga progu żadnego typu, dostaje `{}` (ustawienie `unsupported_output`).
3. **Reguły deterministyczne.** Regexy w nazwanych sekcjach tekstu i dopasowanie słowników.
4. **LLM.** Jedno wywołanie na grupę pól, ze schematem JSON zbudowanym z definicji pól i wymuszoną odpowiedzią.
5. **Arbitraż.** Strategia pola (`llm_first`, `rules_first`, `rules_only`, `llm_only`) wybiera źródło. Wartość z LLM, której nie ma w tekście (`grounding`), jest odrzucana. Jeśli wybrana wartość nie przejdzie normalizacji albo walidatora z poziomem `error`, silnik bierze wartość z następnego źródła (np. z reguły, gdy LLM wskazał adresata pisma zamiast Zamawiającego), a ślad zapisuje powód odrzucenia. Na skanach wartość z LLM może się różnić od tekstu OCR polskimi znakami, spacjami i pomyłkami 0/o, 1/l/i, ale musi wystąpić w nim w całości (`ocr_tolerant_grounding`).
6. **Normalizacja, walidacja, pola wyliczane, limity list.** Potem zapis JSON w kolejności pól z konfiguracji.

## Jak dodać nowy typ dokumentu (bez zmian w kodzie)

1. Dodaj plik `config/seed/document_types/<kod>.yaml`. Najprościej skopiować `przelew.yaml`.
2. Ustaw `classification`: wzorce charakterystyczne dla treści tego dokumentu i próg `min_score`. Nie używaj `filename_patterns`, bo nazwy plików w zbiorze testowym mogą być dowolne. Jedna cecha nie powinna wystarczać do przekroczenia progu. Sprawdź, czy dokumenty z `dane/negatywne` zostają poniżej progu.
3. Opisz pola w `fields`. Ścieżka pola wyznacza kształt wyniku: `A.b` to obiekt, `A[].b` to lista obiektów. Kolejność pól to kolejność kluczy w JSON.
4. Dla każdego pola podaj `instruction` dla LLM i przypisz je do grupy z `groups`. Opcjonalnie dodaj `rules` (regex), `normalizers`, `validators` i `strategy`. Pole zależne od innego pola tego samego elementu listy dostaje `only_if_present: <ścieżka>`. Na przykład e-mail pełnomocnika zostaje tylko wtedy, gdy jest nazwisko pełnomocnika. Pole, które ma sens tylko przy kilku elementach listy, dostaje `only_if_list_size_at_least: N`.
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
│   ├── diacritics.py   przywracanie polskich znaków w tekście skanów (słownik w data/)
│   ├── rules.py        klasyfikacja i ekstraktory deterministyczne
│   ├── llm.py          klient API zgodnego z OpenAI, ponawianie, cache
│   ├── assemble.py     drzewo pól: wynik JSON, schemat JSON dla LLM
│   ├── pipeline.py     etapy potoku i arbitraż
│   ├── normalizers.py  rejestr normalizatorów
│   ├── validators.py   rejestr walidatorów (NIP, REGON, PESEL, KRS, IBAN...)
│   └── evaluate.py     F1 pole po polu
├── config/release.json wydanie konfiguracji używane przez CLI
├── tools/              build_pl_diacritics.py: odtworzenie słownika polskich znaków z hunspell-pl
├── tests/
└── requirements.txt
config/seed/            źródłowe pliki YAML konfiguracji
```
