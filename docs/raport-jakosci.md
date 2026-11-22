# Raport jakości ekstrakcji

Stan na 21.11.2026. Miara: F1 liczone pole po polu względem plików wzorcowych z `dane/` (polecenie `evaluate`, zasady liczenia w `engine/odwolania2json/evaluate.py`). Organizator nie opublikował dokładnej definicji F1, więc wyniki są przybliżeniem.

## Wyniki

| Wariant | Zbiór | F1 | Precyzja | Pełność |
| --- | --- | --- | --- | --- |
| Same reguły, wersja pierwsza | 60 spraw (180 dokumentów) | 0,929 | 0,964 | 0,897 |
| Same reguły, po poprawkach | 60 spraw | 0,960 | 0,986 | 0,937 |
| Same reguły | 15 spraw kontrolnych | 0,964 | 0,982 | 0,947 |
| Reguły + LLM (Gemma 4 26B-A4B), wersja pierwsza | 15 spraw kontrolnych | 0,984 | 0,980 | 0,988 |
| Reguły + LLM, po poprawkach | 15 spraw kontrolnych | 0,994 | 0,992 | 0,996 |
| Same reguły, klasyfikacja tylko po treści, słownik powodów z 21.11.2026 | 60 spraw i 16 dokumentów negatywnych (196 dokumentów) | 0,960 | 0,986 | 0,937 |
| Same reguły, wydanie 2026.11.21-dev.3 | 15 spraw kontrolnych i 2 dokumenty negatywne | 0,971 | 0,990 | 0,953 |
| **Reguły + LLM docelowy (Qwen3.5-9B przez Eden AI, FlexAI, UE), wydanie 2026.11.21-dev.3** | 15 spraw kontrolnych i 2 dokumenty negatywne | **0,993** | 0,990 | 0,996 |

Sprawy kontrolne to co czwarta sprawa: 04, 08, …, 60, w tym 6 bardziej zróżnicowanych spraw z drugiej połowy zbioru. Wcześniejsze pomiary z LLM wykonano na profilu deweloperskim z modelem gemma-4-26b-a4b przez API Google (profil usunięty od wydania 2026.11.21-dev.7). Docelowy model Qwen3.5-9B przez Eden AI zmierzyliśmy na tym samym zbiorze kontrolnym; porównanie z innymi modelami jest w [`llm.md`](llm.md).

## Kolejność nagłówka w dwóch kolumnach na skanach (22.11.2026)

Nagłówek odwołania to często tabela bez linii: po lewej etykiety („Odwołujący:”, „Zamawiający:”, „Dotyczy:”), po prawej dane stron. Na skanach Docling wypisuje najpierw wszystkie etykiety, potem wszystkie dane. Sekcja „Odwołujący” (od „Odwołujący:” do „Zamawiający:”) jest wtedy pusta, a sekcja „Zamawiający” zawiera dane Odwołującego. Stąd brały się NIP i nazwa Odwołującego wpisywane jako dane Zamawiającego (odwołania 0006 i 0008).

**Rozwiązanie** (`layout.py`, opcja `scanned_label_columns` w profilu konwersji, tylko skany). Przed eksportem do Markdown silnik zmienia kolejność elementów w dokumencie Docling według ich położenia na stronie:

- **Kolumna etykiet:** co najmniej dwa krótkie teksty zakończone „:” (do 4 słów), które nachodzą na siebie w poziomie. Krótki tekst bez dwukropka w tej kolumnie, między pierwszą a ostatnią etykietą, też jest etykietą („Adres do doręczeń” w prawdziwym odwołaniu z `szablon-aplikacja`).
- **Wartości:** elementy na prawo od kolumny etykiet, do pierwszego elementu, który zaczyna się w kolumnie etykiet albo na lewo od niej (np. „Wpis od odwołania”, „ODWOŁANIE”).
- **Przypisanie:** element na wysokości etykiety należy do niej. Tak jest także wtedy, gdy etykieta stoi w połowie bloku danych, jak „Zamawiający:” w prawdziwym odwołaniu. Pozostałe elementy idą do ostatniej etykiety, której górna krawędź jest nad górną krawędzią elementu.
- **Zabezpieczenia:**
  - Silnik przestawia całe elementy rozpoznane przez Docling, nie linie OCR, a tekst elementów zostaje bez zmian.
  - Zmiana następuje tylko wtedy, gdy co najmniej dwie etykiety z dwukropkiem dostają wartości. Etykiety bez dwukropka się nie liczą.
  - Tekst, który przerywa lewą kolumnę (np. akapit między „Zamawiający:” a „Dotyczy:”), dzieli ją na osobne odcinki, więc etykieta nigdy nie przeskakuje nad takim tekstem.
  - Odcinek, w którym pod etykietą z dwukropkiem tuż pod nią stoi tekst, to układ jednokolumnowy (odwołania 0002 i 0005). Docling czyta go poprawnie, a elementy po prawej, np. adres KIO czy pieczęć, nie są wtedy wartościami, więc taki odcinek zostaje bez zmian.
  - Ślad ekstrakcji zapisuje każdą zmianę (`conversion.layout`).
