# Odwołania2json – plan rozwiązania

Nov 21, 2026 · @Witut

Rdzeń ekstrakcji powstaje w Pythonie 3.13 według potoku Docling (lokalnie na CPU) → Markdown → mały otwarty LLM przez API w UE. NestJS i Angular tworzą wokół niego platformę: konfigurację, sprawy, weryfikację i audyt. Definicje dokumentów i modeli LLM są w PostgreSQL i trafiają do silnika jako niezmienne wydania konfiguracji. Przetwarzanie skaluje się poziomo przez kolejkę.

## Wymagania i ustalenia

Rdzeń oceniany przez organizatora musi być w Pythonie, a o wyniku etapu 1 decyduje w całości F1. Poniższe ustalenia pochodzą z README i z analizy 60 spraw treningowych.

| Ustalenie | Źródło | Co z tego wynika |
| --- | --- | --- |
| Python 3.13+, `requirements.txt`, uruchomienie przez CLI lub `start.bat` | README, sekcja 5 | Silnik ekstrakcji w Pythonie; NestJS i Angular budujemy wokół niego |
| Wejście `./input/<sprawa>/*.pdf`, wyjście `./output/<sprawa>/<nazwa pliku>.json` | README, sekcja 3 | Plik wynikowy ma tę samą nazwę co wejściowy; typ dokumentu rozpoznajemy z treści |
| Dokumenty kategorii, których nie należy identyfikować, dają pusty plik `.json` | README, sekcja 6 (zmiana z 21.11.2026) | Klasyfikator ma klasę „nieobsługiwany” z progiem pewności; pusty plik to `{}` (decyzja z 21.11.2026) |
| Test na laptopie biurowym: 16 GB RAM, Intel i7, bez GPU | README, sekcja 6 (zmiana z 21.11.2026) | Docling lokalnie na CPU z limitem wątków i pamięci; pomiar zużycia RAM w próbie |
| LLM przez API firmy z serwerami w UE/EOG, dostarczone z kluczem API | README, sekcja 6 (zmiana z 21.11.2026) | OVHcloud AI Endpoints (Francja); klucz z limitem wydatków przekazany poza publicznym repozytorium |
| Etap 1: F1 = 100% oceny | README, sekcja 7 | Najpierw jakość ekstrakcji |
| Etap 2: F1 50%; mniejszy model LLM 1–20 pkt; rozszerzalność 1–20 pkt; inne funkcje, np. GUI, 1–10 pkt | README, sekcja 7 (zmiana z 21.11.2026) | Najmniejszy model, który utrzyma F1; nowe typy dokumentów bez kodu; GUI w Angularze |
| Tylko komponenty open source, w tym modele | README, sekcja 5 | Modele z otwartymi wagami na licencji Apache 2.0 |
| Nowe klasy dokumentów przez pliki konfiguracyjne | README, sekcja 5 | Baza jako źródło konfiguracji, eksport wydania do `release.json` dla CLI |
| Dokumentacja techniczna z opisem użytego LLM | README, sekcja 4 (zmiana z 21.11.2026) | `docs/llm.md`: model, dostawca, parametry, wyniki porównania modeli |
| 60 spraw × 3 dokumenty, wszystkie PDF-y z warstwą tekstową z jednego generatora | analiza `dane/` | Zbiór testowy (realne sprawy) może mieć skany i inne układy, więc OCR i testy na zmienionych kopiach |
| `czynnosc_powod_id`: 11 z 12 wartości w treningu | `dane/*/odwolanie.json` | Słownik powodów w bazie; 12. wartość („Projektowane postanowienia umowy”) podana w `oczekiwane-json/czynnosc_powod_id_dict.md` |
| `data` i `miejscowosc` = null w 15 z 60 odwołań; kilku zamawiających w 3 z 60 | `dane/*/odwolanie.json` | Null jest poprawną odpowiedzią; listy podmiotów obsługujemy od początku |
| Sumy kontrolne nie zgadzają się dla 74 ze 189 numerów NIP, 38 ze 123 REGON i 77 ze 120 rachunków | wzorce w `dane/` | Walidatory tylko ostrzegają i nie usuwają wartości |
| Wzorce w `oczekiwane-json/` mają komentarze `//`, a `pesel` jest raz liczbą, raz tekstem | `oczekiwane-json/`, `dane/` | Wynik to czysty JSON; typ pola `pesel` do potwierdzenia |

## Architektura

![Architektura: 9 komponentów](architektura.png)

NestJS zleca zadania przez RabbitMQ i jako jedyny zapisuje do bazy. Workery i CLI uruchamiają ten sam kod silnika; CLI czyta konfigurację z `release.json` eksportowanego przy publikacji wydania. Wdrożenie to docker-compose (web, api, dwa rodzaje workerów, PostgreSQL, RabbitMQ, Keycloak), a serwer LLM działa osobno.

## Potok Docling → Markdown → LLM

Każdy dokument przechodzi przez dwa osobne etapy kolejki: konwersję (Docling, obciąża CPU) i ekstrakcję (LLM, głównie czeka na odpowiedź). Etapy skalują się niezależnie, a zmiana konfiguracji ekstrakcji nie wymaga ponownej konwersji.

