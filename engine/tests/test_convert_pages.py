from odwolania2json.config import ConversionProfile
from odwolania2json.convert import _pages_to_convert, _profile_key


def test_strony_skanu() -> None:
    p = ConversionProfile(max_pages=6, scanned_max_pages=3)
    assert _pages_to_convert(p, scanned=True) == 3
    assert _pages_to_convert(p, scanned=False) == 6
    assert _pages_to_convert(ConversionProfile(max_pages=6), scanned=True) == 6
    assert _pages_to_convert(ConversionProfile(max_pages=2, scanned_max_pages=3), scanned=True) == 2


def test_klucz_cache() -> None:
    # dokumentów z warstwą tekstową ustawienie skanów nie dotyczy, więc ich cache zostaje ważny
    a, b = ConversionProfile(max_pages=6), ConversionProfile(max_pages=6, scanned_max_pages=3)
    assert _profile_key(a, scanned=False) == _profile_key(b, scanned=False)
    assert _profile_key(a, scanned=True) != _profile_key(b, scanned=True)


def test_budzet_czasu_prog_i_poziomy() -> None:
    from odwolania2json.pipeline import select_budget_profile

    base = ConversionProfile(max_pages=6, scanned_max_pages=3, ocr_model_size="small")
    # brak budżetu albo za mała próbka rozgrzewkowa -> poziom 0
    assert select_budget_profile(base, None, 3000.0, 20, 150) == (base, 0)
    assert select_budget_profile(base, 2400.0, 50.0, 3, 150) == (base, 0)

    # mieści się z zapasem (10 dok. w 100 s -> szac. 1500 s <= 0.85 * 2400) -> poziom 0
    p0, t0 = select_budget_profile(base, 2400.0, 100.0, 10, 150)
    assert (t0, p0.scanned_max_pages, p0.ocr_model_size) == (0, 3, "small")

    # pozostała praca przekracza 85% pozostałego budżetu (140*14.5 = 2030 s > 0.85*2255 s) -> poziom 1 (2 strony)
    p1, t1 = select_budget_profile(base, 2400.0, 145.0, 10, 150)
    assert (t1, p1.scanned_max_pages, p1.ocr_model_size) == (1, 2, "small")

    # pozostała praca przekracza pozostały budżet (140*17 = 2380 s > 2230 s) -> poziom 2 (1 strona)
    p2, t2 = select_budget_profile(base, 2400.0, 170.0, 10, 150)
    assert (t2, p2.scanned_max_pages, p2.ocr_model_size) == (2, 1, "small")

    # sytuacja awaryjna (zostało < 5 s/dok. i obecne tempo przekracza budżet) -> poziom 3 (1 strona + tiny)
    p3, t3 = select_budget_profile(base, 2400.0, 2000.0, 50, 150)
    assert (t3, p3.scanned_max_pages, p3.ocr_model_size) == (3, 1, "tiny")

    # szybka partia blisko końca budżetu bez przekroczenia tempa (10*15.71 <= 0.85*200 s) -> zostaje poziom 0
    p_fast, t_fast = select_budget_profile(base, 2400.0, 2200.0, 140, 150)
    assert t_fast == 0
