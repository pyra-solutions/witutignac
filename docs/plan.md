# Odwołania2json – plan rozwiązania

Stan na 21.11.2026 · @Witut

Rdzeń rozwiązania to silnik ekstrakcji w Pythonie 3.13+. Docling uruchomiony lokalnie na CPU zamienia PDF na Markdown, a reguły i mały otwarty model językowy (LLM) przez API w UE wyodrębniają z niego pola. Wszystko, co zależy od rodzaju dokumentu, opisują pliki YAML, więc nowy rodzaj dokumentu nie wymaga zmian w kodzie. Wokół silnika powstają backend FastAPI i interfejs graficzny w Angularze. Całość działa na plikach, bez bazy danych, kolejki i Dockera.

## Wymagania i ustalenia

Rdzeń oceniany przez organizatora musi być w Pythonie, a o wyniku etapu 1 decyduje w całości F1. Poniższe ustalenia pochodzą z README organizatora i z analizy 60 spraw treningowych.

| Ustalenie | Źródło | Co z tego wynika |
| --- | --- | --- |
| Python 3.13+, `requirements.txt`, uruchomienie przez CLI lub `start.bat` | README, sekcja 5 | Silnik i backend w Pythonie; `requirements.txt` w katalogu głównym instaluje wszystko, czego potrzebuje ekstrakcja |
| Wejście `./input/<sprawa>/*.pdf`, wyjście `./output/<sprawa>/<nazwa pliku>.json` | README, sekcja 3 | Plik wynikowy ma tę samą nazwę co wejściowy; typ dokumentu rozpoznajemy z treści |
| Dokumenty kategorii, których nie należy identyfikować, dają pusty plik `.json` | README, sekcja 6 (zmiana z 21.11.2026) | Klasyfikator ma próg pewności; dokument poniżej progu dostaje plik z zawartością `{}` |
| Test na laptopie biurowym: 16 GB RAM, Intel i7, bez GPU | README, sekcja 6 (zmiana z 21.11.2026) | Docling na CPU z limitem wątków; żadnych usług w tle, bo laptop może nie pozwolić na Dockera |
| LLM przez API firmy z serwerami w UE/EOG, która w polityce prywatności określa zakres i miejsce przetwarzania, dostarczone z kluczem API | README, sekcja 6 (zmiany z 21.11.2026) | Endpoint UE Eden AI (Eden AI SAS, Francja; hosting AWS Paryż) z modelem u FlexAI w regionie UE; klucz z limitem wydatków przekazany poza publicznym repozytorium |
| Etap 1: F1 = 100% oceny | README, sekcja 7 | Najpierw jakość ekstrakcji |
| Etap 2: F1 50%; mniejszy model LLM 1–20 pkt; rozszerzalność 1–20 pkt; inne funkcje, np. GUI, 1–10 pkt | README, sekcja 7 (zmiana z 21.11.2026) | Najmniejszy model, który utrzyma F1; nowe typy dokumentów bez kodu; GUI w Angularze |
| Tylko komponenty open source, w tym modele | README, sekcja 5 | Modele z otwartymi wagami na licencji Apache 2.0; bez Docker Desktop i innych narzędzi zamkniętych |
| Nowe klasy dokumentów przez pliki konfiguracyjne | README, sekcja 5 | Pliki YAML są jedynym źródłem konfiguracji; silnik dostaje z nich wydanie `release.json` |
| Dokumentacja techniczna z opisem użytego LLM | README, sekcja 4 (zmiana z 21.11.2026) | [`docs/llm.md`](llm.md): model, dostawca, parametry, sposób użycia |
| 60 spraw × 3 dokumenty, wszystkie PDF-y z warstwą tekstową z jednego generatora | analiza `dane/` | Zbiór testowy (realne sprawy) może mieć skany i inne układy, więc OCR i testy na symulowanych skanach |
| `czynnosc_powod_id`: 11 z 12 wartości w treningu | `dane/*/odwolanie.json` | Słownik powodów w YAML; 12. wartość („Projektowane postanowienia umowy”) podana w `oczekiwane-json/czynnosc_powod_id_dict.md` |
| `data` i `miejscowosc` = null w 15 z 60 odwołań; kilku zamawiających w 3 z 60 | `dane/*/odwolanie.json` | Null jest poprawną odpowiedzią; listy podmiotów obsługujemy od początku |
| Sumy kontrolne nie zgadzają się dla 74 ze 189 numerów NIP, 38 ze 123 REGON i 77 ze 120 rachunków | wzorce w `dane/` | Walidatory sum kontrolnych tylko ostrzegają i nie usuwają wartości |
| Wzorce w `oczekiwane-json/` mają komentarze `//`, a `pesel` jest raz liczbą, raz tekstem | `oczekiwane-json/`, `dane/` | Wynik to czysty JSON; typ pola `pesel` do potwierdzenia |
| Imię i nazwisko pełnomocnika (odwołanie) i mocodawcy (pełnomocnictwo) w mianowniku | `oczekiwane-json/` (zmiana z 21.11.2026) | Instrukcje pól wymagają mianownika; weryfikacja źródła `token_prefix` przyjmuje formy odmienione w tekście |
| 30 zeskanowanych dokumentów ze wzorcami (`dane/skany/`), także wydruki przelewów w układzie tabel | repozytorium organizatora (zmiana z 21.11.2026) | Ocena osobno dla skanów; reguły przelewów odporne na etykiety tabel i błędy OCR w etykietach |