1. **Przyjęcie pliku.** SHA-256, typ MIME sprawdzany po zawartości, limity rozmiaru i liczby stron. Plik trafia do magazynu obiektów.
2. **Cache konwersji.** Klucz: SHA-256 pliku + wersja Docling + hash profilu konwersji. Trafienie w cache pomija krok 3.
3. **Konwersja Docling na CPU.** Warstwa tekstowa PDF, model układu strony, OCR tylko obszarów bez tekstu, struktura tabel, zakres stron z profilu typu dokumentu. Wynik: `DoclingDocument` (JSON z położeniem elementów na stronach) i ocena jakości konwersji.
4. **Kontrola jakości konwersji.** Gdy `low_grade` = FAIR lub POOR (w próbie skany z ubytkami tekstu dostawały FAIR, nie POOR), konwersja jest ponawiana z OCR całych stron (`OcrMode.FULL_PAGE`), a dokument dostaje oznaczenie „do weryfikacji”.
5. **Eksport do Markdown.** Z nagłówkami stron, znacznikami podziału stron i bez escapowania znaków (szczegóły w następnej sekcji). Plik `.md` zapisujemy obok JSON-a.
6. **Klasyfikacja.** Reguły z bazy (słowa kluczowe z wagami) działają na Markdown pierwszej strony. Przy niskiej pewności LLM wybiera typ z listy opisów typów albo klasę „nieobsługiwany”. Dokument nieobsługiwany dostaje pusty plik JSON, zgodnie z README. Opcjonalny krok dzieli jeden PDF na kilka dokumentów, gdyby realne sprawy przychodziły sklejone.
7. **Przygotowanie kontekstu.** Z Markdown wycinamy fragmenty wskazane w konfiguracji (np. nagłówek, strony 1–2, sekcja „Zarzut nr 1”), z limitem tokenów.
8. **Ekstrakcja przez LLM.** Jedno wywołanie na grupę pól. Prompt i schemat JSON są generowane z definicji pól w bazie, a odpowiedź jest wymuszona schematem.
9. **Ekstraktory deterministyczne.** Regexy i reguły „etykieta → wartość” dla identyfikatorów (NIP, REGON, KRS, PESEL, rachunek, TED, BZP, daty, kwoty) działają na tym samym Markdown.
10. **Arbitraż i weryfikacja źródła.** Wartość musi wystąpić w Markdown po normalizacji. W przeciwnym razie bierzemy kandydata z regexa albo null. Do każdej wartości szukamy elementu `DoclingDocument`, co daje stronę i ramkę do podświetlenia w UI.
11. **Normalizacja i walidacja.** Nazwane funkcje z rejestru silnika, parametry z bazy. Walidacje tylko ostrzegają.
12. **Spójność sprawy.** Reguły między dokumentami (mocodawca = Odwołujący, pełnomocnik z odwołania występuje w pełnomocnictwie) zmieniają pewność i dodają ostrzeżenia, ale nie zmieniają wartości.
13. **Zapis wyniku.** Mapowanie na schemat wyjściowy, plik JSON i ślad ekstrakcji: `*.trace.json` w CLI albo rekordy w bazie w trybie serwerowym.

## Ustawienia Docling na CPU

