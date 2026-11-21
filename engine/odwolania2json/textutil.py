"""Operacje na tekście: sekcje, dopasowania, weryfikacja źródła (grounding)."""

import re
import unicodedata
from dataclasses import dataclass

from odwolania2json.config import Section

PAGE_BREAK = "<!-- page break -->"


@dataclass(frozen=True)
class Span:
    start: int
    end: int

    def slice(self, text: str) -> str:
        return text[self.start:self.end]


def find_section(text: str, section: Section, sections: dict[str, Section], _depth: int = 0) -> Span | None:
    """Zwraca zakres sekcji w tekście albo None, gdy początek nie występuje."""
    if _depth > 8:
        raise ValueError("zbyt głębokie zagnieżdżenie sekcji")
    lo, hi = 0, len(text)
    if section.within:
        parent = find_section(text, sections[section.within], sections, _depth + 1)
        if parent is None:
            return None
        lo, hi = parent.start, parent.end
    window = text[lo:hi]
    best: re.Match[str] | None = None
    for pat in section.start:
        m = re.search(pat, window, flags=re.IGNORECASE | re.MULTILINE)
        if m and (best is None or m.start() < best.start()):
            best = m
    if best is None:
        return None
    s = lo + (best.start() if section.include_start else best.end())
    e = hi
    search_from = lo + best.end()
    for pat in section.end:
        m = re.compile(pat, flags=re.IGNORECASE | re.MULTILINE).search(text, search_from, hi)
        if m and m.start() < e:
            e = m.start()
    if section.max_chars is not None:
        e = min(e, s + section.max_chars)
    return Span(s, e)


def section_text(text: str, name: str | None, sections: dict[str, Section]) -> tuple[str, int] | None:
    """Tekst sekcji i jej przesunięcie w dokumencie; None, gdy sekcji brak."""
    if not name:
        return text, 0
    span = find_section(text, sections[name], sections)
    if span is None:
        return None
    return span.slice(text), span.start


def page_of(text: str, offset: int) -> int:
    """Numer strony (od 1) dla przesunięcia w Markdown ze znacznikami podziału stron."""
    return text.count(PAGE_BREAK, 0, offset) + 1


def _fold(s: str) -> str:
    return unicodedata.normalize("NFC", s).casefold()


def alnum(s: str) -> str:
    """Tylko litery i cyfry, małymi literami: do porównań odpornych na spacje i interpunkcję."""
    return re.sub(r"[\W_]+", "", _fold(s))


def tokens(s: str) -> list[str]:
    return [t for t in re.findall(r"\w+", _fold(s)) if len(t) >= 2]


def grounded(value: object, text: str, mode: str) -> bool:
    """Czy wartość z LLM ma pokrycie w tekście dokumentu."""
    if mode == "none" or value is None:
        return True
    v = str(value)
    if mode == "required":
        a = alnum(v)
        return bool(a) and a in alnum(text)
    hay = set(tokens(text))
    hay_text = " ".join(sorted(hay))
    toks = tokens(v)
    if not toks:
        return True
    if mode == "tokens":
        return all(t in hay for t in toks)
    if mode == "token_prefix":
        # imiona i nazwiska bywają odmienione: wystarczy zgodny początek każdego wyrazu
        return all(any(h.startswith(t[: max(3, len(t) - 3)]) for h in hay) for t in toks) and bool(hay_text)
    raise ValueError(f"nieznany tryb weryfikacji źródła '{mode}'")


def collapse(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()
