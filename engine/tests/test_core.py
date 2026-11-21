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


def test_email_and_ocr_fix() -> None:
    from odwolania2json.textutil import fix_ocr_pl

    assert n.email("a,wrobel@wrobel-kancelaria.example") == "a.wrobel@wrobel-kancelaria.example"
    assert n.email(" jan.kowalski @ firma.pl ") == "jan.kowalski@firma.pl"
    assert n.email("brak adresu") is None
    assert fix_ocr_pl("PAÑSTWOWEJ ZAMÓWIEÑ") == "PAŃSTWOWEJ ZAMÓWIEŃ"


def test_ocr_tolerant_grounding() -> None:
    ocr = "Kalinex Logistyka Sp. z 0.0. ul. Leśna\nLódź 05.06.2026r.\nnr 2026/BZP 00692455/03opublikowane"
    for value, mode in (("Kalinex Logistyka Sp. z o.o.", "required"), ("Łódź", "tokens"), ("2026/BZP 00692455/03", "tokens")):
        assert not grounded(value, ocr, mode)
        assert grounded(value, ocr, mode, ocr_tolerant=True)
    # wartości spoza tekstu nadal są odrzucane, także krótkie (poniżej 4 znaków po złożeniu)
    assert not grounded("Orbisol Budownictwo", ocr, "tokens", ocr_tolerant=True)
    assert not grounded("Ul", "u1", "tokens", ocr_tolerant=True)


def test_profile_cache_key_ignores_default_ocr_options() -> None:
    from odwolania2json.config import ConversionProfile
    from odwolania2json.convert import _profile_key

    p = ConversionProfile()
    assert "ocr_scale" not in _profile_key(p) and "ocr_model_size" not in _profile_key(p)
    assert "ocr_scale" in _profile_key(p.model_copy(update={"ocr_scale": 4.0}))


def test_candidates_follow_strategy_and_grounding() -> None:
    from odwolania2json.pipeline import Engine
    from odwolania2json.rules import Candidate

    text = "Zamawiający: Orynte Konsulting sp. k."
    rule = Candidate("Orynte Konsulting sp. k.", 0, 10, 0, "")
    f = FieldDef(path="Z.nazwa", group="g", strategy="llm_first", grounding="tokens")
    # LLM pierwszy, reguła jako zapas (do niej sięga potok, gdy walidator odrzuci wartość z LLM)
    assert Engine._candidates(f, rule, "Orynte Konsulting", text)[0] == [
        ("llm", "Orynte Konsulting"), ("rules", "Orynte Konsulting sp. k.")]
    # wartości z LLM, której nie ma w tekście, nie ma wśród kandydatów
    cands, warn = Engine._candidates(f, rule, "Prezes KIO", text)
    assert cands == [("rules", "Orynte Konsulting sp. k.")] and warn


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


def test_evaluate_input_names_and_nested_dirs(tmp_path: Path) -> None:
    # Wynik ma nazwę PDF-a: potwierdzenie_przelewu.pdf albo (po zmianie u organizatora) przelew.pdf.
    # Wzorce mogą leżeć głębiej (dane/skany/<rodzaj>/<nr>/) i mieć dowolne nazwy.
    gold, pred = tmp_path / "gold", tmp_path / "pred"
    przelew = {"przelew_bankowy": {"kwota": 100}}
    for case, pdf in (("stara", "potwierdzenie_przelewu"), ("nowa", "przelew"), ("skany/przelewy/0001", "0001")):
        (gold / case).mkdir(parents=True)
        (pred / case).mkdir(parents=True)
        (gold / case / f"{pdf}.pdf").write_bytes(b"%PDF")
        (gold / case / ("0001.json" if pdf == "0001" else "przelew.json")).write_text(json.dumps(przelew))
        (pred / case / f"{pdf}.json").write_text(json.dumps(przelew))
    rep = evaluate(pred, gold, {"potwierdzenie_przelewu": "przelew"})
    assert (rep.total.tp, rep.total.fp, rep.total.fn) == (3, 0, 0)
    assert rep.negatives == 0 and rep.missing_pred == []
    assert set(rep.by_type) == {"przelew"}