- **Cache:** dla skanów z włączoną opcją klucz zawiera wersję algorytmu (`LAYOUT_VERSION` w `convert.py`), więc stary Markdown nie wraca z cache. Dokumenty z warstwą tekstową zachowują swoje wpisy.

Pomiar samymi regułami (`--no-llm`). Docling przetworzył 30 skanów raz, a oba warianty liczone są z tych samych wyników OCR. Markdown bez zmiany kolejności jest identyczny z dotychczasowym cache.

| Zbiór | F1 przed | F1 po | Trafienia | Błędne wartości |
| --- | ---: | ---: | ---: | ---: |
| 10 odwołań (skany) | 0,436 | **0,660** | 54 → 94 | 17 → 14 |
| 30 skanów | 0,521 | **0,645** | 118 → 158 | 26 → 23 |
| Cały zbiór (226 PDF) | 0,889 | **0,900** | 1895 → 1935 | 29 → 26 |

- **Z poprawkami tekstu skanów opisanymi niżej:** 10 odwołań 0,667, 30 skanów 0,649, cały zbiór 0,900.
- **Zmienione dokumenty:** 7 z 10 odwołań. Na 60 sprawach cyfrowych, 20 skanach pełnomocnictw i przelewów oraz 16 negatywach wynik jest identyczny plik po pliku.
- **Pola:** NIP, KRS i REGON Odwołującego mają na skanach F1 1,000 (wcześniej 0,50–0,57). Nazwa Zamawiającego: 0,267 → 0,800, NIP Zamawiającego: 0,333 → 0,875, e-mail pełnomocnika: 0,462 → 0,842.
- **Przelewy:** etykiety „Nazwa firmy:” i „Numer klienta:” zostają bez zmian. OCR łączy obie wartości w jeden element, a elementów nie dzielimy.
- **Prawdziwe odwołanie z `szablon-aplikacja`:** nagłówek ma teraz kolejność „Odwołujący: dane, Adres do doręczeń, Zamawiający: Miejskie Przedsiębiorstwo Oczyszczania…”. Plik wzorca jest pusty, a dane stron zamazano przy anonimizacji, więc reguły nie wyciągają więcej pól. Zysk dotyczy LLM, który dostaje dane Zamawiającego zaraz po etykiecie. Reguła nazwiska pełnomocnika pomija od teraz nazwę kancelarii („reprezentowany przez radcę prawnego” → „Kancelaria Prawna” przy zamazanym nazwisku).
- **Pozostałe błędy reguł na skanach odwołań:** dwóch Zamawiających w jednym odwołaniu (0004, lista „1) …”) i nazwa Lidera konsorcjum zapisana jako „1) … (Lider Konsorcjum)” (0007, pole `llm_first`).

**Poprawki wykryte przy pomiarze.** Po zmianie kolejności reguły widzą właściwe sekcje i trafiają na pomyłki OCR, które wcześniej poprawiał tylko LLM. Doszły więc dwie poprawki:

- **Tekst skanów** (`fix_ocr_pl`). Gravis i daszek („Systèmy”, „Brzozowskì”, „prowadzonègo”, „przepisôw”), którego nie ma w polskim tekście, zamienia się na literę bez znaku. Polskie znaki przywraca potem słownik, np. „przepisow” → „przepisów”. W tekście 30 skanów było takich słów 13. Umlauty zostają, bo bywają w nazwiskach. Przecinek wewnątrz adresu e-mail („a,wrobel@…”) zamienia się na kropkę.
- **Listy.** Reguła zwraca jedną wartość dla pierwszego elementu listy. Jeśli LLM umieścił tę samą wartość w innym elemencie tej listy, wartość z reguły jest dla tego elementu pomijana, a ślad zapisuje ostrzeżenie. Przykład: w odwołaniu 0004 dwaj Zamawiający udzielają zamówienia wspólnie, a REGON drugiego trafiał do pierwszego.

**Pełny przebieg z LLM** (Qwen3.5-9B, endpoint UE Eden AI). Odpowiedzi LLM dla dokumentów, których tekst się nie zmienił, pochodzą z cache, więc różnice wynikają tylko z tych zmian, a nie z wahań modelu.

| Zbiór | F1 przed | F1 po | Błędne wartości | Brakujące wartości |
| --- | ---: | ---: | ---: | ---: |
| 30 skanów | 0,942 | **0,951** | 18 → 14 | 18 → 16 |
| 10 odwołań (skany) | 0,952 | **0,966** | 8 → 4 | 9 → 7 |
| Cały zbiór (226 PDF) | 0,988 | **0,990** | 23 → 19 | 32 → 30 |

