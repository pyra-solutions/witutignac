"""Rozszerzalność: nowy typ dokumentu to jeden plik YAML, bez zmian w kodzie silnika.

Przykładowy czwarty typ (zgłoszenie przystąpienia do postępowania odwoławczego) leży w
`config/examples/document_types/przystapienie.yaml`, poza `config/seed`, więc nie zmienia wydania silnika.
Testy dokładają go do kopii `config/seed`, tak jak zrobiłby to administrator, i sprawdzają całą ścieżkę
bez Doclinga i LLM: walidację konfiguracji, `release.json`, klasyfikację, reguły, normalizatory, walidatory,
pole wyliczane, kształt wyniku i schemat JSON wysyłany do LLM.
"""

import json
import shutil
from pathlib import Path

import pytest

from odwolania2json.assemble import build_tree, json_schema
from odwolania2json.cli import DEFAULT_SEED, REPO_DIR, _check
from odwolania2json.config import Release, build_from_seed, load_release
from odwolania2json.convert import Converted
from odwolania2json.pipeline import Engine
from odwolania2json.rules import classify

EXAMPLE = REPO_DIR / "config" / "examples" / "document_types" / "przystapienie.yaml"

# Syntetyczne pismo; NIP 999-123-45-76 ma poprawną sumę kontrolną.
PRZYSTAPIENIE = (
    "Warszawa, dnia 12.03.2026 r.\n\n"
    "Prezes Krajowej Izby Odwoławczej\n"
    "ul. Postępu 17a, 02-676 Warszawa\n\n"
    "Sygnatura sprawy: KIO 1234/26\n\n"
    "Przystępujący:\n"
    "Betonex Sp. z o.o.\n"
    "ul. Polna 5, 20-950 Lublin\n"
    "NIP: 999-123-45-76, KRS: 0000123456\n\n"
    "Odwołujący:\n"
    "Alfa Budowa S.A.\n"
    "NIP: 9990264287, KRS: 0000999999\n\n"
    "Zamawiający:\n"
    "Gmina Beta\n\n"
    "ZGŁOSZENIE PRZYSTĄPIENIA DO POSTĘPOWANIA ODWOŁAWCZEGO\n\n"
    "Działając w imieniu Przystępującego, na podstawie art. 525 ust. 1 ustawy Prawo zamówień publicznych, "
    "zgłaszam przystąpienie do postępowania odwoławczego po stronie Zamawiającego. Przystępujący ma interes "
    "w rozstrzygnięciu odwołania na korzyść Zamawiającego, ponieważ jego oferta została wybrana jako najkorzystniejsza.\n"
)

ODWOLANIE = (
    "Warszawa, dnia 10.03.2026 r.\n\n"
    "Prezes Krajowej Izby Odwoławczej\n\n"
    "Odwołujący:\nAlfa Budowa S.A.\nNIP: 9990264287\n\n"
    "Zamawiający:\nGmina Beta\n\n"
    "ODWOŁANIE\n\n"
    "W imieniu Odwołującego wnoszę odwołanie od czynności Zamawiającego polegającej na wyborze oferty "
    "wykonawcy Betonex Sp. z o.o.\n\nZarzut nr 1\n"
)


@pytest.fixture(scope="module")
def seed_release() -> Release:
    return build_from_seed(DEFAULT_SEED)


@pytest.fixture(scope="module")
def release(tmp_path_factory: pytest.TempPathFactory) -> Release:
    """Kopia config/seed z dołożonym plikiem przykładowego typu: jedyna zmiana to nowy plik YAML."""
    seed = tmp_path_factory.mktemp("rozszerzalnosc") / "seed"
    shutil.copytree(DEFAULT_SEED, seed)
    shutil.copy(EXAMPLE, seed / "document_types" / EXAMPLE.name)
    return build_from_seed(seed)