def test_dotenv_bom_and_key_source(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    from odwolania2json import llm
    from odwolania2json.config import LlmProfile

    monkeypatch.setattr(llm, "DOTENV_KEYS", {})
    monkeypatch.delenv("O2J_TEST_KEY", raising=False)
    monkeypatch.delenv("LLM_API_KEY", raising=False)
    env = tmp_path / ".env"
    # Notatnik ze znacznikiem BOM i końcami linii CRLF, klucz w pierwszej linii
    env.write_bytes("O2J_TEST_KEY= abc123 \r\n".encode("utf-8-sig"))
    llm.load_dotenv(env)
    prof = LlmProfile(base_url="http://localhost", model="m", api_key_env="O2J_TEST_KEY")
    src = llm.LlmClient(prof, None).key_source()
    assert "z pliku" in src and "liczba znaków: 6" in src and "abc123" not in src

    # zmienna ustawiona w systemie ma pierwszeństwo przed .env i log to mówi
    monkeypatch.setattr(llm, "DOTENV_KEYS", {})
    monkeypatch.setenv("O2J_TEST_KEY", "inny-klucz")
    llm.load_dotenv(env)
    assert "zmiennej środowiskowej systemu" in llm.LlmClient(prof, None).key_source()


def test_rejected_key_stops_further_calls(monkeypatch: pytest.MonkeyPatch) -> None:
    import httpx

    from odwolania2json import llm
    from odwolania2json.config import LlmProfile

    monkeypatch.setenv("O2J_TEST_KEY", "zly")
    calls = []

    def handler(req: httpx.Request) -> httpx.Response:
        calls.append(req)
        return httpx.Response(401, json={"detail": "Invalid token"})

    c = llm.LlmClient(LlmProfile(base_url="http://localhost", model="m", api_key_env="O2J_TEST_KEY"), None)
    c._http = httpx.Client(transport=httpx.MockTransport(handler))
    for text in ("a", "b"):
        with pytest.raises(llm.LlmError, match="odrzuciło klucz"):
            c.extract("", text, {"type": "object"}, "t")
    assert len(calls) == 1


@pytest.mark.parametrize("data,enc", [
    ("EDEN_AI_API_KEY=abc\n".encode("utf-16"), "UTF-16"),  # PowerShell 5: echo ... > .env
    ("# zażółć\nEDEN_AI_API_KEY=abc\n".encode("cp1250"), "ANSI (cp1250)"),
    ("EDEN_AI_API_KEY=abc\n".encode("utf-8-sig"), "UTF-8 z BOM"),
])
def test_read_env_text_windows_encodings(tmp_path: Path, data: bytes, enc: str) -> None:
    from odwolania2json.llm import read_env_text

    p = tmp_path / ".env"
    p.write_bytes(data)
    text, found = read_env_text(p)
    assert found == enc and "EDEN_AI_API_KEY=abc" in text


def test_doctor_key_problems() -> None:
    from odwolania2json.doctor import ERR, describe_key, key_problems

    assert not [s for s, _ in key_problems(' "abc-123_x" ') if s == ERR]
    assert [s for s, _ in key_problems("abc​def") if s == ERR]
    assert [s for s, _ in key_problems("abc # komentarz") if s == ERR]
    assert [s for s, _ in key_problems("twoj_klucz") if s == ERR]
    assert "abc" not in describe_key("abc-123")


def test_doctor_report_without_secrets(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    from odwolania2json.cli import REPO_DIR
    from odwolania2json.doctor import run

    monkeypatch.setenv("EDEN_AI_API_KEY", "tajny-klucz-123")
    report = tmp_path / "diagnoza.txt"
    run(REPO_DIR, report, api=False, convert=False)
    text = report.read_text(encoding="utf-8")
    assert "== Plik .env i klucz API ==" in text and "Podsumowanie" in text
    assert "tajny-klucz-123" not in text