- **Naprawione:** 5 wartości w odwołaniach 0006 i 0008, gdzie KRS, NIP i REGON Odwołującego były wpisywane jako dane Zamawiającego.
- **Nowy błąd:** w odwołaniu 0010 model wybiera drugiego z dwóch pełnomocników („Monika Zawadzka” zamiast „Andrzej Wróbel”). Ich kolejność w tekście się nie zmieniła.
- **Bez zmian:** na 60 sprawach cyfrowych, w pełnomocnictwach i przelewach ze skanów oraz w 16 negatywach wyniki są identyczne plik po pliku. Zabezpieczenie list zadziałało w 16 dokumentach, ale tylko w 0004 zmieniło wynik.

## Porównanie silników OCR (21.11.2026)

30 skanów organizatora (`dane/skany`, 71 stron), pełny silnik z LLM (Qwen3.5-9B, endpoint UE Eden AI), bez cache (`--cache none`), ta sama konfiguracja poza silnikiem OCR. Druga miara dotyczy samego OCR: ile spośród 226 wartości tekstowych ze wzorców występuje w tekście po OCR, dosłownie albo po pominięciu polskich znaków i interpunkcji. Pominięte są daty, identyfikatory słownika i wartości słownikowe, których nie ma w tekście.

| Silnik OCR (Docling 2.151) | F1 skanów | Wartości w tekście dosłownie | Bez polskich znaków | Czas OCR | Szczyt RAM |
| --- | ---: | ---: | ---: | ---: | ---: |
| **RapidOCR, PP-OCRv6 `pl`, model `small` (obecny)** | **0,934** | **88,9%** | **94,7%** | 353 s | 2,7 GB |
| Tesseract 5.5, `pol` z tessdata_best | 0,905 | 84,1% | 92,5% | 332 s | 2,1 GB |
| Tesseract 5.5, `pol` z pakietu Ubuntu | 0,885 | 84,1% | 90,3% | 293 s | 2,1 GB |
| RapidOCR, PP-OCRv5 `latin` | 0,848 | 77,0% | 89,4% | 391 s | 2,7 GB |
| EasyOCR 1.7.2, `pl` (CPU) | przerwane | 44 z 64* | 50 z 64* | 4–5× dłużej | — |

\* Pierwszych 5 odwołań; na tych samych dokumentach RapidOCR PP-OCRv6: 58 i 60 z 64, Tesseract tessdata_best: 51 i 58. EasyOCR przetwarzał jeden dokument 108–180 s (RapidOCR 20–34 s) i nie rozpoznał odwołania 0005, więc przy 150 dokumentach nie zmieściłby się w 45 minutach.

- **Zostaje RapidOCR PP-OCRv6.** Żaden inny silnik nie dał wyższego F1 ani lepszego tekstu.
- **Tesseract** lepiej czyta polskie litery: „odwoła…” bez błędu we wszystkich 330 wystąpieniach, a RapidOCR gubi „ł” w 8% z nich. Za to zamienia „@” w adresach e-mail na „G” albo „Q” (8 odwołań), dokleja pojedyncze znaki na końcach linii („… 2026 ś”), wstawia spacje w numerach („ZP/ 12/2026”) i ucina numery rachunków. Lepszy jest tylko na pełnomocnictwach (0,968 wobec 0,955).
- **PP-OCRv5 `latin`** to model dla wszystkich języków łacińskich: gubi więcej polskich znaków niż model PP-OCRv6 `pl`.

Słabe miejsca RapidOCR na tych skanach, poza polskimi literami („ł”, „Ę”, „Ł”: 5 tytułów przelewów i 1 osoba):

- **Przebijający tekst z drugiej strony kartki.** Tam, gdzie nakłada się na akapit „Dotyczy:” (odwołanie 0005), OCR zwraca niezrozumiały tekst. Giną wtedy numer BZP, numer postępowania i powód czynności.
- **Dwuwierszowa komórka tabeli na przekrzywionym skanie** (przelew 0010). Drugi wiersz tytułu przelewu jest nieczytelny.
- **„o” zamiast zera i odwrotnie**: „KRS: 9994328o29”, „(3o-799)”, „o2.06.2026”, „Sp. z 0.o.”. Poprawiane od 21.11.2026 (niżej).

**Poprawka tekstu skanów** (`textutil.fix_ocr_pl`, tylko dla plików bez warstwy tekstowej, przed klasyfikacją, regułami i LLM). Litera o/O w samodzielnym ciągu cyfr zamienia się na 0, a „z 0.o.” i „z 0.0.” na „z o.o.” z wielkością liter zgodną z „Sp.” albo „SP.”. Słowa z literami i cyframi (np. „k2o”, „biuro2o@…”) zostają bez zmian. Na tekście OCR 30 skanów zmienia 9 miejsc i wszystkie są poprawne. Dotąd te wartości ratował tylko LLM: reguła `KRS\W{0,3}(\d{10})` nie pasowała do „9994328o29”, a model sam poprawiał cyfrę. Same reguły na tym samym tekście OCR: +1 trafienie (KRS mocodawcy), bez nowych błędów. W pełnym silniku z LLM F1 skanów wynosi 0,932 wobec 0,934 przed zmianą. Różnią się 2 pola i oba wynikają z wariancji LLM, bo tekst tych dokumentów poprawka zostawia bez zmian. Zysk dotyczy więc głównie sytuacji, gdy LLM jest niedostępny.