Docling 2.151 (licencja MIT) działa na Pythonie 3.10–3.14 i całkowicie lokalnie. Domyślny eksport do Markdown ma jednak trzy pułapki, które usuwamy w ustawieniach poniżej. Każde ustawienie jest potwierdzone w dokumentacji i kodzie źródłowym Docling ([dokumentacja](https://github.com/docling-project/docling/tree/main/docs)).

**Konwersja (profil konwersji, przechowywany w bazie per typ dokumentu)**

| Ustawienie | Wartość | Dlaczego |
| --- | --- | --- |
| Instalacja | `pip install "docling[rapidocr]" --extra-index-url https://download.pytorch.org/whl/cpu` | PyTorch tylko na CPU, bez bibliotek CUDA; dodatek `rapidocr` instaluje backend onnxruntime, którego RapidOCR używa domyślnie |
| Modele offline | `docling-tools models download` oraz `docling-tools models download rapidocr --rapidocr-backend-lang onnxruntime:pl` przy budowie obrazu, potem `artifacts_path` | Brak pobierania z internetu w czasie pracy; domyślne pobieranie obejmuje tylko chiński model OCR, polski trzeba dodać jawnie |
| Usługi zdalne | `enable_remote_services` wyłączone (domyślnie) | Docling nie wysyła treści dokumentu poza serwer |
| Silnik OCR | `RapidOcrOptions(lang=["pl"])` (PP-OCRv6 obsługuje polski) albo `TesseractCliOcrOptions(lang=["pol"])` | Polskie znaki diakrytyczne; wybór rozstrzygamy pomiarem na skanach |
| Tryb OCR | domyślny (OCR tylko obszarów bez tekstu PDF), awaryjnie `OcrMode.FULL_PAGE` | Cyfrowe PDF-y nie płacą czasem za OCR |
| Zepsuta warstwa tekstu | `replace_broken_text_layer=True` | Strony z nieczytelnym tekstem zamiast liter idą do OCR |
| Tabele | `do_table_structure=True`, tryb `FAST` albo `ACCURATE` per typ | Potwierdzenia przelewów mają układ tabelaryczny |
| Zakres i limity | `page_range` (np. strony 1–5), `max_num_pages`, `max_file_size` | Kluczowe dane są na pierwszych stronach; ochrona przed bardzo dużymi plikami |
| Limit czasu | `document_timeout` | Jeden uszkodzony plik nie blokuje workera |
| Wątki CPU | `accelerator_options.num_threads` (domyślnie 4, także `OMP_NUM_THREADS`) | Przewidywalne zużycie CPU na proces |
| Pamięć | `queue_max_size`, `max_concurrent_results` | Stały szczyt pamięci przy dużych skanach |
| Ocena konwersji | `ConversionResult.confidence`: `mean_grade`, `low_grade` | Decyzja o ponowieniu z pełnym OCR i o ręcznej weryfikacji |

**Eksport `export_to_markdown`**

| Parametr | Wartość | Dlaczego |
| --- | --- | --- |
| `included_content_layers` | `{BODY, FURNITURE}` | Domyślnie eksport obejmuje tylko `BODY`. Jeśli model układu uzna linię „Miejscowość, data” za nagłówek strony, bez tej opcji zniknie |
| `traverse_pictures` | `True` | Przy OCR całej strony tekst trafia pod element obrazu; bez tej opcji Markdown skanu jest pusty |
| `escape_underscores`, `escape_html` | `False` | Inaczej `jan_kowalski@…` stanie się `jan\_kowalski@…`, a „&” zmieni się w `&amp;`, i LLM to przepisze |
| `page_break_placeholder` | `<!-- page break -->` | Numer strony do cytatów i podświetleń |

**Wyniki próby (21.11.2026).** Sprawy 01–03 z `dane/`, każdy dokument jako oryginalny PDF i jako symulowany skan (150 dpi, odcienie szarości, obrót 0,7°). Docling 2.151.1 na Pythonie 3.14 (3.13 nie było na maszynie), 4 wątki CPU, RapidOCR `pl`, ustawienia jak w tabelach powyżej. Pomiar na maszynie deweloperskiej z 12 rdzeniami, nie na laptopie testowym.

| Wariant | Dokumentów | Czas na dokument | Wartości wzorca znalezione dosłownie w Markdown |
| --- | --- | --- | --- |
| Oryginalny PDF | 9 | 0,8–1,9 s | 74 z 75 |
| Symulowany skan | 9 | 2,4–12,3 s | 69 z 75 |

- **Brakująca wartość w oryginalnych PDF-ach to numer TED ze sprawy 02.** W dokumencie ma postać `2026/S086-999073`, a normalizator `ted_number` zamienia ją na wymagane `999073-2026`. Tekst z PDF-ów cyfrowych jest więc kompletny.
- **Na skanach OCR gubi fragmenty długich linii.** Brakuje tytułu zamówienia, numeru postępowania, nazwy kancelarii i części opisu przelewu. Ocena jakości ani razu nie spadła przy tym do POOR, więc ponowienie z pełnym OCR uruchamiamy już przy FAIR. Następny test: 300 dpi, `OcrMode.FULL_PAGE` i Tesseract `pol`.
- **Kolejność czytania.** Linia „Gdańsk, dnia 3 września 2026 roku” trafia na koniec akapitu „dotyczy”, a nie na początek dokumentu. Miejscowość i datę trzeba więc szukać we wzorcu „miejscowość, dnia data”, a nie w pierwszej linii.
- **Warstwa `FURNITURE`** jest potrzebna. W sprawie 03 linia „Bydgoszcz, dnia 2 marca 2026 roku” jest nagłówkiem strony i bez tej warstwy znika z Markdown, a z nią pola data i miejscowosc. Poza tym warstwa dodaje tylko stopki „Strona X z Y”.
- **Zasoby.** Szczytowe zużycie RAM wyniosło 2,0 GB, więc laptop z 16 GB wystarczy. Pierwszy start trwał 53 s, bo obejmował pobranie i wczytanie modeli; potem modele są już w pamięci.

## Ekstrakcja przez LLM

LLM dostaje mały, celowany fragment Markdown i schemat JSON zbudowany z definicji w bazie. Każdą jego odpowiedź sprawdzamy z tekstem źródłowym. Dzięki temu można sprawdzić, czy wystarczy najmniejszy model, który daje najwięcej punktów w etapie 2.

Kandydaci w OVHcloud AI Endpoints. Wszyscy obsługują `json_schema`, a dane są przetwarzane we Francji ([katalog OVHcloud](https://catalog.endpoints.ai.ovh.net/rest/v1/models_v2), stan na 21.11.2026).

| Model | Parametry (mld) | Licencja | USD za 1 mln tokenów: wejście / wyjście | Kontekst |
| --- | --- | --- | --- | --- |
| Qwen3.5-9B | 9,7 | Apache 2.0 | 0,12 / 0,18 | 262k |
| gpt-oss-20b | 21 | Apache 2.0 | 0,05 / 0,18 | 131k |
| Mistral-Small-3.2-24B-Instruct-2506 | 24 | Apache 2.0 | 0,10 / 0,31 | 128k |
| gemma-4-26b-a4b | 26 | Apache 2.0 | 0,10 / 0,41 | 256k |

Zakładamy około 3 tys. tokenów wejścia i 500 wyjścia na wywołanie. Wtedy Qwen3.5-9B kosztuje około 0,0005 USD za wywołanie, a cały zbiór treningowy przy dwóch wywołaniach na dokument około 0,16 USD.

- **Dostawca API.** Do oceny używamy OVHcloud AI Endpoints: API zgodne z OpenAI i przetwarzanie we Francji. Zapasowy dostawca w Niemczech to IONOS AI Model Hub; obsługę json\_schema dla wybranego modelu trzeba tam jeszcze sprawdzić. W docelowym wdrożeniu UZP ten sam klient łączy się z vLLM albo Ollama on-premise. Adres, model i klucz są w tabeli llm\_provider i w zmiennych LLM\_\*.
- **Wybór modelu.** W etapie 2 mniejszy model dostaje więcej punktów, więc testujemy od najmniejszego: Qwen3.5-9B, potem gpt-oss-20b i Mistral-Small-3.2-24B. Wybieramy najmniejszy, którego F1 na zbiorze kontrolnym mieści się w ustalonym progu od najlepszego. Przy modelach z rozumowaniem sprawdzamy, czy niski poziom rozumowania utrzymuje F1, bo skraca czas i koszt. Bielika nie znaleźliśmy jako gotowego API u dostawcy z UE.
- **Grupy ekstrakcji.** Pola typu dokumentu dzielimy na grupy, każda to osobne wywołanie z własnym fragmentem tekstu. Odwołanie ma dwie: „strony i postępowanie” (nagłówek i strony 1–2) oraz „zaskarżona czynność” (sekcja pierwszego zarzutu i słownik powodów).
- **Prompt.** Składa się z szablonów w bazie: zasady (tylko z tekstu, null gdy brak, nie zgaduj), instrukcje pól, przykłady z zatwierdzonych poprawek i Markdown w ogranicznikach. Treść dokumentu jest danymi, nie poleceniami.
- **Wymuszony schemat.** `response_format` typu `json_schema`, temperatura 0, stały `seed`. Odpowiedź parsuje model Pydantic budowany dynamicznie z definicji pól. Przy błędzie robimy jedno ponowienie z komunikatem walidacji.
- **Słowniki zamiast swobodnego tekstu.** Model zwraca tylko `czynnosc_powod_id` jako enum 1–12, a `czynnosc_opis` bierzemy ze słownika. Opis zawsze zgadza się wtedy z identyfikatorem.
- **Weryfikacja źródła.** Rozmyte dopasowanie (rapidfuzz, MIT) znormalizowanej wartości do Markdown, z progiem ustawianym w konfiguracji. Gdy dopasowania nie ma, bierzemy kandydata z regexa albo null i dodajemy ostrzeżenie. Wartość wpisana tam, gdzie wzorzec ma null, obniża F1 tak samo jak pominięcie.
- **Normalizatory.** `date_iso` (także „20 marca 2026 roku”), `iban_digits` (bez PL i spacji, 26 cyfr), `ted_number` (`2025/S 123-456789` → `456789-2025`), `bzp_number` (bez spacji po „BZP”), `amount_decimal` („10 000,00 zł” → 10000.0), `digits_only` dla NIP, REGON i KRS.
- **Cache.** Klucz: hash fragmentu Markdown, promptu, schematu, modelu i parametrów. Ponowna ewaluacja tego samego wydania nic nie kosztuje.
- **Tryb awaryjny.** Gdy LLM jest niedostępny, działają same ekstraktory deterministyczne, więc plik JSON powstaje zawsze.

## Konfiguracja w bazie

PostgreSQL jest jedynym źródłem konfiguracji: typów dokumentów, ich pól, profili Docling i modeli LLM. Silnik nie czyta jednak tabel. Dostaje niezmienne wydanie konfiguracji (snapshot JSON), więc CLI działa też bez bazy.

| Tabela | Zawartość |
| --- | --- |
| `document_type` | kod, nazwa, opis (używany także przy klasyfikacji przez LLM), reguły klasyfikacji, wzorzec nazwy pliku wyjściowego, schemat wyjściowy |
| `field_definition` | ścieżka pola (`Odwolujacy[].pelnomocnik.mail`), typ, nullable, instrukcja dla LLM, przykłady, grupa ekstrakcji, regexy, normalizatory, walidatory, słownik, wymóg weryfikacji źródła |
| `extraction_group` | fragment kontekstu (strony, sekcje), limit tokenów, szablon promptu, profil LLM |
| `conversion_profile` | ustawienia Docling: silnik i język OCR, tryb OCR, tabele, zakres stron, limit czasu, wątki |
| `dictionary`, `dictionary_entry` | słowniki, np. powody czynności 1–12 z kanonicznymi opisami |
| `prompt_template` | wersjonowane szablony: zasady ogólne, ekstrakcja, klasyfikacja |
| `llm_provider` | adres API, zaszyfrowany klucz, limit równoległych żądań, limit czasu |
| `llm_profile` | model, temperatura, `max_tokens`, `seed`, okno kontekstu, tryb wymuszania schematu |
| `case_rule` | reguły spójności między dokumentami sprawy |
| `config_release` | niezmienny snapshot: wersja, SHA-256, autor, data, opis zmian, status aktywny |

Dane robocze: `case`, `document`, `conversion_artifact` (Markdown i JSON Docling), `processing_job`, `field_result` (wartość i ślad), `correction`, `evaluation_run`, `audit_log`.

Przykładowa definicja pola:

```json
{
  "path": "ZamowieniePubliczne.numer_ted",
  "type": "string",
  "nullable": true,
  "group": "strony_i_postepowanie",
  "instruction": "Numer ogłoszenia TED. Nie myl z numerem BZP.",
  "strategies": ["llm", "regex"],
  "regex": ["\\b(\\d{5,6})-(20\\d{2})\\b", "(20\\d{2})/S\\s?\\d{3}-(\\d{5,6})"],
  "normalizers": [{ "name": "ted_number" }],
  "validators": [{ "name": "pattern", "args": { "re": "^\\d{5,6}-\\d{4}$" }, "severity": "warning" }],
  "grounding": "required"
}
```

Cykl publikacji wydania:

1. Zmiany zapisujemy jako szkic w interfejsie.
2. Walidacja szkicu: schemat JSON jest poprawny, regexy się kompilują, prompty się renderują. Każdy normalizator i walidator musi istnieć w katalogu wtyczek, który silnik publikuje przy starcie.
3. Test na własnym PDF i ewaluacja F1 na zbiorze kontrolnym, porównane z aktywnym wydaniem.
4. Publikacja tworzy niezmienny `config_release` i eksportuje go do `engine/config/release.json`. Plik trafia do repozytorium, z którego CLI uruchomią oceniający.
5. Aktywacja. Każdy wynik zapisuje identyfikator wydania; wycofanie zmian polega na aktywacji poprzedniego wydania.

Nowy typ dokumentu wymaga wyłącznie konfiguracji. Nowy rodzaj normalizatora to jeden plik w silniku z dekoratorem rejestrującym, bez zmian w potoku. Początkowe definicje trzech typów są w `config/seed/*.yaml`, a import i eksport działają w obie strony.

## Skalowanie

Każdy komponent skaluje się poziomo i niezależnie, bo komunikuje się przez kolejkę i nie trzyma stanu w pamięci. Tysiące dokumentów rocznie to niewielkie obciążenie. Ta sama architektura obsłuży jednak jednorazowe przetworzenie archiwum.

| Komponent | Obciążenie | Jak skalujemy | Co jest granicą |
| --- | --- | --- | --- |
| Worker konwersji (Docling) | CPU | Jeden proces = jeden konwerter z modelami załadowanymi raz, `prefetch=1`, 4 wątki. Dokładamy repliki; w Kubernetes autoskalowanie po długości kolejki (KEDA) | liczba rdzeni |
| Worker ekstrakcji | I/O (czeka na LLM) | Asynchroniczny, N równoległych wywołań. Suma po replikach nie przekracza limitu dostawcy z `llm_provider` | przepustowość serwera LLM |
| Serwer LLM (vLLM) | GPU lub CPU na osobnej maszynie | Repliki za load balancerem; vLLM sam łączy równoległe żądania w batche | sprzęt instytucji |
| API NestJS | lekkie, bezstanowe | Repliki za reverse proxy, uwierzytelnianie tokenami OIDC | baza danych |
| RabbitMQ | kolejki zadań | Kolejki `convert`, `extract`, `results`, kolejki błędów, priorytet dla testów konfiguracji; w produkcji klaster z kolejkami quorum | — |
| PostgreSQL | wyniki, konfiguracja, audyt | Zapisuje wyłącznie NestJS; indeksy pod listy i filtry; audyt partycjonowany po miesiącach; replika do odczytu raportów | jeden węzeł zapisu |
| Magazyn plików | PDF, JSON Docling, Markdown | S3-kompatybilny (np. Ceph RGW lub SeaweedFS), w CLI dysk lokalny | — |
| Frontend | pliki statyczne | nginx, leniwe ładowanie modułów, paginacja po stronie serwera, wirtualne przewijanie długich list | — |

- **Idempotencja.** Identyfikator zadania to dokument + wydanie konfiguracji + etap. Kolejka dostarcza wiadomość co najmniej raz, a wynik zapisujemy przez upsert, więc powtórka niczego nie psuje.
- **Ponawianie.** Odstęp wykładniczy, a po N próbach kolejka błędów i status „wymaga uwagi” w UI.
- **Przeciwciśnienie.** API odpowiada od razu kodem 202 z identyfikatorem zadania, a postęp trafia do UI przez SSE.
- **Cache.** Dwa poziomy (konwersja i LLM) sprawiają, że ewaluacja nowego wydania na 60 sprawach kosztuje tylko wywołania LLM dla zmienionych grup pól.
- **Obserwowalność.** OpenTelemetry śledzi zadanie przez API, kolejkę i worker. Prometheus zbiera długość kolejek, czas na stronę, czas i tokeny LLM. Logi są bez danych osobowych.

RabbitMQ (licencja MPL 2.0) wybieramy, bo ma dojrzałe klienty w Node i Pythonie, model pobierania zadań przez wolne workery, kolejki błędów i priorytety. Workery w Pythonie nie mają dostępu do bazy, tylko publikują wyniki do kolejki `results`.

## Backend NestJS

NestJS jest jedynym właścicielem bazy i jedynym punktem wejścia dla frontendu. Każdy moduł ma układ controller → service → repository, a zależności zewnętrzne (kolejka, magazyn plików, szyfrowanie) są za interfejsami, więc ich implementacje można wymieniać.

| Moduł | Odpowiedzialność |
| --- | --- |
| `auth` | OIDC przez Keycloak; role: administrator konfiguracji, operator, audytor |
| `cases` | sprawy, przyjmowanie wielu PDF lub archiwum ZIP |
| `documents` | pliki, podgląd, metadane, artefakty konwersji |
| `processing` | zlecanie zadań do RabbitMQ, odbiór wyników z kolejki `results`, statusy, postęp przez SSE |
| `document-types` | typy dokumentów, pola, grupy ekstrakcji, generowanie schematu JSON, walidacja szkicu |
| `conversion-profiles` | profile Docling |
| `llm` | dostawcy i profile modeli, test połączenia; klucze nigdy nie wracają do frontendu |
| `dictionaries` | słowniki i ich pozycje |
| `releases` | szkic → publikacja, porównanie wydań, aktywacja, eksport `release.json` |
| `playground` | uruchomienie szkicu konfiguracji na wgranym PDF bez publikacji (kolejka z priorytetem) |
| `results` | wyniki ze śladem, poprawki, eksport JSON i ZIP sprawy |
| `evaluation` | zbiory z wzorcami, uruchomienie F1, porównanie wydań |
| `audit` | kto, co i kiedy zmienił w konfiguracji i wynikach (interceptor) |
| `health` | gotowość bazy, kolejki i magazynu |

Narzędzia: Prisma (migracje i dostęp do bazy), `@nestjs/microservices` z transportem RMQ, OpenAPI z generowanym klientem TypeScript dla Angulara, pino do logów. Kontrakty wiadomości kolejki mają wersjonowany JSON Schema wspólny dla Node i Pythona.

## Frontend Angular

Najważniejszy jest ekran weryfikacji. Po lewej jest PDF, po prawej pola, a kliknięcie pola podświetla jego źródło w dokumencie. Reszta interfejsu służy konfiguracji bez programowania.

**Ekrany**

| Ekran | Co pozwala zrobić |
| --- | --- |
| Pulpit | ostatnie sprawy, dokumenty do weryfikacji, F1 aktywnego wydania |
| Nowa sprawa | przeciągnięcie wielu PDF lub ZIP, postęp każdego dokumentu: konwersja → klasyfikacja → ekstrakcja → walidacja |
| Weryfikacja dokumentu | PDF z podświetlonym źródłem; dla każdego pola wartość, pewność, metoda, cytat i ostrzeżenia; akceptacja lub poprawka; podgląd Markdown z Docling i JSON; pobranie JSON lub ZIP |
| Typy dokumentów | zakładki: ogólne, klasyfikacja, pola (drzewo), grupy i prompty, profil Docling, test na własnym PDF, historia |
| Słowniki, modele LLM, profile Docling | edycja słowników, dostawców i profili, test połączenia z modelem |
| Wydania | lista wydań, porównanie dwóch wersji, publikacja, aktywacja poprzedniej |
| Jakość | F1 per typ dokumentu i per pole, porównanie wydań, lista błędnych pól z podglądem |
| Audyt i Deklaracja dostępności | historia zmian; deklaracja wymagana od podmiotów publicznych |

**Technika.** Komponenty standalone, sygnały, NgRx SignalStore, Angular Material i CDK. PDF wyświetla ngx-extended-pdf-viewer (pdf.js), a edytor promptów i regexów to Monaco ładowany leniwie. Klient API jest generowany z OpenAPI. Własny mały zestaw komponentów: `status-badge`, `confidence-chip`, `field-evidence`, `file-dropzone`, `data-table`, `empty-state`.

**Styl urzędowy**

- Jasne tło i jeden kolor akcentu (ciemny granat) zdefiniowany jako token. Czerwień tylko dla błędów, zieleń i bursztyn dla statusów.
- Jeden krój bezszeryfowy z polskimi znakami (np. Source Sans 3, licencja OFL) serwowany z własnego serwera, bez zewnętrznych CDN.
- Tekst bazowy 16 px, wyraźna hierarchia nagłówków, breadcrumbs, bez gradientów i ozdobnych animacji.
- Interfejs po polsku, wszystkie teksty w plikach tłumaczeń.

**Responsywność**

| Szerokość okna | Ekran weryfikacji |
| --- | --- |
| od 1280 px | PDF i pola obok siebie, z regulowanym podziałem |
| 768–1279 px | zakładki „Dokument” i „Pola”, kliknięcie pola przełącza na PDF z podświetleniem |
| poniżej 768 px | lista pól z cytatem źródłowym, PDF otwierany na żądanie |

**Dostępność (WCAG 2.1 AA, wymóg ustawy o dostępności cyfrowej)**: kontrast co najmniej 4.5:1, pełna obsługa klawiaturą i widoczny focus, etykiety ARIA, statusy przekazywane także tekstem i ikoną, nie tylko kolorem. Automatyczne testy axe w CI.

## Bezpieczeństwo, RODO i licencje

Pliki PDF nie opuszczają infrastruktury instytucji. Na zewnątrz trafiają tylko fragmenty tekstu do skonfigurowanego API LLM w UE, a w docelowym wdrożeniu także model może działać lokalnie.

- **Sieć.** Modele Docling pobrane przy budowie obrazu, usługi zdalne Docling wyłączone. Workery działają jako nie-root, z systemem plików tylko do odczytu i bez dostępu do internetu.
- **Dane osobowe.** PESEL i inne dane osobowe są maskowane w UI dla ról bez uprawnień, a logi ich nie zawierają. Okres przechowywania plików i wyników jest konfigurowalny. Usunięcie sprawy usuwa też jej pliki i artefakty.
- **Przyjmowanie plików.** Limity rozmiaru i liczby stron, typ MIME sprawdzany po zawartości, opcjonalny skan antywirusowy ClamAV.
- **Prompt injection.** Treść dokumentu jest w ogranicznikach i traktowana jako dane. Odpowiedź jest wymuszona schematem i sprawdzana z tekstem źródłowym, a LLM nie ma żadnych narzędzi.
- **Sekrety.** Klucze do API LLM są szyfrowane w bazie (AES-GCM, klucz spoza bazy) i nigdy nie wracają do frontendu.
- **API.** Tokeny OIDC, walidacja wejścia, nagłówki bezpieczeństwa i CSP, ograniczenie liczby żądań, CORS tylko dla własnej domeny.
- **Rozliczalność.** Audyt każdej zmiany konfiguracji i każdej poprawki. Każdy wynik wskazuje wydanie konfiguracji, wersję Docling i model, które go wytworzyły.
- **Łańcuch dostaw.** Zależności przypięte z hashami, SBOM w formacie CycloneDX, skan obrazów w CI.

**Klucz API do oceny.** Zakładamy osobny projekt u dostawcy z limitem wydatków. Klucz trafia do zgłoszenia w pliku `.env` poza publicznym repozytorium i jest unieważniany po ocenie.

| Komponent | Licencja |
| --- | --- |
| Angular, NestJS, Docling, Ollama, llama.cpp, Pydantic, rapidfuzz, Monaco | MIT |
| Prisma, Keycloak, vLLM, Tesseract, RapidOCR, pdf.js, ngx-extended-pdf-viewer, Qwen3.5-9B, gpt-oss-20b, Mistral-Small-3.2-24B, gemma-4-26b-a4b | Apache 2.0 |
| PyTorch | BSD-3-Clause |
| PostgreSQL | PostgreSQL License |
| RabbitMQ | MPL 2.0 |

Pełną listę, łącznie z wagami modeli Docling i OCR, generujemy automatycznie do `THIRD_PARTY_LICENSES.md`. CI blokuje zależności z licencją spoza listy dozwolonych.

## Jakość: własna ewaluacja F1

Każda zmiana silnika i każde wydanie konfiguracji przechodzi ewaluację F1 na zbiorze kontrolnym, zanim trafi do użycia. Ta sama ewaluacja daje „wyniki własnych testów jakości” do zgłoszenia.

- **Liczenie.** Porównujemy pole po polu, po normalizacji:
  - zgodna wartość to trafienie (TP);
  - wartość tam, gdzie wzorzec ma null, to fałszywe trafienie (FP);
  - null tam, gdzie wzorzec ma wartość, to pominięcie (FN);
  - inna wartość liczy się jako FP i FN jednocześnie.

  Listy (pełnomocnicy, zamawiający) parujemy po najlepszym dopasowaniu nazw. Raport podaje F1 całościowe, per typ dokumentu i per pole.
- **Podział danych.** 45 spraw roboczych i 15 kontrolnych, warstwowo według `czynnosc_powod_id`. Na zbiorze kontrolnym nie stroimy promptów ani regexów.
- **Zbiór obciążeniowy.** Kopie 60 spraw zrasteryzowane do 150 i 200 dpi, z lekkim obrotem, szumem i kompresją JPEG. Do tego kilka ręcznie przygotowanych dokumentów o innym układzie. Symuluje to skany i różnorodność realnych spraw.
- **Bramka jakości.** CI uruchamia ewaluację przy każdej zmianie silnika lub konfiguracji startowej. Publikacja wydania w UI jest blokowana, gdy F1 spada o więcej niż ustalony próg względem aktywnego wydania.
- **Raport.** Tabela F1 per pole i lista błędów z różnicą wartości, w UI i w `docs/quality-report.md`.

Dokładna definicja F1 organizatora nie jest opublikowana. Sposób porównywania (dokładne czy znormalizowane, wielkość liter) jest więc konfigurowalny i do potwierdzenia z mentorami.

## Struktura repozytorium

Jedno repozytorium: silnik w Pythonie obok monorepo Nx z NestJS i Angularem. Silnik ma jeden rdzeń i dwa cienkie adaptery: CLI dla oceniających i worker kolejki dla platformy.

```text
/
├── engine/                      # Python 3.13, oceniany rdzeń
│   ├── odwolania2json/
│   │   ├── core/                # potok, kontekst, ślad ekstrakcji, interfejsy etapów
│   │   ├── config/              # modele Pydantic wydania, wczytywanie release.json
│   │   ├── stages/
│   │   │   ├── convert/         # Docling: profil, cache, eksport Markdown
│   │   │   ├── classify/
│   │   │   ├── extract/         # LLM i ekstraktory deterministyczne
│   │   │   ├── ground/          # weryfikacja źródła, strona i ramka
│   │   │   ├── normalize/       # rejestr normalizatorów
│   │   │   ├── validate/        # rejestr walidatorów
│   │   │   ├── consolidate/     # reguły spójności sprawy
│   │   │   └── output/          # mapowanie na schemat wyjściowy
│   │   ├── llm/                 # klient API zgodnego z OpenAI, cache
│   │   ├── eval/                # F1 i raport
│   │   └── adapters/
│   │       ├── cli.py           # run | evaluate | validate-config | plugins
│   │       └── worker.py        # konsumenci RabbitMQ: convert, extract
│   ├── config/release.json      # eksport opublikowanego wydania
│   ├── tests/
│   └── requirements.txt         # z --extra-index-url dla PyTorch CPU
├── apps/
│   ├── api/                     # NestJS
│   └── web/                     # Angular
├── libs/contracts/              # schematy wiadomości kolejki, klient OpenAPI
├── config/seed/                 # startowe definicje typów dokumentów (YAML)
├── input/  output/              # wymagane przez organizatora
├── start.sh  start.bat          # python -m odwolania2json run --input ./input --output ./output
├── deploy/                      # docker-compose.yml, opcjonalnie Helm
└── docs/                        # architektura, „Jak dodać typ dokumentu”, raport jakości
```

CLI czyta adres i model LLM ze zmiennych `LLM_BASE_URL`, `LLM_MODEL` i `LLM_API_KEY`, które nadpisują profil z wydania. Oceniający podłączą więc własny serwer bez edycji plików. Obraz Dockera silnika ma modele Docling pobrane podczas budowy.

## Kolejność prac

Etap 1 ocenia wyłącznie F1, dlatego kroki 1–3 mają pierwszeństwo. Po kroku 3 sam silnik z CLI wystarcza do zgłoszenia, a platforma powstaje na nim bez zmian w rdzeniu.

1. **Próba Docling i szkielet silnika.** Konwersja 60 spraw i ich zrasteryzowanych kopii, porównanie RapidOCR i Tesseract, pomiar czasu na stronę. Gotowe, gdy Markdown zawiera nagłówki stron i poprawnie ułożone dane przelewów, a silnik OCR jest wybrany.
2. **Ekstrakcja i ewaluacja.** CLI `input → output`, ekstrakcja LLM ze schematem, normalizatory, skrypt F1. Gotowe, gdy mamy F1 na zbiorze kontrolnym dla Qwen3.5-9B, gpt-oss-20b i Mistral-Small-3.2-24B oraz wybrany najmniejszy wystarczający model.
3. **Podnoszenie F1.** Grupy ekstrakcji, weryfikacja źródła, regexy, słownik powodów, ścieżka OCR sprawdzona na zbiorze obciążeniowym. Gotowe, gdy kolejne poprawki przestają podnosić F1, a `release.json` jest zamrożony do zgłoszenia.
4. **Baza, NestJS i kolejka.** Prisma, seed z YAML, wydania i eksport `release.json`, RabbitMQ, workery. Gotowe, gdy sprawa wgrana przez API daje identyczny JSON jak CLI.
5. **Angular: sprawy i weryfikacja.** Gotowe, gdy operator wgrywa sprawę, widzi pola z podświetlonym źródłem i pobiera JSON, także na tablecie.
6. **Edytor konfiguracji, test na PDF, wydania, jakość.** Gotowe, gdy nowy typ dokumentu da się dodać, przetestować i opublikować bez commita.
7. **Dokumentacja i demo.** README, przewodnik „Jak dodać typ dokumentu”, raport jakości. Na pokazie dodajemy na żywo czwarty typ (np. przystąpienie do postępowania odwoławczego) wyłącznie z UI.

## Ryzyka i pytania otwarte

Największe ryzyko to różnica między syntetycznymi danymi treningowymi a realnymi sprawami w zbiorze testowym.

| Ryzyko | Skutek | Jak ograniczamy |
| --- | --- | --- |
| Realne sprawy to skany słabej jakości | Puste lub błędne pola | OCR z polskim modelem, ponowienie z pełnym OCR przy ocenie POOR, zbiór obciążeniowy, oznaczenie do weryfikacji |
| Docling ustawia w złej kolejności tekst z układów dwukolumnowych (np. potwierdzenie przelewu) | LLM łączy etykiety z niewłaściwymi wartościami | Pomiar w kroku 1; ekstraktory „etykieta → wartość” na JSON Docling z pozycjami; osobny profil per typ |
| Jeden PDF zawiera kilka dokumentów | Błędna klasyfikacja, pomieszane pola | Opcjonalny krok podziału na podstawie klasyfikacji stron |
| Model zmyśla identyfikatory | Fałszywe trafienia obniżają F1 | Weryfikacja źródła, regex jako arbiter, temperatura 0 |
| Przeuczenie na jednym generatorze danych | Wysokie F1 na treningu, niskie na teście | Zbiór kontrolny, zbiór obciążeniowy, własne dokumenty o innym układzie |
| API dostawcy LLM niedostępne w czasie oceny | Brak części pól w wynikach | Ponawianie z odstępem, drugi dostawca w UE w `llm_provider`, tryb awaryjny bez LLM |
| Długa konwersja dużych skanów na CPU | Wolne przetwarzanie | `page_range`, limity, cache, skalowanie workerów |

**Pytania do mentorów**

- [ ] Czy NestJS i Angular wokół rdzenia w Pythonie są akceptowalne przy wymogu „Python 3.13+”?
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