def test_new_type_is_one_yaml_file(release: Release, seed_release: Release, tmp_path: Path) -> None:
    seed_codes = {d.code for d in seed_release.document_types}
    assert "przystapienie" not in seed_codes  # przykład nie wchodzi do wydania silnika
    assert {d.code for d in release.document_types} == seed_codes | {"przystapienie"}

    _check(release)  # te same sprawdzenia co validate-config (wtyczki, regexy, sekcje, grupy); SystemExit przy błędzie

    # release.json, który czyta run.sh, przyjmuje nowy typ bez zmian w kodzie
    path = tmp_path / "release.json"
    path.write_text(json.dumps(release.model_dump(mode="json"), ensure_ascii=False), encoding="utf-8")
    assert load_release(path).fingerprint() == release.fingerprint()


def test_classification_new_type_and_existing_types(release: Release) -> None:
    code, scores = classify(PRZYSTAPIENIE, "dowolna_nazwa", release)
    assert code == "przystapienie"
    # przystąpienie ma też cechy odwołania ("Odwołujący:", "Zamawiający:", Prezes KIO), ale wygrywa wyraźnie
    assert scores["przystapienie"] > scores["odwolanie"] + 2

    code, scores = classify(ODWOLANIE, "dowolna_nazwa", release)
    assert code == "odwolanie"  # nowy typ nie przejmuje dokumentów istniejących typów
    dt = next(d for d in release.document_types if d.code == "przystapienie")
    assert scores["przystapienie"] < dt.classification.min_score


def test_extraction_without_docling_and_llm(release: Release) -> None:
    eng = Engine(release, None, use_llm=False)
    pdf = Path("przystapienie_przyklad.pdf")
    prep = eng.prepare(pdf, pdf, conv=Converted(markdown=PRZYSTAPIENIE, pages=1, sha256="test"))
    assert prep.errors == []
    eng.run_llm(prep)  # bez LLM: grupy są pomijane, zostają reguły
    out, trace = eng.finalize(prep)

    assert trace["doc_type"] == "przystapienie"
    assert out == {
        "PrzystapienieKIO": {
            "sygnatura": "KIO 1234/26",
            "data": "2026-03-12",
            "miejscowosc": "Warszawa",
            "po_stronie": "zamawiajacy",  # map_values + enum: wartość kanoniczna zamiast "Zamawiającego"
            "konsorcjum": False,  # pole wyliczane: jeden przystępujący
        },
        # sekcja "przystepujacy": NIP i KRS Odwołującego (9990264287, 0000999999) nie są brane
        "Przystepujacy": [{"nazwa": "Betonex Sp. z o.o.", "nip": "9991234576", "krs": "0000123456"}],
    }
    assert list(out) == ["PrzystapienieKIO", "Przystepujacy"]  # kolejność kluczy jak kolejność pól w YAML
    assert trace["fields"]["Przystepujacy[0].nip"]["source"] == "rules"
    assert trace["fields"]["Przystepujacy[0].nip"]["warnings"] == []  # walidatory pattern i nip przechodzą
    assert trace["fields"]["PrzystapienieKIO.konsorcjum"]["source"] == "derived"


def test_llm_schema_generated_from_config(release: Release) -> None:
    dt = next(d for d in release.document_types if d.code == "przystapienie")
    fields = [f for f in dt.fields if f.group == "przystapienie" and not f.derive]
    props = json_schema(build_tree(fields), dt.lists)["properties"]

    assert set(props) == {"PrzystapienieKIO", "Przystepujacy"}
    assert set(props["PrzystapienieKIO"]["properties"]) == {"sygnatura", "data", "miejscowosc", "po_stronie"}
    assert props["PrzystapienieKIO"]["properties"]["po_stronie"]["enum"] == ["zamawiajacy", "odwolujacy", None]
    assert props["Przystepujacy"]["type"] == "array"
    assert set(props["Przystepujacy"]["items"]["properties"]) == {"nazwa", "nip", "krs"}