## Czas przetwarzania skanów (22.11.2026)

Limit organizatora: 150 PDF-ów w 45 minut, czyli 18 s na dokument. Konwersja skanu to głównie OCR (około 90% czasu Doclinga; reszta to analiza układu strony). Pomiary na laptopie Dell Latitude 5411 (i7-10850H, 6 rdzeni, 12 wątków, 32 GB RAM), bez cache.

**Kilka procesów konwersji nie skraca czasu.** 16 skanów (40 stron), sama konwersja:

| Procesy × wątki | Czas | s/str. | Zajęte rdzenie | Szczyt RAM |
| --- | ---: | ---: | ---: | ---: |
| 1 × 4 (domyślnie) | 201 s | 5,03 | 5,6 | 2,9 GB |
| 1 × 12 | 277 s | 6,93 | 10,9 | 2,8 GB |
| 2 × 4 | 190 s | 4,75 | 9,8 | 5,1 GB |
| 3 × 4 | 195 s | 4,87 | 11,3 | 7,1 GB |
| 4 × 3 | 202 s | 5,04 | 11,6 | 8,7 GB |

Jeden proces Doclinga zajmuje już około 5,6 rdzenia: strony idą potokowo w wątkach, a OCR i modele liczą wielowątkowo. Kolejne procesy konkurują o te same rdzenie i każdy dokument liczy się 2–3 razy dłużej. Tekst wynikowy jest we wszystkich wariantach identyczny. Silnik ma opcję `settings.convert_workers` (i `run --workers N`), domyślnie 1. Więcej procesów może pomóc tylko na maszynie z wieloma rdzeniami. Wywołania LLM startują teraz od razu po konwersji każdego dokumentu, równolegle z konwersją kolejnych, a nie dopiero po wszystkich.

**Lżejsze modele OCR tracą jakość.** 30 skanów, pełny silnik z LLM:

| RapidOCR PP-OCRv6 | F1 skanów | Wartości wzorców w tekście OCR | Konwersja |
| --- | ---: | ---: | ---: |
| detekcja i rozpoznawanie `small` (obecnie) | 0,940 | 88,9% | 5,8 s/str. |
| detekcja `tiny` | 0,932 | 90,7% | 4,3 s/str. |
| rozpoznawanie `tiny` | 0,892 | 83,2% | 3,4 s/str. |
| oba `tiny` | 0,892 | 82,3% | 2,3 s/str. |
| detekcja przez OpenVINO, rozpoznawanie `tiny` | 0,892 | 83,2% | 3,8 s/str. |

Model rozpoznawania `tiny` obniża F1 o 0,05. OpenVINO przyspiesza samą detekcję około 2 razy, ale w pełnym potoku nie skraca czasu, a dodaje 180 MB zależności. Detekcja `tiny` daje mieszany wynik (odwołania lepiej, przelewy gorzej), więc zostaje model `small`. Skale OCR 3 i 4 dają ten sam obraz, bo RapidOCR i tak zmniejsza stronę do 2000 px na dłuższym boku (`max_side_len`).

**Mniej stron skanu: ta sama jakość, o połowę krócej.** Wartości pól pochodzą prawie zawsze ze strony 1, rzadko ze strony 2: na 30 skanach 221 wartości ma źródło na stronie 1. Od 22.11.2026 profil konwersji ma `scanned_max_pages: 3`, czyli OCR czyta 3 pierwsze strony skanu, a cyfrowe PDF-y dalej do `max_pages` (6). Na 30 skanach F1 wynosi 0,940 wobec 0,940 przy 6 stronach (jeden błąd mniej, żadnego nowego), a odwołania mające 4–6 stron konwertują się w około 15 s zamiast około 32 s. W zeskanowanym odwołaniu z `szablon-aplikacja` zmienił się tylko powód czynności (OPZ zamiast SWZ; pismo dotyczy „treści SWZ”, a zarzuty Części II SWZ – Opisu Przedmiotu Zamówienia, więc oba odczyty są uzasadnione) i pola pełnomocnika, które zmieniają się między przebiegami także bez tej zmiany.

**Szacunek dla 150 dokumentów** na tym laptopie, przy około 5 s na stronę skanu: 150 skanów po 3 strony to około 38 minut, a przy 6 stronach (do 21.11.2026) byłoby to około 75 minut. Zbiór organizatora (2,4 strony na skan, cyfrowe PDF-y około 1,4 s na stronę) mieści się z dużym zapasem. Na wolniejszym laptopie same długie skany wciąż mogą zbliżyć się do limitu.

## Wydanie 2026.11.22-dev.1: polskie znaki na skanach

RapidOCR gubi część polskich znaków, najczęściej „ł” i wielkie litery z ogonkami: „odwolania”, „PELNOMOCNICTWO”, „DEBNICY”. LLM przepisuje wartości z tekstu dosłownie, razem z tym błędem. Od wydania 2026.11.22-dev.1 (`settings.ocr_restore_diacritics`, moduł `diacritics.py`) silnik przywraca znaki w tekście skanu, zaraz po `fix_ocr_pl`, przed klasyfikacją, regułami i LLM:

1. **Słownik SJP** (`engine/odwolania2json/data/pl_diacritics.txt.gz`, 4,8 MB, pochodna słownika `hunspell-pl` na licencji Apache 2.0). Słowo dostaje znaki, gdy jego wersja bez znaków nie jest poprawnym słowem, a słownik zna dokładnie jedną wersję ze znakami. Poprawia więc „odwolania” → „odwołania”, a pomija „sad” (sad/sąd), „zle” (złe/źle), „oplata” (oplata/opłata).
2. **Pisownia z tego samego dokumentu**, gdy dokument zawiera dokładnie jedną wersję ze znakami i jest ona słowem ze słownika: „Spólka” → „Spółka”, „Lukasz” → „Łukasz”. Słowo poprawne bez znaków zmienia się tylko wtedy, gdy wersja ze znakami jest nazwą własną, a słowo jest pisane wielką literą. Dlatego „20 maja 2026” nie staje się „20 mają”, a „Zawadzki” nie przejmuje błędnego „ż” z innego odczytu („Zawadżki”).

Pomijane są: słowa krótsze niż 4 litery, e-maile i adresy WWW, ciągi z cyframi lub ukośnikiem (kody postępowań, np. „DAZ/PN/67/26”), pisane wielką literą słowa, które są też pospolitymi słowami angielskimi („Michalak Legal”), oraz słowa z mieszaną wielkością liter. Kropka środkowa między słowami („OŚRODEK·SPORTU”) staje się spacją. Ślad ekstrakcji zapisuje każdą poprawkę (`conversion.restored_diacritics`). Słownik wczytuje się przy pierwszym skanie w partii: około 2 s i 300 MB RAM.

Pomiar na 30 skanach organizatora, pełny silnik z LLM, bez cache, oba przebiegi z poprawką `fix_ocr_pl`:

| Wariant | F1 skanów | Odwołania | Pełnomocnictwa | Przelewy |
| --- | ---: | ---: | ---: | ---: |
| Bez przywracania znaków | 0,930 | 0,952 | 0,955 | 0,822 |
| **Z przywracaniem znaków** | **0,942** | 0,952 | 0,968 | 0,870 |

- **Naprawione (7):** 5 tytułów przelewów („wpis od odwołania”, „W DĘBNICY GÓRNEJ”, „OŚRODEK SPORTU”, „PAŃSTWOWEJ STRAŻY”), osoba podpisująca pełnomocnictwo („Łukasz Sosnowski”) i data czynności w odwołaniu 0005.
- **Nowe błędy (3):**
  - **Reguła e-maila pełnomocnika.** W odwołaniu 0009 Odwołujący działa bez pełnomocnika. Po przywróceniu znaków reguła znajduje sekcję „Odwołujący:” (OCR: „Odwolujacy:”) i bierze z niej e-mail firmy jako e-mail pełnomocnika. To błąd samej reguły, który na cyfrowym piśmie bez pełnomocnika wystąpiłby tak samo.
  - **Zamienione rachunki w przelewie 0008** (2 pola). Na bardzo zaszumionym skanie OCR nie odczytał etykiet rachunków, więc LLM ustala kolejność z kontekstu. Po zmianie kilku słów obok („Urząd”, „Rafał”) zamienia rachunki w obu przebiegach z poprawką, a bez niej w obu podaje je poprawnie.
- **Słowa z fałszywą poprawką:** na tekście OCR 30 skanów 185 zmian, wszystkie poprawne poza kilkoma kawałkami słów w nieczytelnym tekście przebijającym z drugiej strony kartki („otne”, „raze”). Wszystkie 16 negatywów dostaje `{}`, w tym 3 zeskanowane, a ich punktacja klasyfikacji się nie zmienia. W zeskanowanym odwołaniu z `szablon-aplikacja` poprawka zmienia 11 słów i wszystkie są poprawne.
- **Ryzyko:** nazwisko pisane celowo bez polskich znaków. Generator organizatora pisze „Szymanski” (4 cyfrowe sprawy). Poprawka działa tylko na skanach, więc cyfrowych dokumentów nie dotyczy, ale na skanie takie nazwisko stałoby się „Szymański”.
- **Nie poprawia:** słów niejednoznacznych bez pisowni w dokumencie („OPLATA”, „Lódź”, „byla”). Rozstrzygnęłaby je lista frekwencyjna słów, której nie dołączamy.

**Reguły na skanach organizatora.** Same reguły dają na tych 30 skanach F1 około 0,45. Docling odczytuje nagłówek pisma jako dwie osobne kolumny: najpierw same etykiety („Odwołujący:”, „Zamawiający:”, „Dotyczy:”), potem same wartości. Reguły szukające w sekcji „Odwołujący” nie znajdują więc NIP-u, REGON-u ani nazwy, i na skanach prawie wszystkie pola pochodzą z LLM. Gdy API LLM nie odpowiada, wyniki dla takich skanów będą słabe. Od 22.11.2026 silnik poprawia tę kolejność (sekcja „Kolejność nagłówka w dwóch kolumnach na skanach” wyżej).

