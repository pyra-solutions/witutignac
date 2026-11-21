from odwolania2json.diacritics import DiacriticsRestorer, restore_diacritics

SMALL = DiacriticsRestorer(["odwołania", "pełnomocnictwa", "dębnicy", "*legał", "dążę"])


def fixed(r: DiacriticsRestorer, text: str) -> str:
    return r.restore(text)[0]


def test_slownik_i_wielkosc_liter() -> None:
    assert fixed(SMALL, "Wpis od odwolania") == "Wpis od odwołania"
    assert fixed(SMALL, "WPIS OD ODWOLANIA, W DEBNICY GÓRNEJ") == "WPIS OD ODWOŁANIA, W DĘBNICY GÓRNEJ"
    assert fixed(SMALL, "Pelnomocnictwa:") == "Pełnomocnictwa:"
    out, changes = SMALL.restore("odwolania i pelnomocnictwa")
    assert changes == [("odwolania", "odwołania"), ("pelnomocnictwa", "pełnomocnictwa")]


def test_bez_zmian() -> None:
    for s in (
        "Michalak Legal Kancelaria",  # angielskie słowo wielką literą
        "a.rybak@odwolania-kancelaria.example",  # e-mail
        "www.odwolania.pl",  # adres WWW
        "DAZE/PN/67/26",  # kod z ukośnikiem (bez niego: „dążę”)
        "obiektywnych",  # słowo spoza słownika
        "odwolania2026",  # ciąg z cyframi
        "OdwOLANIA",  # mieszana wielkość liter
        "odwołania",  # już poprawne
    ):
        assert fixed(SMALL, s) == s, s
    # małymi literami słowo z kolizją angielską jest poprawiane
    assert fixed(SMALL, "legal") == "legał"


def test_znaki_odczytane_przez_ocr_musza_sie_zgadzac() -> None:
    r = DiacriticsRestorer(["odwołującego"])
    assert fixed(r, "Odwolującego") == "Odwołującego"
    assert fixed(r, "Odwólującego") == "Odwólującego"


def test_pisownia_z_tego_samego_dokumentu() -> None:
    r = DiacriticsRestorer(["^łukasz", "+łódź", "+lódź", "+spółka", "+spółką"])
    assert fixed(r, "Łukasz Sosnowski – Prezes\nreprezentowana przez: Lukasz Sosnowski") == (
        "Łukasz Sosnowski – Prezes\nreprezentowana przez: Łukasz Sosnowski")
    # dwie różne wersje w dokumencie: bez zgadywania
    assert fixed(r, "Łódź, Lódź, Lodz") == "Łódź, Lódź, Lodz"
    assert fixed(r, "Spółka Akcyjna; Spólka Akcyjna") == "Spółka Akcyjna; Spółka Akcyjna"
    # nazwa własna tylko wielką literą: „lukasz” to też forma czasownika
    assert fixed(r, "Łukasz; lukasz") == "Łukasz; lukasz"
    # słowo poprawne bez znaków, a w dokumencie forma pospolita: bez zmian („20 maja” i „mają”)
    assert fixed(DiacriticsRestorer([]), "dnia 20 maja 2026 r. Wykonawcy mają prawo") == (
        "dnia 20 maja 2026 r. Wykonawcy mają prawo")
    # błędny znak z OCR nie jest słowem ze słownika, więc nie przenosi się na poprawne wystąpienia
    assert fixed(r, "Szymon Zawadżki – Prokurent\nSzymon Zawadzki") == "Szymon Zawadżki – Prokurent\nSzymon Zawadzki"


def test_kropka_srodkowa() -> None:
    assert fixed(SMALL, "MIEJSKI OŚRODEK·SPORTU") == "MIEJSKI OŚRODEK SPORTU"


def test_slownik_z_pakietu() -> None:
    out, _ = restore_diacritics("OPLATA od PELNOMOCNICTWA, zostala zlożona; zlożenie; Wydzial; sad; zle; byla; Szymanski")
    # „oplata”, „zlożona” (złożona/złożoną), „sad”, „zle”, „byla” są niejednoznaczne albo poprawne bez znaków
    assert out == "OPLATA od PEŁNOMOCNICTWA, została zlożona; złożenie; Wydział; sad; zle; byla; Szymański"
