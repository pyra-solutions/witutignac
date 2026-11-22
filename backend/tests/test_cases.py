"""Sprawy z GUI: wgrywanie, wyniki, poprawki, ZIP z wynikami i dziennik (bez uruchamiania Docling)."""

import io
import json
import zipfile

import pytest
from fastapi.testclient import TestClient

from o2j_backend.api import app
from o2j_backend.cases import DocStatus, safe_pdf_name

PDF = b"%PDF-1.4\n% testowy\n"

RESULT = {
    "OdwolanieKIO": {"data": "2026-03-02", "miejscowosc": "Warszawa", "czynnosc_dzien": None,
                     "czynnosc_powod_id": 1, "czynnosc_opis": "Decyzja o odrzuceniu oferty"},
    "Odwolujacy": [{"nazwa": "Firma sp. z o.o.", "krs": None, "nip": "1234567890", "regon": None,
                    "przez-pelnomocnika": 0, "pelnomocnik": {"imie_nazwisko": None, "nazwa": None, "mail": None}}],
}


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def _zip(entries: dict[str, bytes]) -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        for name, data in entries.items():
            zf.writestr(name, data)
    return buf.getvalue()


def _upload(client, *files, name="Sprawa testowa"):
    return client.post("/api/cases", data={"name": name}, files=[("files", f) for f in files])


def _finish(store, case_id, doc_id, result, doc_type="odwolanie"):
    """Udaje zakończone przetwarzanie: plik wyniku i status jak po pracy silnika."""
    doc = store.get(case_id).document(doc_id)
    store.write_file(store.output_path(case_id, doc), json.dumps(result, ensure_ascii=False))
    store.update_document(case_id, doc_id, status=DocStatus.DONE, doc_type=doc_type)


def test_safe_pdf_name():
    assert safe_pdf_name("../../etc/passwd") == "passwd.pdf"
    assert safe_pdf_name("C:\\dane\\odwołanie nr 1.PDF") == "odwołanie nr 1.PDF"
    assert safe_pdf_name("con.pdf") == "_con.pdf"
    assert safe_pdf_name('a:b?.pdf') == "a_b_.pdf"
    assert safe_pdf_name("...") == "dokument.pdf"


def test_upload_pdfs_and_zip(client, gui_state):
    store, processor = gui_state
    archive = _zip({"sprawa/pelnomocnictwo.pdf": PDF, "sprawa/notatka.txt": b"x", "__MACOSX/._a.pdf": b"x"})
    r = _upload(
        client,
        ("odwolanie.pdf", PDF, "application/pdf"),
        ("Odwolanie.pdf", PDF, "application/pdf"),
        ("obraz.pdf", b"GIF89a", "application/pdf"),
        ("sprawa.zip", archive, "application/zip"),
    )
    assert r.status_code == 201, r.text
    body = r.json()
    case = body["case"]
    assert case["name"] == "Sprawa testowa"
    assert [d["file_name"] for d in case["documents"]] == ["odwolanie.pdf", "Odwolanie (2).pdf", "pelnomocnictwo.pdf"]
    assert all(d["status"] == "queued" for d in case["documents"])
    assert any("obraz.pdf" in m for m in body["rejected"])
    assert any("notatka.txt" in m for m in body["rejected"])
    assert len(processor.queued) == 3
    assert (store.case_dir(case["id"]) / "input" / "pelnomocnictwo.pdf").read_bytes() == PDF


def test_upload_without_pdf(client):
    r = _upload(client, ("notatka.txt", b"tekst", "text/plain"))
    assert r.status_code == 422
    assert r.json()["detail"]["rejected"]