## Wydanie 2026.11.21-dev.6: skany

Dwa eksperymenty na 30 skanach organizatora (profil domyślny, wydanie dev.5 jako punkt wyjścia):

| OCR (RapidOCR, PP-OCRv6 `pl`) | Porównanie ze źródłem | F1 skanów | Czas OCR |
| --- | --- | --- | --- |
| model `small`, skala 3 (216 dpi), dotychczasowy | dokładne | 0,926 | 1× |
| **model `small`, skala 3** | **tolerancyjne** | **0,935** | **1×** |
| model `small`, skala 4 (288 dpi) | tolerancyjne | 0,938 | 1,2× |
| model `medium` | — | przerwane | ok. 15× |

- **Tolerancyjne porównanie** (`settings.ocr_tolerant_grounding`, tylko dla skanów): wartość z LLM, której nie ma dosłownie w tekście OCR, przechodzi, jeśli występuje w nim w całości po pominięciu polskich znaków, spacji i znaków interpunkcyjnych oraz utożsamieniu pomyłek OCR 0/o i 1/l/i. Odzyskuje 5 wartości (np. „Sp. z o.o.” zapisane przez OCR jako „Sp. z 0.0.”, „Łódź” jako „Lódź”), bez nowych błędnych trafień. Włączone od wydania dev.6.
- **Wyższa rozdzielczość OCR** daje +0,003 przy mieszanym wpływie (odwołania lepiej, przelewy gorzej) i nie odzyskuje polskich znaków. Zostaje skala 3.
- **Model `medium`** przetwarzał jedną stronę 150–190 s zamiast około 10 s, a jedno zeskanowane odwołanie po jego OCR nie zostało rozpoznane. Odrzucony.
- Pozostałe 5 błędów w polskich znakach („odwolania” zamiast „odwołania”) wynika z samego OCR i bez zmiany silnika OCR ich nie usuniemy.

Wynik wydania dev.6 na pełnym zbiorze: 60 spraw i 16 dokumentów negatywnych F1 0,999 (bez zmian), skany 0,935, całość 0,991.

## Wydanie 2026.11.21-dev.5: poprawki krok po kroku

Każdą zmianę mierzyliśmy osobno na całym zbiorze organizatora (226 plików), z profilem domyślnym (Qwen3.5-9B przez endpoint UE Eden AI).

| Krok | Zmiana | F1 całości |
| --- | --- | --- |
| 0 | Wydanie 2026.11.21-dev.4; silnik bierze następne źródło, gdy walidator z poziomem `error` odrzuci wartość (bez zmiany wyniku: żaden walidator nie miał jeszcze tego poziomu) | 0,9812 |
| 1 | Osoby podpisujące i NIP mocodawcy tylko z LLM: reguła dopisywała osoby i NIP innego podmiotu | 0,9844 |
| 2 | Powód czynności: forma „zaniechawszy unieważnienia” (id 10) wygrywa z „wyborem oferty” w tym samym zdaniu; zdanie nie kończy się na skrótach „sp.”, „o.o.”, „sp.k.” | 0,9861 |
| 3 | Zamawiający: walidator odrzuca „Prezes Krajowej Izby Odwoławczej” (adresat pisma), nazwę bierze reguła | 0,9870 |
| 4 | Numer transakcji: walidator formatu (litery i cyfry, bez spacji i ukośników) | 0,9874 |
| 5 | Miejscowość: nazwy wielowyrazowe („Zielona Góra”, „Gorzów Wielkopolski”), bez łapania „Warszawa Tarnów” z linii z adresem KIO | 0,9878 |
| 6 | Normalizator `email`: przecinek z OCR zamiast kropki | 0,9882 |
| 7 | Instrukcja pól pełnomocnika: „Aleksandra Rybak” to kobieta w mianowniku (model zamieniał na „Aleksander”) | 0,9895 |

| Zbiór | F1 | Precyzja | Pełność |
| --- | --- | --- | --- |
| 60 spraw (180 dokumentów) i 16 dokumentów negatywnych | **0,999** | 0,999 | 0,999 |
| Skany: odwołania / pełnomocnictwa / przelewy | 0,943 / 0,949 / 0,841 | | |
| Wszystkie skany (30) | 0,926 | | |
| Całość (226 plików) | **0,990** | 0,991 | 0,988 |

Ostrzeżenie: poprawki stroiliśmy na tych samych danych, na których mierzymy, a wszystkie 60 spraw pochodzi z jednego generatora. Wynik 0,999 jest więc górną granicą, a nie prognozą dla ukrytego zbioru realnych spraw.

