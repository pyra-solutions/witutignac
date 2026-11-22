"""Operacje na tekście: sekcje, dopasowania, weryfikacja źródła (grounding)."""

import re
import unicodedata
from dataclasses import dataclass
from difflib import SequenceMatcher

from odwolania2json.config import Section

PAGE_BREAK = "<!-- page break -->"

# OCR czyta polskie "Ń" jako hiszpańskie "Ñ" (np. "PAÑSTWOWEJ", "ZAMÓWIEÑ"). W polskich dokumentach
# "Ñ" nie występuje, więc w tekście skanów zamieniamy je z powrotem.
_OCR_PL = str.maketrans({"Ñ": "Ń", "ñ": "ń"})
# Gravis i daszek („Systèmy”, „Brzozowskì”, „przepisôw”) to szum OCR: w polskich dokumentach nie występują.
# Litera bez znaku; „przepisow” -> „przepisów” robi potem przywracanie polskich znaków (diacritics.py).
# Umlauty (ö, ü, ä) zostają: bywają w nazwiskach (Müller).
_OCR_PL.update(str.maketrans("àèìòùÀÈÌÒÙâêîôûÂÊÎÔÛ", "aeiouAEIOUaeiouAEIOU"))
# Przecinek zamiast kropki w adresie e-mail, bez spacji: "a,wrobel@kancelaria.pl" -> "a.wrobel@kancelaria.pl".
_OCR_MAIL_COMMA = re.compile(r"(?<![^\W_])([^\W_]+),(?=[^\W_][\w.+-]*@[\w-]+\.\w)")

# Samodzielny ciąg cyfr i liter o/O (bez liter ani cyfr tuż przed i tuż po), np. "9994328o29", "(3o-799)".
_OCR_DIGIT_RUN = re.compile(r"(?<![^\W_])[0-9oO]++(?![^\W_])")
# "Sp. z 0.o.", "z 0.0.", "z o.0." -> "z o.o."
_OCR_ZOO = re.compile(r"(?<![^\W_])((?:(sp|Sp|SP)\.\s?)?[zZ]\s)([0oO]\.\s?[0oO]\.)")
# "oplata"/"opiata" przed słowami opłatowymi (SJP ma czasownik "oplata", więc słownik tego nie poprawia)
_OCR_OPLATA = re.compile(
    r"\b([Oo][Pp])[lLiI]([Aa][Tt][AaĄąYyĘę])\b(?=\s+(?:skarb\w*|s[ąa]dow\w*|od\b|za\b|manipul\w*))",
    flags=re.IGNORECASE,
)
# RapidOCR myli "ł" z "i" w "pełnomocnictw..." ("peinomocnictwa")
_OCR_PELNOMOCNICTWO = re.compile(r"\b([Pp][Ee])[iI]([Nn][Oo][Mm][Oo][Cc][Nn][Ii][Cc][Tt][Ww]\w*)\b")


def _l_stroke(m: re.Match[str]) -> str:
    head, tail = m.group(1), m.group(2)
    return f"{head}{'Ł' if head.isupper() and tail.isupper() else 'ł'}{tail}"


def _digit_run(m: re.Match[str]) -> str:
    s = m.group(0)
    if len(s) < 2 or not any(c.isdigit() for c in s):
        return s
    return s.replace("o", "0").replace("O", "0")


def _zoo(m: re.Match[str]) -> str:
    head, sp, oo = m.group(1), m.group(2), m.group(3)
    if "0" not in oo:
        return m.group(0)
    if sp:
        # wielkość liter jak w "Sp."/"SP." (OCR czyta też "Sp. z o.o." jako "Sp. Z 0.0.")
        upper = sp == "SP"
        head = head[:-2] + ("Z" if upper else "z") + head[-1]
    else:
        # bez "Sp.": jak druga litera skrótu, a przy "0.0." jak "z"/"Z"
        upper = "O" in oo or ("o" not in oo and head[0] == "Z")
    return head + re.sub("[0oO]", "O" if upper else "o", oo)