## Architektura

![Architektura: silnik w Pythonie, konfiguracja w plikach, backend FastAPI, GUI w Angularze i API LLM w UE](architektura.png)

Źródło diagramu: [`architektura.svg`](architektura.svg).

| Komponent | Rola | Stan |
| --- | --- | --- |
| Silnik (`engine/`) | potok ekstrakcji; polecenia `run`, `evaluate`, `build-release`, `validate-config`, `plugins` | gotowy, F1 0,960 na samych regułach (60 spraw) |
| CLI (`start.bat`, `start_linux.sh`, `start.sh`) | przy pierwszym uruchomieniu tworzy środowisko i instaluje zależności, potem przetwarza `./input` do `./output` | gotowy |
| Konfiguracja (`config/seed/`, `config/releases/`, `engine/config/release.json`) | definicje typów dokumentów, słowniki, profile Docling i LLM; niezmienne wydania | gotowa dla trzech typów: odwołanie, pełnomocnictwo, potwierdzenie przelewu |
| Backend FastAPI (`backend/`) | API dla GUI: wydania, podgląd szkicu konfiguracji, dostawcy LLM; publikacja i aktywacja wydań | API do odczytu gotowe; edycja konfiguracji przez API do zrobienia |
| GUI w Angularze (`apps/web/`) | sprawy, weryfikacja pól z podglądem PDF, konfiguracja, wydania, jakość | wszystkie ekrany jako makieta na danych przykładowych; podłączenie do API do zrobienia |
| API LLM | Eden AI, model Qwen3.5-9B u FlexAI (UE) | gotowe; F1 0,993 na 15 sprawach kontrolnych |

Silnik to jeden rdzeń. CLI i backend wywołują ten sam kod, a backend korzysta z modeli konfiguracji silnika (Pydantic), więc format wydania definiuje wyłącznie silnik.

**Dlaczego bez bazy danych i Dockera (decyzja z 21.11.2026).** Pierwsza wersja backendu trzymała konfigurację w PostgreSQL uruchamianym w Dockerze. Zrezygnowaliśmy z tego z czterech powodów:

- Oceniający uruchamia rozwiązanie na laptopie biurowym. Docker na Windows wymaga WSL2, uprawnień administratora i wirtualizacji, a Docker Desktop nie jest open source.
- Dockera ani bazy nie da się zainstalować z `requirements.txt`.
- README premiuje konfigurację „jedynie przez pliki konfiguracyjne”. Baza obok plików YAML tworzyła drugie źródło prawdy.
- Etap 1 ocenia tylko F1, na które baza nie ma wpływu.

## Potok przetwarzania

Każdy dokument przechodzi te same kroki. Błąd jednego pliku nie zatrzymuje pozostałych, a jego wynik to `{}`.

1. **Konwersja (Docling, CPU).** PDF zamieniany jest na Markdown ze znacznikami podziału stron. Wynik trafia do cache na dysku. Klucz cache to SHA-256 pliku, wersja Docling i profil konwersji. Plik z bardzo małą ilością tekstu na stronę jest traktowany jako skan i czytany OCR całych stron.
2. **Klasyfikacja.** Wzorce z wagami z konfiguracji typu dokumentu, opcjonalnie ograniczone do początku tekstu. Wygrywa typ z najwyższym wynikiem, jeśli osiąga próg `min_score`. Dokument poniżej progu dostaje `{}` (ustawienie `unsupported_output`). Nazwa pliku nie wpływa na klasyfikację.
3. **Reguły deterministyczne.** Regexy w nazwanych sekcjach tekstu (np. „dotyczy”, pierwszy zarzut) i dopasowanie słowników.
4. **LLM.** Jedno wywołanie na grupę pól; dziś każdy typ dokumentu ma jedną grupę. Model dostaje fragment Markdown i schemat JSON zbudowany z definicji pól, a odpowiedź jest wymuszona schematem. Wywołania dla różnych dokumentów idą równolegle (`llm_concurrency`).
5. **Arbitraż.** Strategia pola (`llm_first`, `rules_first`, `rules_only`, `llm_only`) wybiera źródło wartości. Wartość z LLM, której nie da się odnaleźć w tekście dokumentu, jest odrzucana (weryfikacja źródła). Jeśli wybrana wartość nie przejdzie normalizacji albo walidatora z poziomem `error`, silnik bierze wartość z następnego źródła (np. z reguły, gdy LLM wskazał adresata pisma zamiast Zamawiającego), a ślad zapisuje powód odrzucenia. Na skanach wartość z LLM może się różnić od tekstu OCR polskimi znakami, spacjami i pomyłkami 0/o, 1/l/i, ale musi wystąpić w nim w całości (`ocr_tolerant_grounding`).
6. **Normalizacja i walidacja.** Nazwane funkcje z rejestru silnika z parametrami z konfiguracji. Walidator z poziomem `warning` tylko ostrzega, z poziomem `error` usuwa wartość. Półpauzę zamienioną przez Docling na łącznik silnik przywraca z warstwy tekstowej PDF.
7. **Pola wyliczane i limity list.** Na przykład opis powodu czynności pochodzi ze słownika na podstawie identyfikatora.
8. **Zapis.** JSON w kolejności pól z konfiguracji, z nazwą pliku wejściowego. Opcjonalnie powstaje też ślad ekstrakcji `*.trace.json` (opis w sekcji „Przejrzystość ekstrakcji”).

