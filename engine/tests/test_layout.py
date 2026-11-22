from docling_core.types.doc import BoundingBox, CoordOrigin, DocItemLabel, DoclingDocument, GroupLabel, Size
from docling_core.types.doc.document import ProvenanceItem

from odwolania2json.config import ConversionProfile
from odwolania2json.convert import _profile_key, export_markdown
from odwolania2json.layout import reorder_label_columns


def _doc(items: list[tuple[str, float, float, float, float]], group: bool = True) -> DoclingDocument:
    """Dokument z jedną stroną; elementy (tekst, l, t, r, b) w podanej kolejności, opcjonalnie w grupie
    key_value_area, jak Docling zwraca nagłówki odwołań ze skanów."""
    doc = DoclingDocument(name="t")
    doc.add_page(page_no=1, size=Size(width=600, height=850))
    parent = doc.add_group(label=GroupLabel.KEY_VALUE_AREA) if group else None
    for text, l, t, r, b in items:
        prov = ProvenanceItem(page_no=1, bbox=BoundingBox(l=l, t=t, r=r, b=b, coord_origin=CoordOrigin.TOPLEFT),
                              charspan=(0, len(text)))
        doc.add_text(label=DocItemLabel.TEXT, text=text, prov=prov, parent=parent)
    return doc


def _texts(doc: DoclingDocument) -> list[str]:
    return [it.text for it, _ in doc.iterate_items()]


# Nagłówek odwołania 0001 ze skanów organizatora (ramki w punktach, jak z Doclinga).
HEADER = [
    ("Odwołujący:", 111, 205, 180, 218),
    ("Zamawiający:", 105, 385, 183, 397),
    ("Dotyczy:", 134, 449, 184, 462),
    ("Konsorcjum wykonawców:", 196, 199, 330, 210),  # zaczyna się odrobinę wyżej niż etykieta
    ("Asterion Budownictwo sp. k.", 196, 213, 352, 224),
    ("reprezentowany przez pełnomocnika:", 197, 255, 380, 265),
    ("adres do korespondencji:", 198, 307, 323, 318),
    ("e-mail: a.rybak@rybak-kancelaria.example", 199, 357, 409, 368),
    ("Powiatowy Zespół Szkół Technicznych w Zielonkowie", 199, 383, 487, 393),
    ("postępowania o udzielenie zamówienia publicznego", 199, 448, 530, 523),
]


def test_kolumna_etykiet_w_grupie() -> None:
    doc = _doc(HEADER)
    notes = reorder_label_columns(doc)
    assert _texts(doc) == [
        "Odwołujący:", "Konsorcjum wykonawców:", "Asterion Budownictwo sp. k.",
        "reprezentowany przez pełnomocnika:", "adres do korespondencji:", "e-mail: a.rybak@rybak-kancelaria.example",
        "Zamawiający:", "Powiatowy Zespół Szkół Technicznych w Zielonkowie",
        "Dotyczy:", "postępowania o udzielenie zamówienia publicznego",
    ]
    assert notes == ["strona 1: kolumna etykiet Odwołujący:, Zamawiający:, Dotyczy: (7 wartości)"]
    # drugi przebieg niczego nie zmienia
    assert reorder_label_columns(doc) == []


def test_blok_konczy_sie_na_tekscie_z_lewej() -> None:
    items = [
        ("Zamawiający:", 129, 363, 198, 375),
        ("Dotyczy:", 157, 542, 201, 555),
        ("Wpis od odwołania: 10 000 zł", 72, 626, 206, 633),  # na lewo od kolumny wartości: koniec bloku
        ("Zarząd Dróg Powiatowych w Brzozowcu", 212, 373, 408, 381),
        ("postępowania o udzielenie zamówienia", 214, 540, 530, 600),
        ("Kancelaria, stopka po prawej", 300, 700, 500, 710),  # poniżej końca bloku: zostaje na miejscu
    ]
    doc = _doc(items, group=False)
    reorder_label_columns(doc)
    assert _texts(doc) == [
        "Zamawiający:", "Zarząd Dróg Powiatowych w Brzozowcu", "Dotyczy:", "postępowania o udzielenie zamówienia",
        "Wpis od odwołania: 10 000 zł", "Kancelaria, stopka po prawej",
    ]


