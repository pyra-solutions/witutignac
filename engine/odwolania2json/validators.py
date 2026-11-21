"""Walidatory wartości. Zwracają None, gdy wartość jest poprawna, albo opis problemu.

O tym, czy problem jest ostrzeżeniem, czy usuwa wartość, decyduje `severity`
w konfiguracji pola. Domyślnie walidatory tylko ostrzegają: w danych
treningowych wiele numerów NIP/REGON/rachunków nie przechodzi sum kontrolnych.
"""

import re
from typing import Any

from odwolania2json.registry import validators


def _digits(value: Any) -> str:
    return re.sub(r"\D", "", str(value))


@validators.register("nip")
def nip(value: Any) -> str | None:
    d = _digits(value)
    if len(d) != 10:
        return f"NIP powinien mieć 10 cyfr, ma {len(d)}"
    w = [6, 5, 7, 2, 3, 4, 5, 6, 7]
    c = sum(int(a) * b for a, b in zip(d, w)) % 11
    if c == 10 or c != int(d[9]):
        return "niepoprawna suma kontrolna NIP"
    return None


@validators.register("regon")
def regon(value: Any) -> str | None:
    d = _digits(value)
    if len(d) == 9:
        w = [8, 9, 2, 3, 4, 5, 6, 7]
    elif len(d) == 14:
        w = [2, 4, 8, 5, 0, 9, 7, 3, 6, 1, 2, 4, 8]
    else:
        return f"REGON powinien mieć 9 albo 14 cyfr, ma {len(d)}"
    c = sum(int(a) * b for a, b in zip(d, w)) % 11 % 10
    if c != int(d[-1]):
        return "niepoprawna suma kontrolna REGON"
    return None


@validators.register("pesel")
def pesel(value: Any) -> str | None:
    d = _digits(value)
    if len(d) != 11:
        return f"PESEL powinien mieć 11 cyfr, ma {len(d)}"
    w = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3]
    c = (10 - sum(int(a) * b for a, b in zip(d, w)) % 10) % 10
    if c != int(d[10]):
        return "niepoprawna suma kontrolna PESEL"
    return None


@validators.register("krs")
def krs(value: Any) -> str | None:
    d = _digits(value)
    return None if len(d) == 10 else f"KRS powinien mieć 10 cyfr, ma {len(d)}"


@validators.register("iban_pl")
def iban_pl(value: Any) -> str | None:
    d = _digits(value)
    if len(d) != 26:
        return f"polski numer rachunku powinien mieć 26 cyfr, ma {len(d)}"
    if int(d[2:] + "2521" + d[:2]) % 97 != 1:
        return "niepoprawna suma kontrolna rachunku (IBAN)"
    return None


@validators.register("pattern")
def pattern(value: Any, re_: str | None = None, **kw: Any) -> str | None:
    rx = re_ or kw.get("re")
    if rx and not re.fullmatch(rx, str(value)):
        return f"wartość nie pasuje do wzorca {rx}"
    return None


@validators.register("enum")
def enum(value: Any, values: list[Any]) -> str | None:
    return None if value in values else f"wartość spoza listy {values}"


@validators.register("range")
def range_(value: Any, min: float | None = None, max: float | None = None) -> str | None:  # noqa: A002
    try:
        v = float(value)
    except (TypeError, ValueError):
        return "wartość nie jest liczbą"
    if min is not None and v < min:
        return f"wartość mniejsza niż {min}"
    if max is not None and v > max:
        return f"wartość większa niż {max}"
    return None
