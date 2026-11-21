"""Przywracanie polskich znaków w tekście skanów.

OCR (RapidOCR) gubi część znaków diakrytycznych, najczęściej „ł” i wielkie litery z ogonkami:
„odwolania”, „PELNOMOCNICTWO”, „DEBNICY”. Słowo z OCR dostaje polskie znaki, gdy:

1. słownik SJP zna dokładnie jedną jego wersję z polskimi znakami, a wersja bez znaków nie jest poprawnym
   słowem („odwolania” -> „odwołania”, ale nie „sad” -> „sąd” ani „zle” -> „złe”/„źle”), albo
2. ten sam dokument zawiera dokładnie jedną taką wersję, jest ona słowem ze słownika, a słowo z OCR nie jest
   poprawne bez znaków („Spólka” -> „Spółka”, „Lesna” -> „Leśna”) albo jest pisaną wielką literą nazwą własną
   („Lukasz” -> „Łukasz”, gdy w innym miejscu OCR odczytał „Łukasz”). Nie: „maja” -> „mają” (data „20 maja”),
   „Zawadzki” -> „Zawadżki” (błędny znak z OCR nie jest słowem).

Znaki, które OCR już odczytał, muszą się zgadzać z poprawką. Pomijane są: słowa krótsze niż 4 litery
(zwykle kawałki rozbitych wyrazów), adresy e-mail i WWW, ciągi z cyframi lub ukośnikiem (kody postępowań,
np. „DAZ/PN/67/26”) i pisane wielką literą słowa, które są też pospolitymi słowami angielskimi
(„Legal” w nazwie kancelarii). Kropka środkowa między słowami („OŚRODEK·SPORTU”) staje się spacją.

Słownik: engine/odwolania2json/data/pl_diacritics.txt.gz (opis i licencja w data/README.md).
"""

import gzip
import re
import threading
from pathlib import Path

DATA_FILE = Path(__file__).with_name("data") / "pl_diacritics.txt.gz"

_FOLD = str.maketrans("ąćęłńóśźżĄĆĘŁŃÓŚŹŻ", "acelnoszzACELNOSZZ")
_PL = frozenset("ąćęłńóśźż")
_BASE = frozenset("acelnosz")  # litery, które mogą mieć polski znak
_TOKEN = re.compile(r"(?<!\w)[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]{4,}(?!\w)")
_CHUNK = re.compile(r"\S+")
_SKIP_CHUNK = re.compile(r"@|://|^www\.|\d|/|\.(?:pl|com|eu|example|gov|org|net)\b", re.IGNORECASE)
_MIDDOT = re.compile(r"(?<=\w)·(?=\w)")

# Znaczniki w pliku słownika (engine/tools/build_pl_diacritics.py): wersja bez znaków jest pospolitym słowem
# angielskim („*legał”); słowo do potwierdzenia pisowni z dokumentu, którego wersja bez znaków nie jest słowem
# („+leśna”); nazwa własna, której wersja bez znaków jest słowem („^łukasz”).
ENGLISH_MARK = "*"
DOC_MARK = "+"
PROPER_MARK = "^"


def fold(word: str) -> str:
    """Słowo bez polskich znaków."""
    return word.translate(_FOLD)


def _with_case(src: str, cand: str) -> str | None:
    if src.islower():
        return cand
    if src.isupper():
        return cand.upper()
    if src[0].isupper() and src[1:].islower():
        return cand[0].upper() + cand[1:]
    return None  # mieszana wielkość liter (np. „McDonald”): bez zmian


def _consistent(lw: str, cand: str) -> bool:
    """Polskie znaki odczytane przez OCR muszą zostać na swoich miejscach."""
    return all(a == b or a in _BASE for a, b in zip(lw, cand))


class DiacriticsRestorer:
    def __init__(self, words: list[str]) -> None:
        # klucz: słowo bez polskich znaków -> (słowo ze znakami, czy klucz jest słowem angielskim)
        self._map: dict[str, tuple[str, bool]] = {}
        # słowa ze znakami, które mogą potwierdzić pisownię z tego samego dokumentu
        self._doc: set[str] = set()
        self._proper: set[str] = set()
        for w in words:
            if w.startswith(DOC_MARK):
                self._doc.add(w[1:].lower())
                continue
            if w.startswith(PROPER_MARK):
                self._proper.add(w[1:].lower())
                continue
            eng = w.startswith(ENGLISH_MARK)
            w = w.removeprefix(ENGLISH_MARK).lower()
            self._map[fold(w)] = (w, eng)

    def _doc_word(self, lw: str) -> bool:
        """Czy słowo ze znakami może potwierdzić pisownię z dokumentu (małymi literami)."""
        if lw in self._doc or lw in self._proper:
            return True
        hit = self._map.get(fold(lw))
        return hit is not None and hit[0] == lw

    @classmethod
    def from_file(cls, path: Path) -> "DiacriticsRestorer":
        with gzip.open(path, "rt", encoding="utf-8") as f:
            return cls(f.read().split())

    def __len__(self) -> int:
        return len(self._map)

    def restore(self, text: str) -> tuple[str, list[tuple[str, str]]]:
        """Tekst z przywróconymi polskimi znakami i lista zmian (przed, po)."""
        text = _MIDDOT.sub(" ", text)
        vocab: dict[str, set[str]] = {}
        for m in _TOKEN.finditer(text):
            lw = m.group(0).lower()
            # tylko słowa ze słownika: OCR potrafi też dodać znak („Zawadżki”, „potwierdzonę”)
            if not _PL.isdisjoint(lw) and self._doc_word(lw):
                vocab.setdefault(fold(lw), set()).add(lw)
        changes: list[tuple[str, str]] = []

        def fix(m: re.Match[str]) -> str:
            w = m.group(0)
            lw = w.lower()
            key = fold(lw)
            cand = None
            hit = self._map.get(key)
            if hit is not None and not (hit[1] and not w.islower()):
                cand = hit[0]
            elif len(vocab.get(key, ())) == 1:
                cand = next(iter(vocab[key]))
                if cand in self._proper and w.islower():
                    cand = None  # „łukasz” tylko dla „Lukasz”/„LUKASZ”, nie dla czasownika „lukasz”
            if cand is None or cand == lw or not _consistent(lw, cand):
                return w
            out = _with_case(w, cand)
            if out is None:
                return w
            changes.append((w, out))
            return out

        def chunk(c: re.Match[str]) -> str:
            s = c.group(0)
            return s if _SKIP_CHUNK.search(s) else _TOKEN.sub(fix, s)

        return _CHUNK.sub(chunk, text), changes


_default: DiacriticsRestorer | None = None
_lock = threading.Lock()


def default_restorer() -> DiacriticsRestorer:
    """Słownik z pakietu, wczytywany raz na proces (ok. 2 s, ok. 300 MB RAM) dopiero przy pierwszym skanie."""
    global _default
    with _lock:
        if _default is None:
            _default = DiacriticsRestorer.from_file(DATA_FILE)
        return _default


def restore_diacritics(text: str) -> tuple[str, list[tuple[str, str]]]:
    return default_restorer().restore(text)