def test_etykieta_w_polowie_bloku_i_bez_dwukropka() -> None:
    # Prawdziwe odwołanie z szablon-aplikacja: „Zamawiający:” stoi w połowie bloku danych, nazwa
    # zaczyna się wyżej niż etykieta; „Adres do doręczeń” nie ma dwukropka.
    items = [
        ("Odwołujący:", 141, 494, 275, 525),
        ("Adres do doręczeń", 116, 615, 293, 639),
        ("Zamawiający:", 134, 760, 281, 788),
        ("Spółka z ograniczoną odpowiedzialnością KRS NIP", 315, 454, 1023, 664),
        ("Miejskie Przedsiębiorstwo Oczyszczania w m. st. Warszawie", 318, 722, 1087, 775),
        ("Warszawa tel. fax. e-mail:", 319, 775, 1011, 826),
        ("Dotyczy: postępowania o udzielenie zamówienia", 115, 881, 1124, 986),
    ]
    doc = _doc(items, group=False)
    doc.pages[1].size = Size(width=1240, height=1754)
    notes = reorder_label_columns(doc)
    assert _texts(doc) == [
        "Odwołujący:", "Spółka z ograniczoną odpowiedzialnością KRS NIP", "Adres do doręczeń",
        "Zamawiający:", "Miejskie Przedsiębiorstwo Oczyszczania w m. st. Warszawie", "Warszawa tel. fax. e-mail:",
        "Dotyczy: postępowania o udzielenie zamówienia",
    ]
    assert notes == ["strona 1: kolumna etykiet Odwołujący:, Adres do doręczeń, Zamawiający: (3 wartości)"]


def test_akapit_miedzy_etykietami_przerywa_kolumne() -> None:
    # Etykieta pod akapitem nie przeskakuje nad niego: osobny odcinek kolumny.
    items = [
        ("Odwołujący:", 100, 200, 180, 212),
        ("Zamawiający:", 100, 260, 185, 272),
        ("Wnoszę odwołanie od czynności Zamawiającego, która polega na odrzuceniu oferty.", 60, 320, 540, 360),
        ("Dotyczy:", 120, 400, 185, 412),
        ("Asterion Budownictwo sp. k.", 200, 200, 360, 212),
        ("Muzeum Regionalne w Brzozowcu", 200, 260, 380, 272),
        ("postępowania nr ZP.1.2026", 200, 400, 420, 412),
    ]
    doc = _doc(items, group=False)
    notes = reorder_label_columns(doc)
    assert _texts(doc) == [
        "Odwołujący:", "Asterion Budownictwo sp. k.", "Zamawiający:", "Muzeum Regionalne w Brzozowcu",
        "Wnoszę odwołanie od czynności Zamawiającego, która polega na odrzuceniu oferty.",
        "Dotyczy:", "postępowania nr ZP.1.2026",
    ]
    assert notes == ["strona 1: kolumna etykiet Odwołujący:, Zamawiający: (2 wartości)"]


def test_jedna_kolumna_z_przypadkowymi_elementami_po_prawej_bez_zmian() -> None:
    # Wartości pod etykietami (jak odwołania 0002 i 0005); adres KIO i pieczęć po prawej to nie wartości.
    items = [
        ("Odwołujący:", 72, 200, 136, 212),
        ("Jan Kowalski", 72, 215, 160, 227),
        ("Zamawiający:", 72, 260, 146, 272),
        ("Gmina Zielonków", 72, 275, 180, 287),
        ("Prezes KIO", 300, 210, 450, 225),
        ("pieczęć wpływu", 300, 272, 450, 290),
    ]
    doc = _doc(items, group=False)
    assert reorder_label_columns(doc) == []
    assert _texts(doc) == [t for t, *_ in items]


def test_jedna_wartosc_na_dwie_etykiety_bez_zmian() -> None:
    # Przelew: OCR połączył obie wartości w jeden element; tylko jedna etykieta dostałaby wartość.
    items = [
        ("Nazwa firmy:", 26, 101, 73, 110),
        ("Numer klienta:", 26, 111, 79, 120),
        ("ASTERION BUDOWNICTWO SP. K. 273846", 96, 98, 214, 118),
    ]
    doc = _doc(items)
    assert reorder_label_columns(doc) == []
    assert _texts(doc) == [t for t, *_ in items]


def test_bez_zmian_gdy_etykieta_nad_wartoscia() -> None:
    # Odwołanie 0002: etykiety nad wartościami w jednej kolumnie, kolejność już dobra.
    items = [
        ("Odwołujący:", 72, 205, 136, 217),
        ("Medicor Infrastruktura S.A.", 74, 219, 203, 229),
        ("Zamawiający:", 78, 375, 146, 387),
        ("Powiatowy Zespół Szkół Technicznych w Wrzosowie", 78, 389, 324, 397),
    ]
    doc = _doc(items, group=False)
    assert reorder_label_columns(doc) == []
    assert _texts(doc) == [t for t, *_ in items]