**Same LLM-y bez reguł** (każde pole tylko z modelu, weryfikacja źródła włączona; wydanie 2026.11.21-dev.4): Qwen3.5-9B 0,966 całości (0,975 dla spraw), Gemma 4 26B-A4B 0,964 (0,972), wobec 0,981 hybrydy. Bez reguł najwięcej błędów przybywa w powodzie i dacie czynności, rachunku nadawcy i kwocie przelewu; większy model nie nadrabia braku reguł.

## Pełny zbiór organizatora (wydanie 2026.11.21-dev.4)

Stan repozytorium organizatora z 21.11.2026 (submoduł `hacknation-2026`): 60 spraw, 16 dokumentów negatywnych i 30 nowych skanów ze wzorcami (`dane/skany`). Profil domyślny: Qwen3.5-9B przez endpoint UE Eden AI. 226 plików przetworzono w 125 s (konwersja z cache), bez błędów; wszystkie 210 wywołań LLM ma w śladzie dostawcę `flexai` i region `eu`.

| Zbiór | F1 | Precyzja | Pełność |
| --- | --- | --- | --- |
| 60 spraw (180 dokumentów) i 16 dokumentów negatywnych | **0,992** | 0,989 | 0,995 |
| Skany: odwołania (10) | 0,931 | | |
| Skany: pełnomocnictwa (10) | 0,924 | | |
| Skany: potwierdzenia przelewów (10) | 0,826 | | |
| Wszystkie skany (30) | 0,911 | 0,915 | 0,906 |
| Całość (226 plików) | **0,981** | 0,979 | 0,983 |

Wszystkie 16 dokumentów negatywnych dostaje `{}`, a wszystkie 30 skanów jest rozpoznanych poprawnie.

Poprawki względem pierwszego przebiegu na tym zbiorze (F1 całości 0,973, przelewy 0,941, skany przelewów 0,698):

- **Tytuł przelewu.** Najpierw etykieta „Tytuł” (także w wariantach z OCR: „Tytul”, „Tytut”), dopiero potem „Opis”. Reguła pomija etykiety stojące między nazwą a wartością („Tytułem / Kanał / …”), dołącza drugi akapit tytułu zaczynający się małą literą i odcina doklejone pole „NR REF. ……”. Błędne tytuły w cyfrowych przelewach: z 6 do 0.
- **Numer transakcji.** Reguła obsługuje „Numer referencyjny transakcji X” i wymaga cyfry w identyfikatorze. Wcześniej łapała słowa „transakcji” i „operacji”.
- **Rachunki.** Nowe etykiety „Rachunek kontrahenta” i „Rachunek uznawany”. Numer z LLM jest porównywany z tekstem po samych znakach, bo w dokumentach bywa pogrupowany po 4 cyfry. Dla rachunku odbiorcy pierwszeństwo ma LLM (rozróżnia odbiorcę i nadawcę w układach dwukolumnowych), dla rachunku nadawcy reguła (przy pierwszeństwie LLM 9 błędów zamiast 0).
- **OCR.** W tekście skanów „Ñ” jest zamieniane na „Ń” („PAÑSTWOWEJ”, „ZAMÓWIEÑ”).
- **Ocena.** `evaluate` przeszukuje całe drzewo wzorców (także `dane/skany/<rodzaj>/<nr>/`), rozpoznaje rodzaj dokumentu po treści wzorca i bierze nazwę wyniku od PDF-a obok wzorca (organizator zmienił w sprawach 01 i 02 nazwę `potwierdzenie_przelewu.pdf` na `przelew.pdf`).

Pozostałe błędy na skanach to głównie polskie znaki zgubione przez OCR („odwolania” zamiast „odwołania”), których nie da się bezpiecznie odtworzyć, oraz numery rachunków z prefiksem „PL” w 2 wzorcach skanów. Wynik zawiera zawsze same cyfry rachunku, tak jak wszystkie 60 wzorców cyfrowych.

## Dokumenty negatywne i klasyfikacja

Organizator dołączył dokumenty, które nie należą do żadnej klasy i mają dać `{}`: 12 w `dane/negatywne` i 4 w sprawach 04, 10, 24 i 37. Ewaluacja traktuje każdy PDF bez pliku wzorca jako negatywny: każde wypełnione pole w jego wyniku to FP.

- Wszystkie 16 dokumentów negatywnych dostaje `{}`. Wcześniej poradnik „prowadzenie postępowania odwoławczego” był rozpoznawany jako odwołanie po samym nagłówku „ODWOŁANIE”.
- Klasyfikacja nie korzysta z nazw plików. Przy wzorcach nazw orzeczenie KIO nazwane `odwolanie.pdf` było rozpoznawane jako odwołanie.
- Wszystkie 198 dokumentów (180 treningowych, 16 negatywnych i 2 z `szablon-aplikacja`) jest klasyfikowanych poprawnie z zapasem co najmniej 1 punktu względem progu (od wydania 2026.11.21-dev.9 przy pełnomocnictwie 0,5 punktu: próg 3,5, najsłabsze pełnomocnictwo 4,0). Dotyczy to także zeskanowanego odwołania z szablonu, w którym OCR zapisał nagłówek jako „ODWOLANIE”.
- Słownik powodów odpowiada `oczekiwane-json/czynnosc_powod_id_dict.md`: opis 6 to „Odpowiedzi/wyjaśnienia do SWZ”, a 12 to „Projektowane postanowienia umowy”. Słowa kluczowe dla 12 nie są sprawdzone na danych, bo zbiór treningowy nie ma takiej sprawy.

