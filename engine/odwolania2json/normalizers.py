"""Normalizatory wartości. Każdy przyjmuje wartość i parametry z konfiguracji.

Zwracają znormalizowaną wartość albo None, gdy wartości nie da się sensownie
znormalizować (np. data, której nie da się odczytać).
"""

import re
from datetime import date
from typing import Any

from odwolania2json.registry import normalizers

MONTHS = {
    "stycznia": 1, "styczeń": 1, "styczen": 1,
    "lutego": 2, "luty": 2,
    "marca": 3, "marzec": 3,
    "kwietnia": 4, "kwiecień": 4, "kwiecien": 4,
    "maja": 5, "maj": 5,
    "czerwca": 6, "czerwiec": 6,
    "lipca": 7, "lipiec": 7,
    "sierpnia": 8, "sierpień": 8, "sierpien": 8,
    "września": 9, "wrzesnia": 9, "wrzesień": 9, "wrzesien": 9,
    "października": 10, "pazdziernika": 10, "październik": 10, "pazdziernik": 10,
    "listopada": 11, "listopad": 11,
    "grudnia": 12, "grudzień": 12, "grudzien": 12,
}

QUOTES = "\"'„”“«»‚’`"


def _str(value: Any) -> str | None:
    if value is None:
        return None
    s = str(value)
    return s if s.strip() else None


@normalizers.register("strip")
def strip(value: Any, chars: str | None = None) -> str | None:
    s = _str(value)
    if s is None:
        return None
    s = s.strip(chars) if chars else s.strip()
    return s or None


@normalizers.register("strip_punct")
def strip_punct(value: Any, chars: str = " ,.;:-–—") -> str | None:
    s = _str(value)
    if s is None:
        return None
    s = s.strip().strip(chars).strip()
    return s or None


@normalizers.register("strip_quotes")
def strip_quotes(value: Any) -> str | None:
    s = _str(value)
    if s is None:
        return None
    s = s.strip().strip(QUOTES).strip()
    return s or None


@normalizers.register("email")
def email(value: Any) -> str | None:
    """Adres e-mail bez spacji; przecinek między znakami (błąd OCR kropki) zamienia na kropkę."""
    s = _str(value)
    if s is None:
        return None
    s = re.sub(r"\s+", "", s)
    s = re.sub(r"(?<=[\w-]),(?=[\w-])", ".", s)
    return s if "@" in s else None


@normalizers.register("collapse_ws")
def collapse_ws(value: Any) -> str | None:
    s = _str(value)
    if s is None:
        return None
    return re.sub(r"\s+", " ", s).strip() or None


@normalizers.register("dehyphenate")
def dehyphenate(value: Any) -> str | None:
    """Skleja wyrazy przeniesione do nowej linii: 'odpowie-\\ndzialnoscia'."""
    s = _str(value)
    if s is None:
        return None
    return re.sub(r"(\w)-\s*\n\s*(\w)", r"\1\2", s)


@normalizers.register("digits_only")
def digits_only(value: Any) -> str | None:
    s = _str(value)
    if s is None:
        return None
    d = re.sub(r"\D", "", s)
    return d or None


@normalizers.register("remove_prefix")
def remove_prefix(value: Any, patterns: list[str]) -> str | None:
    """Usuwa z początku wartości dowolny z podanych wzorców (np. 'r. pr.', 'adw.')."""
    s = _str(value)
    if s is None:
        return None
    s = s.strip()
    changed = True
    while changed:
        changed = False
        for p in patterns:
            m = re.match(rf"(?:{p})\s*", s, flags=re.IGNORECASE)
            if m and m.end() > 0:
                s = s[m.end():].strip()
                changed = True
    return s or None


@normalizers.register("regex_replace")
def regex_replace(value: Any, pattern: str, repl: str = "", ignore_case: bool = True) -> str | None:
    s = _str(value)
    if s is None:
        return None
    flags = re.IGNORECASE if ignore_case else 0
    return re.sub(pattern, repl, s, flags=flags).strip() or None


@normalizers.register("regex_extract")
def regex_extract(value: Any, pattern: str, group: int | str = 1, ignore_case: bool = True) -> str | None:
    s = _str(value)
    if s is None:
        return None
    m = re.search(pattern, s, flags=re.IGNORECASE if ignore_case else 0)
    return m.group(group).strip() if m and m.group(group) else None


