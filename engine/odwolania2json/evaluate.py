"""Ewaluacja F1: porównanie wyników z plikami wzorcowymi, pole po polu.

Zasady liczenia (organizator nie opublikował dokładnej definicji):
- porównujemy liście drzewa JSON po lekkiej normalizacji (wielkość liter, spacje);
- wartość zgodna -> TP; wartość tam, gdzie wzorzec ma null -> FP;
  null tam, gdzie wzorzec ma wartość -> FN; inna wartość -> FP i FN;
- elementy list parujemy zachłannie po największej liczbie zgodnych pól;
- PDF w katalogu wzorców bez pliku wzorca to dokument negatywny: oczekiwany wynik to `{}`,
  więc każda niepusta wartość w jego wyniku liczy się jako FP.
"""

import json
import re
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


@dataclass
class Counts:
    tp: int = 0
    fp: int = 0
    fn: int = 0

    def add(self, o: "Counts") -> None:
        self.tp += o.tp
        self.fp += o.fp
        self.fn += o.fn

    @property
    def precision(self) -> float:
        return self.tp / (self.tp + self.fp) if self.tp + self.fp else 0.0

    @property
    def recall(self) -> float:
        return self.tp / (self.tp + self.fn) if self.tp + self.fn else 0.0

    @property
    def f1(self) -> float:
        p, r = self.precision, self.recall
        return 2 * p * r / (p + r) if p + r else 0.0


@dataclass
class Report:
    total: Counts = field(default_factory=Counts)
    by_type: dict[str, Counts] = field(default_factory=lambda: defaultdict(Counts))
    by_field: dict[str, Counts] = field(default_factory=lambda: defaultdict(Counts))
    errors: list[dict[str, Any]] = field(default_factory=list)
    missing_pred: list[str] = field(default_factory=list)
    negatives: int = 0
    negatives_classified: list[str] = field(default_factory=list)  # negatywne z niepustym wynikiem
    positives_empty: list[str] = field(default_factory=list)  # dokumenty klas z pustym wynikiem


NEGATIVE = "negatywny"


def _norm(v: Any) -> Any:
    if v is None:
        return None
    if isinstance(v, bool):
        return int(v)
    if isinstance(v, (int, float)):
        return float(v)
    s = re.sub(r"\s+", " ", str(v)).strip().casefold()
    if re.fullmatch(r"-?\d+(\.\d+)?", s):
        return float(s)
    return s or None


def _leaves(obj: Any, prefix: str = "") -> dict[str, Any]:
    out: dict[str, Any] = {}
    if isinstance(obj, dict):
        for k, v in obj.items():
            p = f"{prefix}.{k}" if prefix else k
            if isinstance(v, (dict, list)):
                out.update(_leaves(v, p))
            else:
                out[p] = v
    elif isinstance(obj, list):
        out.update(_list_leaves(obj, prefix))
    return out


def _list_leaves(items: list[Any], prefix: str) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for i, it in enumerate(items):
        if isinstance(it, (dict, list)):
            out.update(_leaves(it, f"{prefix}[{i}]"))
        else:
            out[f"{prefix}[{i}]"] = it
    return out


def _compare(pred: Any, gold: Any, path: str, rep: Report, dtype: str, case: str) -> None:
    if isinstance(gold, dict) or isinstance(pred, dict):
        g = gold if isinstance(gold, dict) else {}
        p = pred if isinstance(pred, dict) else {}
        for k in list(g) + [k for k in p if k not in g]:
            _compare(p.get(k), g.get(k), f"{path}.{k}" if path else k, rep, dtype, case)
        return
    if isinstance(gold, list) or isinstance(pred, list):
        g = gold if isinstance(gold, list) else []
        p = pred if isinstance(pred, list) else []
        for gi, pi in _align(p, g):
            _compare(p[pi] if pi is not None else None, g[gi] if gi is not None else None,
                     f"{path}[]", rep, dtype, case)
        return
    c = Counts()
    gn, pn = _norm(gold), _norm(pred)
    if gn is None and pn is None:
        return
    if gn == pn:
        c.tp = 1
    else:
        if pn is not None:
            c.fp = 1
        if gn is not None:
            c.fn = 1
        rep.errors.append({"case": case, "type": dtype, "field": path, "pred": pred, "gold": gold})
    rep.total.add(c)
    rep.by_type[dtype].add(c)
    rep.by_field[f"{dtype}:{path}"].add(c)


