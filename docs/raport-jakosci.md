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
- Wszystkie 198 dokumentów (180 treningowych, 16 negatywnych i 2 z `szablon-aplikacja`) jest klasyfikowanych poprawnie z zapasem co najmniej 1 punktu względem progu. Dotyczy to także zeskanowanego odwołania z szablonu, w którym OCR zapisał nagłówek jako „ODWOLANIE”.
- Słownik powodów odpowiada `oczekiwane-json/czynnosc_powod_id_dict.md`: opis 6 to „Odpowiedzi/wyjaśnienia do SWZ”, a 12 to „Projektowane postanowienia umowy”. Słowa kluczowe dla 12 nie są sprawdzone na danych, bo zbiór treningowy nie ma takiej sprawy.

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