def fix_ocr_pl(text: str) -> str:
    """Poprawki typowych pomyłek OCR w tekście skanów (polskie dokumenty).

    - "Ñ" -> "Ń",
    - litera o/O w liczbie -> 0 ("KRS: 9994328o29" -> "9994328029", "(3o-799)" -> "(30-799)"),
    - zero w skrócie formy prawnej -> o ("Sp. z 0.o." -> "Sp. z o.o."),
    - gravis i daszek -> litera bez znaku ("Systèmy" -> "Systemy"),
    - przecinek w adresie e-mail -> kropka ("a,wrobel@" -> "a.wrobel@").
    Słowa z literami i cyframi (np. "k2o", "biuro2o") zostają bez zmian.
    """
    text = text.translate(_OCR_PL)
    text = _OCR_DIGIT_RUN.sub(_digit_run, text)
    text = _OCR_MAIL_COMMA.sub(r"\1.", text)
    text = _OCR_OPLATA.sub(_l_stroke, text)
    text = _OCR_PELNOMOCNICTWO.sub(_l_stroke, text)
    return _OCR_ZOO.sub(_zoo, text)


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


_OCR_CONFUSABLE = str.maketrans({"0": "o", "1": "l", "i": "l", "|": "l"})


def _ocr_fold_token(s: str) -> str:
    s = unicodedata.normalize("NFKD", s.replace("ł", "l").replace("Ł", "L"))
    s = "".join(c for c in s if not unicodedata.combining(c)).casefold()
    return re.sub(r"[\W_]+", "", s).translate(_OCR_CONFUSABLE)


def ocr_fold(s: str) -> str:
    """Litery i cyfry bez polskich znaków, z utożsamieniem znaków mylonych przez OCR (0/o, 1/l/i)."""
    return _ocr_fold_token(s)


def _grounded_fuzzy(v: str, text: str) -> bool:
    """Na skanach dopuszcza drobne literówki OCR w słowach alfabetycznych (dł. >= 4),
    przy zachowaniu ścisłej zgodności wszystkich tokenów zawierających cyfry."""
    toks = [t for t in re.findall(r"\w+", _fold(v)) if len(t) >= 2]
    if not toks:
        return True
    hay_words = [h for h in re.findall(r"\w+", _fold(text)) if len(h) >= 2]
    hay_fold = {_ocr_fold_token(h) for h in hay_words}
    hay_fold.discard("")
    alpha_hay = [h for h in hay_fold if not any(c.isdigit() for c in h)]
    text_fold = ocr_fold(text)
    total = 0
    matched = 0
    for t in toks:
        tf = _ocr_fold_token(t)
        if not tf:
            continue
        total += 1
        if any(c.isdigit() for c in tf):
            if tf in hay_fold or (len(tf) >= 3 and tf in text_fold):
                matched += 1
            else:
                return False
        elif (
            tf in hay_fold
            or (len(tf) >= 4 and tf in text_fold)
            or (
                len(tf) >= 4
                and any(
                    abs(len(h) - len(tf)) <= 2 and SequenceMatcher(None, tf, h).ratio() >= 0.75
                    for h in alpha_hay
                )
            )
        ):
            matched += 1
    return total == 0 or (matched >= 1 and matched / total >= 0.85)


def grounded(value: object, text: str, mode: str, ocr_tolerant: bool = False) -> bool:
    """Czy wartość z LLM ma pokrycie w tekście dokumentu.

    Z `ocr_tolerant` (skany) wartość, która nie przeszła zwykłego porównania, wystarczy, że wystąpi
    w tekście w całości po `ocr_fold` (co najmniej 4 znaki). Tryb `fuzzy` dopuszcza dodatkowo
    drobne literówki OCR w słowach alfabetycznych (na PDF-ach cyfrowych działa jak `tokens`).
    """
    if mode == "none" or value is None:
        return True
    s = str(value)
    if _grounded(s, text, "tokens" if mode == "fuzzy" else mode):
        return True
    if not ocr_tolerant:
        return False
    v = ocr_fold(s)
    if len(v) < 4:
        return False
    if v in ocr_fold(text):
        return True
    return mode == "fuzzy" and _grounded_fuzzy(s, text)


def _grounded(v: str, text: str, mode: str) -> bool:
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
