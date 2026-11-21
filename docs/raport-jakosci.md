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

Sprawy kontrolne to co czwarta sprawa: 04, 08, …, 60, w tym 6 bardziej zróżnicowanych spraw z drugiej połowy zbioru. Pomiar z LLM wykonano na profilu deweloperskim (`gemini-dev`, ten sam otwarty model, który OVHcloud oferuje w UE). Pomiar na docelowym modelu `Qwen3.5-9B` czeka na klucz API OVHcloud.

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
