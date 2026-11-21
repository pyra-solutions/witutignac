"""Testy jednostkowe części niezależnych od Docling i LLM."""

import json
from pathlib import Path

import pytest

from odwolania2json import normalizers as n
from odwolania2json import validators as v
from odwolania2json.assemble import assemble, build_tree, flatten, json_schema
from odwolania2json.config import FieldDef, ListDef, Section
from odwolania2json.evaluate import evaluate
from odwolania2json.textutil import find_section, grounded


@pytest.mark.parametrize("raw,iso", [
    ("13.10.2025", "2025-10-13"),
    ("Pruszków, dnia 2 marca 2026 roku", "2026-03-02"),
    ("2026-03-21", "2026-03-21"),
    ("21 września 2026", "2026-09-21"),
    ("31.02.2026", None),
])
def test_date_iso(raw: str, iso: str | None) -> None:
    assert n.date_iso(raw) == iso


@pytest.mark.parametrize("raw,out", [
    ("2026/S086-999073", "999073-2026"),
    ("2025/S 123-456789", "456789-2025"),
    ("999137-2026", "999137-2026"),
    ("brak", None),
])
def test_ted(raw: str, out: str | None) -> None:
    assert n.ted_number(raw) == out


def test_bzp_and_amount_and_iban() -> None:
    assert n.bzp_number("2026/BZP 00999778") == "2026/BZP00999778"
    assert n.bzp_number("2026/BZP00999778/01") == "2026/BZP00999778/01"
    assert n.amount_decimal("10 000,00 zł") == 10000.0
    assert n.amount_decimal("1.234,56 PLN") == 1234.56
    assert n.amount_decimal("17.00 PLN") == 17.0
    assert n.iban_digits("PL66 2111 8080 1009 8828 5708 1733") == "66211180801009882857081733"


def test_remove_prefix_and_strip() -> None:
    assert n.remove_prefix("r. pr. Jan Kowalski", [r"r\.\s*pr\.", r"adw\."]) == "Jan Kowalski"
    assert n.strip_punct(" ZP.447.2026, ") == "ZP.447.2026"
    assert n.strip_quotes('„Dostawa”') == "Dostawa"


def test_validators() -> None:
    assert v.nip("5540240549") is None
    assert v.nip("5540240548") is not None
    assert v.regon("000279077") is None
    assert v.pesel("44051401359") is None
    assert v.pesel("44051401358") is not None
    assert v.krs("12345") is not None


def _fields() -> list[FieldDef]:
    return [
        FieldDef(path="A.x"),
        FieldDef(path="L[].a"),
        FieldDef(path="L[].b.c", type="integer"),
        FieldDef(path="M[].n[].p"),
    ]


def test_assemble_keeps_order_and_min_items() -> None:
    tree = build_tree(_fields())
    out = assemble(tree, {"L[1].a": "q", "M[0].n[0].p": "z"}, [ListDef(path="L", min_items=1)])
    assert list(out) == ["A", "L", "M"]
    assert out["A"] == {"x": None}
    assert out["L"] == [{"a": None, "b": {"c": None}}, {"a": "q", "b": {"c": None}}]
    assert out["M"] == [{"n": [{"p": "z"}]}]


def test_flatten_roundtrip_and_schema() -> None:
    tree = build_tree(_fields())
    obj = {"A": {"x": "1"}, "L": [{"a": "k", "b": {"c": 2}}], "M": [{"n": [{"p": "u"}, {"p": "w"}]}]}
    flat = flatten(tree, obj)
    assert flat["M[0].n[1].p"] == "w"
    assert assemble(tree, flat, []) == obj
    schema = json_schema(tree, [])
    assert schema["properties"]["L"]["type"] == "array"
    assert schema["properties"]["L"]["items"]["properties"]["b"]["properties"]["c"]["type"] == ["integer", "null"]


def test_find_section() -> None:
    text = "Odwołujący: Firma A KRS: 1\nZamawiający: Urząd B KRS: 2\ndotyczy: x"
    secs = {"o": Section(name="o", start=[r"Odwołując\w*\s*:"], end=[r"Zamawiając\w*\s*:"])}
    span = find_section(text, secs["o"], secs)
    assert span is not None and "Urząd" not in span.slice(text)


def test_grounding_modes() -> None:
    text = "pełnomocnictwa dla Aleksandry Marciniak, numer TED 2026/S086-999073"
    assert grounded("Aleksandra Marciniak", text, "token_prefix")
    assert grounded("999073-2026", text, "tokens")
    assert not grounded("Jan Nowak", text, "required")


def test_evaluate_counts(tmp_path: Path) -> None:
    gold = tmp_path / "gold" / "c1"
    pred = tmp_path / "pred" / "c1"
    gold.mkdir(parents=True)
    pred.mkdir(parents=True)
    (gold / "doc.json").write_text(json.dumps({"a": "X", "b": None, "l": [{"n": "P"}, {"n": "Q"}]}))
    (pred / "doc.json").write_text(json.dumps({"a": "x ", "b": "extra", "l": [{"n": "Q"}]}))
    rep = evaluate(tmp_path / "pred", tmp_path / "gold", {})
    assert (rep.total.tp, rep.total.fp, rep.total.fn) == (2, 1, 1)


def test_evaluate_negative_documents(tmp_path: Path) -> None:
    # PDF bez pliku wzorca to dokument negatywny: oczekiwany wynik {}, wypełnione pola to FP.
    gold = tmp_path / "gold" / "c1"
    pred = tmp_path / "pred" / "c1"
    gold.mkdir(parents=True)
    pred.mkdir(parents=True)
    for name in ("odwolanie", "obcy", "obcy2"):
        (gold / f"{name}.pdf").write_bytes(b"%PDF")
    (gold / "odwolanie.json").write_text(json.dumps({"a": "X"}))
    (pred / "odwolanie.json").write_text(json.dumps({"a": "X"}))
    (pred / "obcy.json").write_text("{}")
    (pred / "obcy2.json").write_text(json.dumps({"a": "Y", "b": None}))
    rep = evaluate(tmp_path / "pred", tmp_path / "gold", {})
    assert (rep.total.tp, rep.total.fp, rep.total.fn) == (1, 1, 0)
    assert rep.negatives == 2
    assert rep.negatives_classified == ["c1/obcy2"]
    assert rep.positives_empty == []
