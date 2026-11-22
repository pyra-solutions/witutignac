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
