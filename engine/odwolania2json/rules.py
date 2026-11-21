"""Klasyfikacja regułowa i ekstraktory deterministyczne (regex, dopasowanie słownika)."""

import re
from dataclasses import dataclass

from odwolania2json.config import DocumentType, FieldDef, Release, Rule, Section
from odwolania2json.textutil import section_text


@dataclass
class Candidate:
    value: str | int
    start: int
    end: int
    rule: int
    quote: str


def classify(text: str, filename: str, release: Release) -> tuple[str | None, dict[str, float]]:
    """Wybiera typ dokumentu o najwyższym wyniku; None, gdy żaden nie osiąga progu."""
    scores: dict[str, float] = {}
    for dt in release.document_types:
        c = dt.classification
        score = 0.0
        for p in c.patterns:
            hay = text if p.first_chars is None else text[: p.first_chars]
            if re.search(p.pattern, hay, flags=re.IGNORECASE | re.MULTILINE):
                score += p.weight
        for p in c.filename_patterns:
            if re.search(p.pattern, filename, flags=re.IGNORECASE):
                score += p.weight
        scores[dt.code] = score
    if not scores:
        return None, scores
    best = max(scores, key=lambda k: scores[k])
    dt = next(d for d in release.document_types if d.code == best)
    if scores[best] < dt.classification.min_score:
        return None, scores
    return best, scores


def _apply_regex(rule: Rule, text: str, offset: int, idx: int) -> list[Candidate]:
    assert rule.pattern
    flags = re.MULTILINE | (re.IGNORECASE if rule.ignore_case else 0)
    out: list[Candidate] = []
    for m in re.finditer(rule.pattern, text, flags=flags):
        try:
            val = m.group(rule.group)
        except IndexError:
            raise ValueError(f"reguła '{rule.pattern}' nie ma grupy {rule.group!r}") from None
        if val is None or not str(val).strip():
            continue
        s, e = m.span(rule.group)
        out.append(Candidate(val, offset + s, offset + e, idx, m.group(0)))
        if rule.occurrence == "first":
            break
    if rule.occurrence == "last" and out:
        out = out[-1:]
    if rule.unique:
        seen: set[str] = set()
        uniq = []
        for c in out:
            k = re.sub(r"\s+", " ", str(c.value)).strip().casefold()
            if k not in seen:
                seen.add(k)
                uniq.append(c)
        out = uniq
    return out


def _apply_dictionary(rule: Rule, text: str, offset: int, idx: int, release: Release) -> list[Candidate]:
    """Wybiera pozycję słownika, której słowa kluczowe występują w tekście najwcześniej i najczęściej."""
    assert rule.dictionary
    best: tuple[int, int, Candidate] | None = None  # (liczba trafień, -pozycja, kandydat)
    for entry in release.dictionary(rule.dictionary).entries:
        hits = 0
        first = None
        quote = ""
        for kw in entry.keywords:
            for m in re.finditer(kw, text, flags=re.IGNORECASE | re.MULTILINE):
                hits += 1
                if first is None or m.start() < first:
                    first, quote = m.start(), m.group(0)
        if hits and first is not None:
            value = getattr(entry, rule.value_key, None)
            if value is None:
                value = (entry.model_extra or {}).get(rule.value_key)
            cand = Candidate(value, offset + first, offset + first + len(quote), idx, quote)
            key = (-first, hits)
            if best is None or key > (best[0], best[1]):
                best = (key[0], key[1], cand)
    return [best[2]] if best else []


def extract_field(f: FieldDef, text: str, sections: dict[str, Section], release: Release) -> list[Candidate]:
    """Kandydaci z pierwszej reguły, która coś znalazła."""
    for i, rule in enumerate(f.rules):
        st = section_text(text, rule.section, sections)
        if st is None:
            continue
        sub, off = st
        if rule.kind == "regex":
            cands = _apply_regex(rule, sub, off, i)
        else:
            cands = _apply_dictionary(rule, sub, off, i, release)
        if cands:
            return cands
    return []


def indexed_paths(path: str, n: int) -> list[str]:
    """'A[].b' -> ['A[0].b', 'A[1].b', ...]; zagnieżdżone listy wyższego poziomu dostają [0]."""
    if "[]" not in path:
        return [path][:n] if n else []
    head, _, tail = path.rpartition("[]")
    head = head.replace("[]", "[0]")
    return [f"{head}[{i}]{tail}" for i in range(n)]


def extract_all(dt: DocumentType, text: str, release: Release) -> dict[str, Candidate]:
    sections = {s.name: s for s in dt.sections}
    out: dict[str, Candidate] = {}
    for f in dt.fields:
        if f.derive or not f.rules:
            continue
        cands = extract_field(f, text, sections, release)
        if "[]" not in f.path:
            cands = cands[:1]
        for p, c in zip(indexed_paths(f.path, len(cands)), cands):
            out[p] = c
    return out