## Ustawienia Docling na CPU

Docling 2.151 (licencja MIT) działa na Pythonie 3.10–3.14 i całkowicie lokalnie. Domyślny eksport do Markdown ma jednak trzy pułapki, które usuwamy w ustawieniach poniżej ([dokumentacja Docling](https://github.com/docling-project/docling/tree/main/docs)).

**Konwersja: profil `conversion_profiles` w `config/seed/release.yaml`, wybierany przez typ dokumentu**

| Ustawienie | Wartość | Dlaczego |
| --- | --- | --- |
| Instalacja | `docling[rapidocr]` z `--extra-index-url https://download.pytorch.org/whl/cpu` (w `engine/requirements.txt`) | PyTorch tylko na CPU, bez bibliotek CUDA |
| Modele | pobierane przy pierwszym uruchomieniu (około 0,5 GB), potem z lokalnego cache | Kolejne uruchomienia nie potrzebują internetu poza wywołaniami LLM |
| Usługi zdalne | `enable_remote_services` wyłączone (domyślnie) | Docling nie wysyła treści dokumentu poza komputer |
| Silnik OCR | RapidOCR, `ocr_lang: [pl]`; Tesseract dostępny jako alternatywa w profilu | Polskie znaki diakrytyczne |
| Tryb OCR | domyślny (OCR tylko obszarów bez tekstu PDF); dla skanów `scanned_ocr_mode: full_page` | Cyfrowe PDF-y nie płacą czasem za OCR, a skany czytane są w całości |
| Zepsuta warstwa tekstu | `replace_broken_text_layer: true` | Strony z nieczytelnym tekstem zamiast liter idą do OCR |
| Tabele | `table_structure: true` | Potwierdzenia przelewów mają układ tabelaryczny |
| Limity | `max_pages: 6`, `document_timeout_s: 180` | Kluczowe dane są na pierwszych stronach; uszkodzony plik nie blokuje przetwarzania |
| Wątki CPU | `num_threads: 4` | Przewidywalne zużycie CPU |
| Ocena konwersji | `low_grade` i `mean_grade` z `ConversionResult.confidence` | Zapisywane w śladzie ekstrakcji |
| Rozdzielczość i model OCR | `ocr_scale: 3.0` (216 dpi), `ocr_model_size: small` | Skala 4 i model `medium` sprawdzone na 30 skanach: zysk znikomy albo wielokrotnie dłuższy OCR ([raport jakości](raport-jakosci.md)) |

**Eksport `export_to_markdown`**

| Parametr | Wartość | Dlaczego |
| --- | --- | --- |
| `included_content_layers` | `{BODY, FURNITURE}` | Domyślnie eksport obejmuje tylko `BODY`. Jeśli model układu uzna linię „Miejscowość, data” za nagłówek strony, bez tej opcji zniknie |
| `traverse_pictures` | `True` | Przy OCR całej strony tekst trafia pod element obrazu; bez tej opcji Markdown skanu jest pusty |
| `escape_underscores`, `escape_html` | `False` | Inaczej `jan_kowalski@…` stanie się `jan\_kowalski@…`, a „&” zmieni się w `&amp;`, i LLM to przepisze |
| `page_break_placeholder` | znacznik podziału strony | Numer strony do cytatów w śladzie ekstrakcji |

**Wyniki próby (21.11.2026).** Sprawy 01–03 z `dane/`, każdy dokument jako oryginalny PDF i jako symulowany skan (150 dpi, odcienie szarości, obrót 0,7°). Docling 2.151.1 na Pythonie 3.14, 4 wątki CPU, RapidOCR `pl`. Pomiar na maszynie deweloperskiej z 12 rdzeniami, nie na laptopie testowym. Skrypt próby: `engine/spikes/docling_spike.py`.

| Wariant | Dokumentów | Czas na dokument | Wartości wzorca znalezione dosłownie w Markdown |
| --- | --- | --- | --- |
| Oryginalny PDF | 9 | 0,8–1,9 s | 74 z 75 |
| Symulowany skan | 9 | 2,4–12,3 s | 69 z 75 |

- **Brakująca wartość w oryginalnych PDF-ach to numer TED ze sprawy 02.** W dokumencie ma postać `2026/S086-999073`, a normalizator `ted_number` zamienia ją na wymagane `999073-2026`. Tekst z PDF-ów cyfrowych jest więc kompletny.
- **Na skanach OCR gubi fragmenty długich linii.** Dlatego skany czytamy OCR całych stron. Na tych samych skanach daje to F1 0,896 wobec 0,830 w trybie domyślnym Docling ([raport jakości](raport-jakosci.md)).
- **Kolejność czytania.** Linia „Gdańsk, dnia 3 września 2026 roku” trafia na koniec akapitu „dotyczy”, a nie na początek dokumentu. Miejscowość i datę szukamy więc we wzorcu „miejscowość, dnia data”, a nie w pierwszej linii.
- **Warstwa `FURNITURE`** jest potrzebna. W sprawie 03 linia „Bydgoszcz, dnia 2 marca 2026 roku” jest nagłówkiem strony i bez tej warstwy znika z Markdown, a z nią pola data i miejscowosc.
- **Zasoby.** Szczytowe zużycie RAM wyniosło około 2 GB, więc laptop z 16 GB wystarczy.

## Ekstrakcja przez LLM

Szczegóły są w [`docs/llm.md`](llm.md). LLM nie widzi pliku PDF: dostaje fragment tekstu w Markdown i schemat JSON, do którego musi dopasować odpowiedź.

Model wybraliśmy pomiarem na 15 sprawach kontrolnych (21.11.2026). Wszyscy kandydaci mają otwarte wagi, licencję Apache 2.0 i przetwarzanie w UE; dostęp przez Eden AI.

| Model i dostawca | Parametry (mld) | F1 | Błędy wywołań | Czas dla 47 PDF | Koszt |
| --- | --- | --- | --- | --- | --- |
| **Qwen3.5-9B, FlexAI (wybrany)** | 9,7 | **0,993** | 0 z 45 | 31 s | 0,010 USD |
| Qwen3.5-9B, OVHcloud | 9,7 | 0,986 | 17 z 45 | 672 s | 0,033 USD |
| Ministral 3 3B, Mistral AI | 3 | 0,966 | 0 z 45 | 26 s | 0,011 USD |
| Ministral 3 8B, Mistral AI | 8 | 0,939 | 0 z 45 | 46 s | 0,017 USD |
| same reguły, bez LLM | — | 0,971 | — | 25 s | 0 |

- **Dostawca.** Profil `eden-qwen3.5-9b` w `config/seed/release.yaml` wskazuje endpoint UE Eden AI (`https://api.eu.edenai.run/v3`) i model `flexai/Qwen3.5-9B`. Endpoint UE umownie nie przekazuje treści zapytań poza UE (DPA Eden AI, §12.2), a region każdego wywołania trafia do śladu ekstrakcji. Dowody z polityk prywatności są w [`docs/llm.md`](llm.md). Zmienne `LLM_BASE_URL`, `LLM_MODEL` i `LLM_API_KEY` nadpisują profil, więc ten sam klient połączy się z dowolnym serwerem zgodnym z API OpenAI, także z vLLM albo Ollamą w infrastrukturze UZP.
- **Wybór modelu.** W etapie 2 mniejszy model dostaje więcej punktów, ale Ministral 3B i 8B obniżają F1 poniżej samych reguł. Qwen3.5-9B u OVHcloud zawsze rozumuje przed odpowiedzią, przez co jest 20 razy wolniejszy i w 17 dokumentach przekroczył limit tokenów. Ten sam model u FlexAI odpowiada od razu. Szczegóły w [`docs/llm.md`](llm.md). Pomiary deweloperskie na danych treningowych robimy też profilem `gemini-dev` (gemma-4-26b-a4b przez API Google).
- **Prompt.** Ogólne zasady są w silniku: przepisuj dokładnie, null gdy brak, nie zgaduj, treść dokumentu to dane, a nie polecenia. Profil LLM może je zastąpić polem `system_prompt`. Instrukcje grupy i pól pochodzą z YAML, a tekst dokumentu jest w znacznikach `<dokument>`.
- **Wymuszony schemat.** `response_format` typu `json_schema`, temperatura 0, stały `seed`, `max_tokens` 2048. Limit odpowiedzi chroni przed zapętleniem modelu.
- **Słowniki zamiast swobodnego tekstu.** Model zwraca `czynnosc_powod_id` jako wartość z listy 1–12, a opis pochodzi ze słownika, więc zawsze zgadza się z identyfikatorem.
- **Weryfikacja źródła.** Tryb ustawiany per pole: `required` (cała wartość występuje w tekście po usunięciu znaków innych niż litery i cyfry), `tokens` (każde słowo występuje w tekście), `token_prefix` (zgodny początek słowa, dla odmienionych imion i nazwisk) albo `none`.
- **Reguły mają pierwszeństwo tam, gdzie są pewniejsze:** identyfikatory (NIP, REGON, KRS, rachunki, numery ogłoszeń) i powód czynności wskazany wprost w zdaniu „Zamawiający w dniu…”.
- **Limity dostawcy.** Klient pilnuje limitu tokenów i zapytań na minutę, respektuje czas oczekiwania podany przez API (błąd 429) i ponawia zapytania po błędach serwera.
- **Cache.** Odpowiedzi są zapisywane po skrócie treści zapytania, więc ponowne przetworzenie tych samych dokumentów nie wywołuje modelu.
- **Tryb awaryjny.** Gdy API jest niedostępne, nie ma klucza albo odpowiedź jest niepoprawna, silnik zapisuje wynik z samych reguł. Plik JSON powstaje zawsze.

## Konfiguracja w plikach

Pliki YAML są jedynym źródłem konfiguracji. Silnik nie czyta ich bezpośrednio, tylko dostaje wydanie: jeden plik `release.json` zbudowany z YAML i sprawdzony modelami Pydantic silnika.

| Plik | Zawartość |
| --- | --- |
| `config/seed/release.yaml` | wersja, ustawienia (wynik dla nieobsługiwanych dokumentów, domyślny profil LLM, równoległość), profile Docling i LLM |
| `config/seed/dictionaries/*.yaml` | słowniki, np. powody czynności 1–12 z kanonicznymi opisami i słowami kluczowymi |
| `config/seed/document_types/*.yaml` | typ dokumentu: wzorce klasyfikacji i próg, sekcje tekstu, listy, grupy wywołań LLM, pola z regułami, normalizatorami, walidatorami i strategią |
| `config/seed/llm_providers.yaml` | dostawcy LLM dla GUI: adres, lokalizacja danych, opis; silnik tego pliku nie czyta |
| `config/releases/<wersja>.json` | opublikowane, niezmienne wydanie: wersja, SHA-256, autor, data, opis zmian i snapshot `release.json` |
| `engine/config/release.json` | aktywne wydanie, które czyta CLI oceniających |

Przykładowa definicja pola:

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

Ścieżka pola wyznacza kształt wyniku: `A.b` to obiekt, a `A[].b` to lista obiektów. Kolejność pól w pliku to kolejność kluczy w JSON. Instrukcja dla LLM, schemat JSON i wynik powstają z tej samej definicji.

**Nowy rodzaj dokumentu** to nowy plik w `config/seed/document_types/`, bez zmian w kodzie. Instrukcja krok po kroku jest w [`docs/silnik.md`](silnik.md). Kod trzeba dopisać tylko wtedy, gdy potrzebny jest nowy rodzaj normalizatora albo walidatora. To jedna funkcja z dekoratorem rejestrującym, a reszta potoku się nie zmienia.

**Cykl wydania konfiguracji:**

1. Zmiana w plikach YAML (docelowo także w GUI, które zapisze te same pliki).
2. `validate-config`: sprawdzenie modeli, regexów oraz odwołań do sekcji, grup, słowników i wtyczek.
3. Próba na kilku PDF-ach z `--trace-dir` i `evaluate` na zbiorze z wzorcami, porównana z aktywnym wydaniem.
4. `backend/manage.py publish --version <wersja>`: zapis niezmiennego wydania w `config/releases/` i aktywacja, czyli zapis `engine/config/release.json`. Plik trafia do repozytorium, z którego CLI uruchomią oceniający.
5. Wycofanie zmian to `manage.py activate` z poprzednią wersją.

## Przejrzystość ekstrakcji

Opcja `--trace-dir` zapisuje dla każdego dokumentu ślad ekstrakcji. Pokazuje on, skąd pochodzi każda wartość w wyniku.

| Poziom | Co zawiera ślad |
| --- | --- |
| Dokument | wersja wydania konfiguracji, rozpoznany typ i wyniki klasyfikacji dla wszystkich typów, błędy |
| Konwersja | SHA-256 pliku, liczba stron, czy to skan, tryb OCR, ocena jakości Docling, czas, czy wynik pochodzi z cache |
| LLM | dla każdej grupy: model, dostawca i region przetwarzania (np. `flexai`, `eu`), czas, liczba tokenów, skrót zapytania |
| Pole | źródło wartości (reguła, LLM, pole wyliczane, wartość domyślna), wartość z reguły z nazwą reguły, cytatem i numerem strony, wartość z LLM, wartość przed normalizacją i po niej, ostrzeżenia (np. odrzucona wartość LLM, nieudana walidacja) |

Każde wydanie konfiguracji ma skrót SHA-256, a ślad wskazuje wersję wydania. Wynik można więc zawsze odtworzyć tą samą konfiguracją. W GUI ekran weryfikacji pokaże te same informacje obok podglądu PDF.

## Backend FastAPI

Backend obsługuje GUI i nie jest potrzebny do uruchomienia ekstrakcji. Pracuje na plikach z poprzedniej sekcji, bez bazy danych. Opis poleceń i API jest w [`backend/README.md`](../backend/README.md).

| Gotowe | Do zrobienia |
| --- | --- |
| `GET /api/releases`, `/api/releases/active`, `/api/releases/{wersja}`: wydania ze statusem | edycja konfiguracji przez API z walidacją i zapisem do YAML |
| `GET /api/config/draft`: bieżąca konfiguracja z YAML | uruchomienie ekstrakcji na wgranym PDF bez publikacji wydania |
| `GET /api/llm-providers`: dostawcy LLM | wyniki i ślady ekstrakcji dla ekranu weryfikacji |
| `manage.py publish`, `activate`, `releases`, `serve` | ewaluacja F1 wydania z poziomu GUI |

## Frontend Angular

Najważniejszy jest ekran weryfikacji. Po lewej jest PDF, po prawej pola, a kliknięcie pola pokazuje jego źródło w dokumencie. Reszta interfejsu służy konfiguracji bez programowania. Wszystkie ekrany istnieją jako makieta na danych przykładowych (`apps/web/public/mock`, `mock-config.ts`). Następny krok to podłączenie ich do API backendu.

| Ekran | Co pozwala zrobić |
| --- | --- |
| Pulpit | ostatnie sprawy, dokumenty do weryfikacji, aktywne wydanie konfiguracji |
| Sprawy i nowa sprawa | lista spraw, przeciągnięcie wielu PDF lub archiwum ZIP, postęp etapów przetwarzania każdego dokumentu |
| Weryfikacja dokumentu | PDF obok listy pól; dla każdego pola wartość, źródło i ostrzeżenia walidatorów; ręczna poprawka; podgląd Markdown z Docling i wynikowego JSON |
| Typy dokumentów | klasyfikacja, pola, grupy ekstrakcji i profil Docling każdego typu |
| Słowniki, modele LLM, profile Docling | słowniki, dostawcy i profile modeli, ustawienia konwersji |
| Wydania konfiguracji | lista wydań, aktywne wydanie |
| Jakość | ewaluacja F1 na zbiorze kontrolnym i pomiary konwersji Docling |
| Audyt i deklaracja dostępności | historia zmian; deklaracja wymagana od podmiotów publicznych |

**Technika.** Angular 22 w monorepo Nx: komponenty standalone, sygnały, tryb bez zone.js, Angular Material 3 i CDK. PDF wyświetla pdf.js (`pdfjs-dist`). Krój Source Sans 3 (licencja OFL) jest serwowany z aplikacji, bez zewnętrznych CDN.

**Styl urzędowy i dostępność.** Jasne tło i jeden kolor akcentu (ciemny granat). Czerwień tylko dla błędów, zieleń i bursztyn dla statusów. Tekst bazowy 16 px i wyraźna hierarchia nagłówków. Interfejs jest po polsku. Celem jest WCAG 2.1 AA, wymagane ustawą o dostępności cyfrowej: kontrast co najmniej 4,5:1, pełna obsługa klawiaturą, etykiety ARIA, statusy przekazywane tekstem i ikoną, nie tylko kolorem.

## Bezpieczeństwo, RODO i licencje

Pliki PDF nie opuszczają komputera. Na zewnątrz trafiają tylko fragmenty tekstu do skonfigurowanego API LLM w UE, a w docelowym wdrożeniu także model może działać lokalnie.

- **Klucz API** jest w pliku `.env` poza repozytorium i nie trafia do logów, cache ani śladu ekstrakcji.
- **Prompt injection.** Treść dokumentu jest w znacznikach i traktowana jako dane. Odpowiedź jest wymuszona schematem i sprawdzana z tekstem źródłowym, a LLM nie ma żadnych narzędzi.
- **Dane osobowe** (np. PESEL) zostają na dysku lokalnym: w wynikach, śladach i cache. Opcja `--cache none` wyłącza cache.
- **Klucz API do oceny.** Zakładamy osobny projekt u dostawcy z limitem wydatków. Klucz trafia do zgłoszenia poza publicznym repozytorium i jest unieważniany po ocenie.

| Komponent | Licencja |
| --- | --- |
| Docling, Pydantic, PyYAML, FastAPI, ONNX Runtime, Angular, Angular Material, Nx | MIT |
| RapidOCR, pdf.js, Qwen3.5-9B, Ministral 3 (3B, 8B), gemma-4-26b-a4b | Apache 2.0 |
| PyTorch, httpx, Uvicorn | BSD-3-Clause |
| Source Sans 3 | SIL Open Font License 1.1 |

Do zrobienia: pełne zestawienie licencji, łącznie z wagami modeli Docling i OCR, w `THIRD_PARTY_LICENSES.md`.

## Jakość: własna ewaluacja F1

Polecenie `evaluate` porównuje wyniki z plikami wzorcowymi pole po polu, po normalizacji:

- zgodna wartość to trafienie (TP);
- wartość tam, gdzie wzorzec ma null, to fałszywe trafienie (FP);
- null tam, gdzie wzorzec ma wartość, to pominięcie (FN);
- inna wartość liczy się jako FP i FN jednocześnie.

Listy (pełnomocnicy, zamawiający) parujemy po najlepszym dopasowaniu elementów. PDF bez pliku wzorca jest traktowany jako dokument negatywny, więc każde wypełnione pole w jego wyniku to FP. Raport podaje F1 całościowe, per typ dokumentu i per pole.

Zbiór kontrolny to co czwarta sprawa (04, 08, …, 60). Na nim nie stroimy reguł ani instrukcji. Przed publikacją wydania uruchamiamy `evaluate` i porównujemy wynik z aktywnym wydaniem.

| Wariant | Zbiór | F1 |
| --- | --- | --- |
| Same reguły | 60 spraw i 16 dokumentów negatywnych | 0,960 |
| Same reguły (wydanie 2026.11.21-dev.3) | 15 spraw kontrolnych | 0,971 |
| **Reguły + LLM (Qwen3.5-9B przez Eden AI, FlexAI)** | 15 spraw kontrolnych | **0,993** |
| **Reguły + LLM, wydanie 2026.11.21-dev.6** | 60 spraw i 16 dokumentów negatywnych | **0,999** |
| Reguły + LLM, wydanie 2026.11.21-dev.6 | 30 skanów organizatora | 0,935 |
| Reguły + LLM (gemma-4-26b-a4b, profil deweloperski) | 15 spraw kontrolnych | 0,994 |
| Same reguły, symulowane skany | sprawy 01–03 | 0,896 |

Pełne wyniki, poprawki i pozostałe błędy są w [raporcie jakości](raport-jakosci.md). Dokładna definicja F1 organizatora nie jest opublikowana, więc wyniki są przybliżeniem.

## Struktura repozytorium

```text
/
├── engine/                       # Python 3.13+, oceniany rdzeń
│   ├── odwolania2json/
│   │   ├── cli.py                # run, evaluate, build-release, validate-config, plugins
│   │   ├── config.py             # modele Pydantic wydania, wczytywanie YAML i JSON
│   │   ├── convert.py            # Docling -> Markdown, wykrywanie skanów, cache
│   │   ├── rules.py              # klasyfikacja i ekstraktory deterministyczne
│   │   ├── llm.py                # klient API zgodnego z OpenAI, limity, ponawianie, cache
│   │   ├── assemble.py           # drzewo pól: wynik JSON i schemat JSON dla LLM
│   │   ├── pipeline.py           # etapy potoku, arbitraż, ślad ekstrakcji
│   │   ├── normalizers.py        # rejestr normalizatorów
│   │   ├── validators.py         # rejestr walidatorów (NIP, REGON, PESEL, KRS, IBAN…)
│   │   └── evaluate.py           # F1 pole po polu
│   ├── config/release.json       # aktywne wydanie konfiguracji
│   ├── spikes/                   # próba Docling
│   ├── tests/
│   └── requirements.txt          # z --extra-index-url dla PyTorch CPU
├── config/
│   ├── seed/                     # konfiguracja w YAML: typy dokumentów, słowniki, profile
│   └── releases/                 # opublikowane, niezmienne wydania
├── backend/                      # FastAPI na plikach; publikacja i aktywacja wydań
├── apps/web/                     # Angular (Nx)
├── input/  output/               # wymagane przez organizatora
├── requirements.txt              # zależności ekstrakcji (wskazuje engine/requirements.txt)
├── start.bat  start_linux.sh  start.sh   # python -m odwolania2json run --input input --output output
└── docs/                         # plan, silnik, LLM, raport jakości
```

## Kierunek wdrożenia w UZP

Rozwiązanie konkursowe działa na jednym komputerze. Wdrożenie dla wielu użytkowników wymagałoby dodatkowych elementów. Silnik pozostałby bez zmian, bo dostaje konfigurację jako wydanie, a pliki i wyniki przez parametry.

- **Baza danych** (np. PostgreSQL) na sprawy, wyniki, poprawki i audyt. Konfiguracja nadal byłaby w plikach i wydaniach.
- **Kolejka zadań i procesy robocze** dla konwersji Docling, która obciąża CPU, żeby przetwarzać wiele spraw równolegle.
- **Logowanie przez OIDC** i role: administrator konfiguracji, operator, audytor.
- **Model LLM w infrastrukturze UZP** (vLLM albo Ollama). Wystarczy zmiana `LLM_BASE_URL` i `LLM_MODEL`.
- **Instalacja bez internetu:** modele Docling pobrane z wyprzedzeniem (`docling-tools models download`).

## Stan prac i kolejne kroki

- [x] Próba Docling na CPU, także na symulowanych skanach.
- [x] Silnik: CLI `input → output`, reguły, LLM ze schematem, weryfikacja źródła, ślad ekstrakcji, cache, ewaluacja F1.
- [x] Klasyfikacja tylko po treści: wszystkie 16 dokumentów negatywnych dostaje `{}`.
- [x] Konfiguracja w YAML, wydania w plikach, backend FastAPI bez bazy danych.
- [x] GUI: makieta wszystkich ekranów.
- [x] Wybór modelu pomiarem F1: Qwen3.5-9B przez Eden AI u FlexAI (F1 0,993 na 15 sprawach kontrolnych).
- [ ] Podłączenie GUI do API: wydania, konfiguracja, ekran weryfikacji ze śladem ekstrakcji.
- [ ] Edycja konfiguracji przez API z zapisem do YAML.
- [ ] Uruchomienie ekstrakcji z GUI na wgranym PDF.
- [ ] Zestawienie licencji i instrukcja instalacji bez internetu.
- [ ] Demo: dodanie czwartego typu dokumentu (np. przystąpienia do postępowania odwoławczego) samą konfiguracją.

## Ryzyka i pytania otwarte

Największe ryzyko to różnica między syntetycznymi danymi treningowymi a realnymi sprawami w zbiorze testowym.

| Ryzyko | Skutek | Jak ograniczamy |
| --- | --- | --- |
| Realne sprawy to skany słabej jakości | Puste lub błędne pola | OCR całych stron dla skanów, polski model RapidOCR, pomiar na symulowanych skanach |
| Docling ustawia w złej kolejności tekst z układów dwukolumnowych | LLM łączy etykiety z niewłaściwymi wartościami | Reguły pomijają przestawione linie nagłówków; sekcje tekstu zawężają kontekst |
| Jeden PDF zawiera kilka dokumentów | Błędna klasyfikacja, pomieszane pola | Na razie nieobsługiwane; decyzja po odpowiedzi mentorów |
| Model zmyśla identyfikatory | Fałszywe trafienia obniżają F1 | Weryfikacja źródła, pierwszeństwo reguł dla identyfikatorów, temperatura 0 |
| Przeuczenie na jednym generatorze danych | Wysokie F1 na treningu, niskie na teście | Zbiór kontrolny, symulowane skany, dokumenty negatywne |
| API dostawcy LLM niedostępne w czasie oceny albo brak klucza | Brak części pól w wynikach | Ponawianie z odstępem, limity po stronie klienta, tryb awaryjny na samych regułach (F1 0,960) |
| Pierwsze uruchomienie bez internetu | Instalacja zależności i modeli Docling się nie powiedzie | Wymóg sieci opisany w README; instalacja offline w kolejnych krokach |
| Długa konwersja dużych skanów na CPU | Wolne przetwarzanie | `max_pages`, limit czasu na dokument, cache konwersji |

**Pytania do mentorów**

- [ ] Czy GUI w Angularze (TypeScript) obok rdzenia i backendu w Pythonie jest akceptowalne przy wymogu „Python 3.13+”?
- [x] Jaka jest 12. wartość `czynnosc_powod_id` i jej kanoniczny opis? „Projektowane postanowienia umowy” (`oczekiwane-json/czynnosc_powod_id_dict.md`).
- [ ] Jak nazwać wynik przelewu: `potwierdzenie_przelewu.json` (zgodnie z README) czy `przelew.json` (jak w danych)?
- [ ] Jak liczone jest F1: per pole, dokładnie czy po normalizacji, z uwzględnieniem wielkości liter?
- [ ] Czy `pesel` ma być liczbą, czy tekstem?
- [ ] Czy w zbiorze testowym są skany i PDF-y zawierające kilka dokumentów?
- [x] Czy „pusty plik `.json`” to plik o długości 0 bajtów, czy zawartość `{}`? Zawartość `{}`. Przykłady kategorii nieobsługiwanych są w `dane/negatywne`.
- [ ] Jak punktowany jest rozmiar modelu, gdy różne grupy pól używają różnych modeli: według największego?

## Źródła

- [Repozytorium wyzwania hacknation-2026](https://github.com/Urzad-Zamowien-Publicznych/hacknation-2026) (README, `oczekiwane-json`, `dane`)
- [Docling: instalacja](https://github.com/docling-project/docling/blob/main/docs/getting_started/installation.md)
- [Docling: opcje zaawansowane](https://github.com/docling-project/docling/blob/main/docs/usage/advanced_options.md)
- [Docling: OCR](https://github.com/docling-project/docling/blob/main/docs/concepts/OCR.md) i [języki silników OCR](https://github.com/docling-project/docling/blob/main/docs/concepts/OCR_native.md)
- [Docling: ocena jakości konwersji](https://github.com/docling-project/docling/blob/main/docs/concepts/confidence_scores.md)
- [Docling: pakiet, wersja i licencja](https://github.com/docling-project/docling/blob/main/packages/docling/pyproject.toml)
- [docling-core: `export_to_markdown`](https://github.com/docling-project/docling-core/blob/main/docling_core/types/doc/document.py)