### Ogłoszenia z BZP (wydanie 2026.11.21-dev.9)

Test fałszywych trafień na ogłoszeniach z Biuletynu Zamówień Publicznych (API `ezamowienia.gov.pl/mo-board/api/v1/notice`, wrzesień–listopad 2026, wszystkie 8 typów ogłoszeń). Każde ogłoszenie powinno dostać `{}`.

| Zbiór | Co uruchomione | Dokumentów | Błędne przed dev.9 | Błędne po zmianie |
| --- | --- | ---: | ---: | ---: |
| Tekst ogłoszeń z HTML | reguły klasyfikacji | 3562 | 51 (1,4%) | 0 |
| PDF z ogłoszeń o zamówieniu i zmian ogłoszeń, pierwsze 6 stron | reguły klasyfikacji na warstwie tekstowej | 1200 | 10 (0,8%) | 0 |
| PDF, próbka z najtrudniejszymi przypadkami | pełny silnik bez LLM (przerwany) | 67 | 7 | nie mierzono |

Błędy dotyczyły ogłoszeń o zamówieniu (47 z 600 na tekście HTML) i zmian ogłoszeń (4 z 600); pozostałe typy ogłoszeń dawały 0. Przyczyny i zmiany:

- **Przelew.** Informacja o wadium („przelewem na rachunek… nr …”, „tytułem”, „zł”) dawała 3,5 punktu przy progu 3, bez słowa „przelew” na początku dokumentu. Zmiana: „wadium” z wagą −2.
- **Pełnomocnictwo.** Pouczenie o pełnomocniku konsorcjum („mocodawcy”, „umocowanie”, „do reprezentowania”) dawało równo próg 3. Zmiana: próg 3,5, więc potrzebny jest nagłówek PEŁNOMOCNICTWO i co najmniej dwa zwroty.
- **Wszystkie typy.** Tytuł ogłoszenia BZP („Ogłoszenie o zamówieniu / o zmianie ogłoszenia / …”) na samym początku dokumentu ma wagę −3.

Kolumna „po zmianie” była mierzona z regułą tytułu ogłoszenia szukaną w każdej linii pierwszych 600 znaków; wydanie ma ją zawężoną do samego początku dokumentu (`\A`), żeby nie trafiała w linię „Ogłoszenie o zamówieniu nr …” w nagłówku odwołania. Na dokumentach treningowych, skanach i negatywach organizatora klasyfikacja się nie zmieniła. Ryzyko: prawdziwe pełnomocnictwo z nagłówkiem i tylko jednym z trzech zwrotów (np. „udzielam pełnomocnictwa… do występowania przed KIO”) dostanie teraz `{}`.

## Skany

Symulowane skany spraw 01–03 (150 dpi, odcienie szarości, obrót 0,7°), same reguły:

| Wariant | F1 | Czas dla 9 dokumentów |
| --- | --- | --- |
| PDF cyfrowy | 0,995 | — |
| Skan, OCR całych stron (ustawienie domyślne) | 0,896 | 47 s |
| Skan, tryb domyślny Docling | 0,830 | 62 s |

Szczytowe zużycie pamięci przetwarzania wynosi około 2,1 GB, więc laptop testowy z 16 GB RAM wystarczy.

## Najważniejsze poprawki i ich przyczyny

- Literówka „unieważniił” w dokumentach: słowo kluczowe słownika powodów obejmuje teraz także tę formę.
- Przestawione nagłówki dwukolumnowe (adres Prezesa KIO w miejscu nazwy strony): reguły nazw pomijają takie linie.
- Numery TED i BZP innych postępowań cytowane w uzasadnieniu: reguły szukają tylko w sekcji „dotyczy”.
- Powód czynności: gdy dokument zawiera zdanie „Zamawiający w dniu … [czynność]”, reguła ma pierwszeństwo przed LLM.
- Docling zamienia półpauzę „–” na łącznik „-”: silnik przywraca oryginalny znak z warstwy tekstowej PDF.
- Zapętlenie modelu na jednym dokumencie: limit 2048 tokenów odpowiedzi i przejście na reguły zamiast wielominutowego oczekiwania.

## Pozostałe błędy (15 spraw kontrolnych, reguły + LLM)

- Osoby podpisujące pełnomocnictwo przy kilku mocodawcach przypisane do niewłaściwego mocodawcy (3 wartości).
- KRS odwołującego wskazany, choć wzorzec go nie ma (1).
- Rachunek odbiorcy nieodczytany w jednym układzie potwierdzenia przelewu (1).
- Dokument, na którym model się zapętlił: nazwę mocodawcy odczytały tylko reguły, bez powodzenia (1).