@normalizers.register("date_iso")
def date_iso(value: Any) -> str | None:
    """Zamienia datę w popularnych polskich zapisach na YYYY-MM-DD."""
    s = _str(value)
    if s is None:
        return None
    s = s.strip().lower()
    m = re.search(r"\b(\d{4})-(\d{1,2})-(\d{1,2})\b", s)
    if m:
        return _iso(int(m.group(1)), int(m.group(2)), int(m.group(3)))
    m = re.search(r"\b(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})\b", s)
    if m:
        return _iso(int(m.group(3)), int(m.group(2)), int(m.group(1)))
    m = re.search(r"\b(\d{1,2})\s+([a-ząćęłńóśźż]+)\s+(\d{4})", s)
    if m and m.group(2) in MONTHS:
        return _iso(int(m.group(3)), MONTHS[m.group(2)], int(m.group(1)))
    return None


def _iso(y: int, m: int, d: int) -> str | None:
    try:
        return date(y, m, d).isoformat()
    except ValueError:
        return None


@normalizers.register("iban_digits")
def iban_digits(value: Any) -> str | None:
    """Numer rachunku bez prefiksu kraju i spacji (same cyfry)."""
    s = _str(value)
    if s is None:
        return None
    s = re.sub(r"^\s*[A-Za-z]{2}", "", s.strip())
    d = re.sub(r"\D", "", s)
    return d or None


@normalizers.register("ted_number")
def ted_number(value: Any) -> str | None:
    """'2025/S 123-456789', '2026/S086-999073' albo '456789-2025' -> 'NNNNNN-YYYY'."""
    s = _str(value)
    if s is None:
        return None
    m = re.search(r"(\d{4})\s*/\s*S\s*\d{1,3}\s*-\s*(\d{4,7})", s, flags=re.IGNORECASE)
    if m:
        return f"{m.group(2)}-{m.group(1)}"
    m = re.search(r"\b(\d{4,7})\s*-\s*((?:19|20)\d{2})\b", s)
    if m:
        return f"{m.group(1)}-{m.group(2)}"
    return None


@normalizers.register("bzp_number")
def bzp_number(value: Any) -> str | None:
    """'2026/BZP 00999778/01' -> '2026/BZP00999778/01' (bez spacji)."""
    s = _str(value)
    if s is None:
        return None
    m = re.search(r"(\d{4})\s*/\s*BZP\s*(\d{5,10})(?:\s*/\s*(\d{1,2}))?", s, flags=re.IGNORECASE)
    if not m:
        return None
    out = f"{m.group(1)}/BZP{m.group(2)}"
    if m.group(3):
        out += f"/{m.group(3)}"
    return out


@normalizers.register("amount_decimal")
def amount_decimal(value: Any) -> float | None:
    """'10 000,00 zł' -> 10000.0; '1.234,56' -> 1234.56; '1,234.56' -> 1234.56."""
    if isinstance(value, (int, float)):
        return float(value)
    s = _str(value)
    if s is None:
        return None
    m = re.search(r"\d[\d\s.,  ]*", s)
    if not m:
        return None
    num = re.sub(r"[\s  ]", "", m.group(0)).rstrip(".,")
    if "," in num and "." in num:
        if num.rfind(",") > num.rfind("."):
            num = num.replace(".", "").replace(",", ".")
        else:
            num = num.replace(",", "")
    elif "," in num:
        whole, _, frac = num.rpartition(",")
        num = f"{whole.replace(',', '')}.{frac}" if len(frac) in (1, 2) else num.replace(",", "")
    elif num.count(".") > 1:
        num = num.replace(".", "")
    try:
        return float(num)
    except ValueError:
        return None


@normalizers.register("to_int")
def to_int(value: Any) -> int | None:
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, int):
        return value
    s = _str(value)
    if s is None:
        return None
    m = re.search(r"-?\d+", s)
    return int(m.group(0)) if m else None


@normalizers.register("map_values")
def map_values(value: Any, mapping: dict[str, Any], default: Any = None, keep_unmapped: bool = True) -> Any:
    """Zamienia wartość według słownika z konfiguracji (porównanie bez wielkości liter)."""
    if value is None:
        return None
    key = str(value).strip().casefold()
    for k, v in mapping.items():
        if k.casefold() == key:
            return v
    return value if keep_unmapped else default


def apply_chain(value: Any, chain: list[Any]) -> Any:
    """Uruchamia łańcuch normalizatorów: [{'name': 'strip'}, {'name': 'x', 'args': {...}}]."""
    for step in chain:
        if value is None:
            return None
        fn = normalizers.get(step.name)
        value = fn(value, **(step.args or {}))
    return value