def test_results_review_and_zip(client, gui_state):
    store, _ = gui_state
    case_id = _upload(client, ("odwolanie.pdf", PDF, "application/pdf")).json()["case"]["id"]
    assert client.get(f"/api/cases/{case_id}/documents/odwolanie/trace").status_code == 404
    _finish(store, case_id, "odwolanie", RESULT)

    doc = client.get(f"/api/cases/{case_id}").json()["documents"][0]
    assert doc["result"]["Odwolujacy"][0]["nip"] == "1234567890"
    assert doc["review"] is None
    assert "Odwolujacy[0].nip" in doc["validation"]  # zła suma kontrolna NIP

    corrected = json.loads(json.dumps(RESULT))
    corrected["Odwolujacy"][0]["nip"] = "5260250995"
    r = client.put(f"/api/cases/{case_id}/documents/odwolanie/review", json={"result": corrected, "approved": True})
    assert r.status_code == 200, r.text
    doc = r.json()
    assert doc["review"]["Odwolujacy"][0]["nip"] == "5260250995"
    assert doc["result"]["Odwolujacy"][0]["nip"] == "1234567890"  # wynik silnika zostaje
    assert "Odwolujacy[0].nip" not in doc["validation"]
    assert doc["approved_at"] is not None

    r = client.get(f"/api/cases/{case_id}/results.zip")
    with zipfile.ZipFile(io.BytesIO(r.content)) as zf:
        assert zf.namelist() == [f"{case_id}/odwolanie.json"]
        assert json.loads(zf.read(f"{case_id}/odwolanie.json"))["Odwolujacy"][0]["nip"] == "5260250995"

    events = [e["event"] for e in client.get("/api/audit").json()]
    assert events[:3] == ["dokument_zatwierdzony", "dokument_poprawiony", "sprawa_utworzona"]
    poprawka = next(e for e in client.get("/api/audit").json() if e["event"] == "dokument_poprawiony")
    assert poprawka["fields"] == ["Odwolujacy[0].nip"]

    doc = client.delete(f"/api/cases/{case_id}/documents/odwolanie/review").json()
    assert doc["review"] is None and doc["approved_at"] is None


def test_review_requires_processed_document(client):
    case_id = _upload(client, ("odwolanie.pdf", PDF, "application/pdf")).json()["case"]["id"]
    r = client.put(f"/api/cases/{case_id}/documents/odwolanie/review", json={"result": RESULT})
    assert r.status_code == 409


def test_delete_and_reprocess(client, gui_state):
    store, processor = gui_state
    case_id = _upload(client, ("odwolanie.pdf", PDF, "application/pdf")).json()["case"]["id"]
    assert client.delete(f"/api/cases/{case_id}").status_code == 409  # w kolejce
    assert client.post(f"/api/cases/{case_id}/reprocess").status_code == 409
    _finish(store, case_id, "odwolanie", RESULT)

    r = client.post(f"/api/cases/{case_id}/reprocess")
    assert r.status_code == 200
    assert r.json()["documents"][0]["status"] == "queued"
    assert processor.queued[-1] == (case_id, "odwolanie")

    _finish(store, case_id, "odwolanie", RESULT)
    assert client.delete(f"/api/cases/{case_id}").status_code == 204
    assert client.get(f"/api/cases/{case_id}").status_code == 404
    assert not store.case_dir(case_id).exists()


def test_not_found(client):
    assert client.get("/api/cases/..%2F..%2Fetc").status_code == 404
    assert client.get("/api/cases/20260101-000000-abcd").status_code == 404
    case_id = _upload(client, ("odwolanie.pdf", PDF, "application/pdf")).json()["case"]["id"]
    assert client.get(f"/api/cases/{case_id}/documents/nie-ma/pdf").status_code == 404
    assert client.get(f"/api/cases/{case_id}/documents/odwolanie/pdf").content == PDF


def test_config_endpoints(client, monkeypatch):
    monkeypatch.setenv("EDEN_AI_API_KEY", "sekretny-klucz-123")
    active = client.get("/api/config/active").json()
    assert [d["code"] for d in active["snapshot"]["document_types"]] == ["odwolanie", "pelnomocnictwo", "przelew"]

    system = client.get("/api/system")
    assert system.status_code == 200
    assert system.json()["release"] == active["snapshot"]["version"]
    assert "sekretny-klucz-123" not in system.text

    schemas = client.get("/api/document-types/odwolanie/llm-schemas").json()
    assert schemas and all(s["schema"]["type"] == "object" for s in schemas)
    assert "code: odwolanie" in client.get("/api/document-types/odwolanie/source").text
    assert client.get("/api/document-types/nie-ma/llm-schemas").status_code == 404

    models = client.get("/api/llm-models").json()
    assert {m["model"] for m in models} >= {"flexai/Qwen3.5-9B"}