def test_etykiety_w_kolumnie_wartosci_to_nie_kolumna() -> None:
    # „reprezentowany przez pełnomocnika:” i „adres do korespondencji:” stoją w kolumnie wartości;
    # nic nie leży na prawo od nich, więc nie tworzą kolumny etykiet.
    items = [
        ("reprezentowany przez pełnomocnika:", 197, 255, 380, 265),
        ("radca prawny Aleksandra Rybak", 198, 268, 355, 280),
        ("adres do korespondencji:", 198, 307, 323, 318),
        ("Kancelaria Radcy Prawnego", 198, 319, 422, 329),
    ]
    doc = _doc(items)
    assert reorder_label_columns(doc) == []
    assert _texts(doc) == [t for t, *_ in items]


def test_markdown_i_klucz_cache() -> None:
    md, notes = export_markdown(_doc(HEADER), reorder=True)
    assert md.index("Odwołujący:") < md.index("Asterion") < md.index("Zamawiający:") < md.index("Powiatowy")
    assert notes
    md_off, notes_off = export_markdown(_doc(HEADER), reorder=False)
    assert md_off.index("Dotyczy:") < md_off.index("Asterion") and notes_off == []

    p = ConversionProfile()
    on = p.model_copy(update={"scanned_label_columns": True})
    # wyłączona opcja: klucz jak przed jej dodaniem; dokumenty cyfrowe: klucz bez zmian także po włączeniu
    assert "scanned_label_columns" not in _profile_key(p)
    assert _profile_key(on, scanned=False) == _profile_key(p, scanned=False)
    assert _profile_key(on, scanned=True) != _profile_key(p, scanned=True)
    assert "|layout" in _profile_key(on, scanned=True)


def test_regula_nie_nadpisuje_wartosci_innego_elementu_listy() -> None:
    from odwolania2json.pipeline import Engine
    from odwolania2json.rules import Candidate

    cand = Candidate(value="999806152", start=0, end=16, rule=0, quote="REGON: 999806152")
    llm = {"Zamawiajacy[0].regon": None, "Zamawiajacy[1].regon": "999806152", "Odwolujacy[0].regon": "123456785"}
    # dwóch Zamawiających: LLM ma ten REGON w drugim, więc reguła nie wpisuje go do pierwszego
    assert Engine._rule_in_other_item("Zamawiajacy[0].regon", cand, llm) == "Zamawiajacy[1].regon"
    # jeden Zamawiający albo inna wartość: reguła działa jak dotąd
    assert Engine._rule_in_other_item("Zamawiajacy[0].regon", cand, {"Zamawiajacy[0].regon": "999806152"}) is None
    assert Engine._rule_in_other_item("Zamawiajacy[0].regon", cand, {"Zamawiajacy[1].regon": "111"}) is None
    # wartość w innej liście (Odwołujący) się nie liczy
    assert Engine._rule_in_other_item("Zamawiajacy[0].regon", Candidate(value="123456785", start=0, end=9, rule=0, quote=""), llm) is None
    # element poza limitem max_items (np. Odwolujacy[1] przy max_items=1) nie blokuje reguły dla [0]
    from odwolania2json.config import ListDef
    consortium_llm = {"Odwolujacy[0].pelnomocnik.imie_nazwisko": None, "Odwolujacy[1].pelnomocnik.imie_nazwisko": "Piotr Zalewski"}
    assert Engine._rule_in_other_item(
        "Odwolujacy[0].pelnomocnik.imie_nazwisko",
        Candidate(value="Piotr Zalewski", start=0, end=14, rule=0, quote=""),
        consortium_llm,
        [ListDef(path="Odwolujacy", max_items=1)],
    ) is None


def test_formularz_bez_dwukropkow_pary_etykieta_wartosc() -> None:
    items = [
        ("Bank Karpacki", 40, 20, 180, 40),
        ("Rachunek zleceniodawcy", 40, 100, 160, 114),
        ("Nazwa zleceniodawcy", 40, 120, 160, 134),
        ("Rachunek kontrahenta", 40, 140, 160, 154),
        ("11 1240 1111 9078 8570 5000 0455", 220, 100, 450, 114),
        ("Kancelaria SP. P.", 220, 120, 360, 134),
        ("25 1030 1508 9486 5035 5622 1675", 220, 140, 450, 154),
    ]
    doc = _doc(items)
    notes = reorder_label_columns(doc)
    assert notes
    assert _texts(doc) == [
        "Bank Karpacki",
        "Rachunek zleceniodawcy",
        "11 1240 1111 9078 8570 5000 0455",
        "Nazwa zleceniodawcy",
        "Kancelaria SP. P.",
        "Rachunek kontrahenta",
        "25 1030 1508 9486 5035 5622 1675",
    ]