def _align(pred: list[Any], gold: list[Any]) -> list[tuple[int | None, int | None]]:
    """Paruje elementy list zachłannie po liczbie zgodnych liści."""
    def score(a: Any, b: Any) -> int:
        la, lb = _leaves(a) if isinstance(a, (dict, list)) else {"": a}, \
            _leaves(b) if isinstance(b, (dict, list)) else {"": b}
        return sum(1 for k, v in la.items() if v is not None and _norm(v) == _norm(lb.get(k)))

    pairs = sorted(((score(p, g), gi, pi) for gi, g in enumerate(gold) for pi, p in enumerate(pred)),
                   reverse=True)
    used_g: set[int] = set()
    used_p: set[int] = set()
    out: list[tuple[int | None, int | None]] = []
    for _s, gi, pi in pairs:
        if gi in used_g or pi in used_p:
            continue
        used_g.add(gi)
        used_p.add(pi)
        out.append((gi, pi))
    out += [(gi, None) for gi in range(len(gold)) if gi not in used_g]
    out += [(None, pi) for pi in range(len(pred)) if pi not in used_p]
    return out


def evaluate(pred_dir: Path, gold_dir: Path, name_map: dict[str, str]) -> Report:
    """Dla każdego pliku wzorca <sprawa>/<nazwa>.json szuka wyniku <sprawa>/<nazwa wejścia>.json.

    PDF-y z katalogu wzorców bez pliku wzorca (np. dane/negatywne/*.pdf) mają oczekiwany wynik `{}`.
    """
    rep = Report()
    reverse = {v: k for k, v in name_map.items()}
    expected: dict[tuple[str, str], Path | None] = {}
    for gold_path in sorted(gold_dir.glob("*/*.json")):
        expected[(gold_path.parent.name, reverse.get(gold_path.stem, gold_path.stem))] = gold_path
    for pdf in sorted(p for p in gold_dir.glob("*/*") if p.suffix.lower() == ".pdf"):
        expected.setdefault((pdf.parent.name, pdf.stem), None)

    for (case, stem), gold_path in sorted(expected.items()):
        pred_path = pred_dir / case / f"{stem}.json"
        if gold_path is None:
            gold: Any = {}
            dtype = NEGATIVE
            rep.negatives += 1
        else:
            gold = json.loads(gold_path.read_text(encoding="utf-8"))
            dtype = gold_path.stem
        if pred_path.exists():
            text = pred_path.read_text(encoding="utf-8").strip()
            pred = json.loads(text) if text else {}
        else:
            rep.missing_pred.append(str(pred_path))
            pred = {}
        filled = any(v is not None for v in _leaves(pred).values())
        if gold_path is None and filled:
            rep.negatives_classified.append(f"{case}/{stem}")
        elif gold_path is not None and not filled:
            rep.positives_empty.append(f"{case}/{stem}")
        _compare(pred, gold, "", rep, dtype, case)
    return rep


def format_report(rep: Report, worst: int = 25) -> str:
    lines = [f"F1 = {rep.total.f1:.4f}  (P = {rep.total.precision:.4f}, R = {rep.total.recall:.4f}, "
             f"TP {rep.total.tp}, FP {rep.total.fp}, FN {rep.total.fn})", ""]
    lines.append("Według typu dokumentu:")
    for t, c in sorted(rep.by_type.items()):
        if t == NEGATIVE:
            continue
        lines.append(f"  {t:<16} F1 {c.f1:.4f}  TP {c.tp:>4}  FP {c.fp:>4}  FN {c.fn:>4}")
    if rep.negatives:
        neg = rep.by_type.get(NEGATIVE, Counts())
        lines.append(f"  {NEGATIVE:<16} dokumentów {rep.negatives}, z niepustym wynikiem "
                     f"{len(rep.negatives_classified)} (FP {neg.fp})")
        for n in rep.negatives_classified:
            lines.append(f"    rozpoznany, choć negatywny: {n}")
    if rep.positives_empty:
        lines.append(f"  Dokumenty klas z pustym wynikiem: {len(rep.positives_empty)}")
        for n in rep.positives_empty:
            lines.append(f"    {n}")
    lines.append("")
    lines.append("Według pola (od najgorszego F1):")
    for k, c in sorted(rep.by_field.items(), key=lambda kv: (kv[1].f1, kv[0]))[:worst]:
        lines.append(f"  {c.f1:.3f}  TP {c.tp:>3} FP {c.fp:>3} FN {c.fn:>3}  {k}")
    if rep.missing_pred:
        lines.append("")
        lines.append(f"Brak plików wynikowych: {len(rep.missing_pred)}")
    return "\n".join(lines)
