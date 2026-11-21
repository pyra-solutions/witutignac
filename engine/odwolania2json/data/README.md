# Dane silnika

## `pl_diacritics.txt.gz`

Słownik do przywracania polskich znaków w tekście skanów (`odwolania2json/diacritics.py`, ustawienie
`settings.ocr_restore_diacritics`). Każda linia to forma wyrazu z polskimi znakami, np. `odwołania`, której
wersja bez znaków (`odwolania`) nie jest poprawnym słowem i odpowiada tylko tej jednej formie. Znacznik `*`
na początku oznacza, że wersja bez znaków jest pospolitym słowem angielskim (np. `*legał` dla „legal”).
Zawiera 1 554 477 form (4,2 MB).

Źródło: słownik SJP.PL dla Hunspella (pakiet `hunspell-pl` 1:25.2.3 z Ubuntu 26.04), autorzy: Marek Futrega
i współtwórcy sjp.pl. Licencja słownika do wyboru: GPL, LGPL, MPL, Apache 2.0 albo CC-SA 1.0. Plik jest
pochodną słownika na licencji Apache 2.0.

Formy rozwinięto programem `unmunch` (pakiet `hunspell-tools`). Słowa angielskie do znacznika `*` pochodzą
z list `wamerican` i `wbritish` (SCOWL) i nie są częścią pliku.

Odtworzenie: `engine/tools/build_pl_diacritics.py` (instrukcja w nagłówku skryptu). Skrypt zapisuje plik
deterministycznie, więc ten sam słownik daje ten sam plik.
