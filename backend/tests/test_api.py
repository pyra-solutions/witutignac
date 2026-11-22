import pytest
from fastapi.testclient import TestClient

from o2j_backend.api import app, get_files
from o2j_backend.releases import publish


@pytest.fixture
def client(files):
    app.dependency_overrides[get_files] = lambda: files
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_no_releases(client):
    assert client.get("/api/releases").json() == []
    assert client.get("/api/releases/active").status_code == 404


def test_releases(client, files):
    publish(files, "v1", summary="pierwsze", author="test")
    publish(files, "v2", summary="drugie", author="test", activate=False)

    listed = client.get("/api/releases").json()
    assert {r["version"]: (r["status"], r["summary"]) for r in listed} == {
        "v1": ("active", "pierwsze"),
        "v2": ("inactive", "drugie"),
    }
    assert "snapshot" not in listed[0]

    active = client.get("/api/releases/active").json()
    assert active["snapshot"]["version"] == "v1"
    assert client.get("/api/releases/v1").json()["sha256"] == active["sha256"]
    assert client.get("/api/releases/v2").json()["status"] == "inactive"
    assert client.get("/api/releases/nie-ma").status_code == 404
    assert client.get("/api/releases/.ukryte").status_code == 422


def test_publish_and_activate(client, files, gui_state):
    store, _ = gui_state
    r = client.post("/api/releases", json={"version": "v1", "summary": "z GUI", "author": "test"})
    assert r.status_code == 201
    assert (r.json()["version"], r.json()["status"], r.json()["author"]) == ("v1", "active", "test")
    assert files.active_file.is_file()

    r = client.post("/api/releases", json={"version": "v2", "activate": False})
    assert r.status_code == 201
    assert r.json()["status"] == "inactive"
    assert client.get("/api/releases/active").json()["version"] == "v1"

    assert client.post("/api/releases", json={"version": "v1"}).status_code == 409  # wydania są niezmienne
    assert client.post("/api/releases", json={"version": ".ukryte"}).status_code == 422

    r = client.post("/api/releases/v2/activate")
    assert r.status_code == 200
    assert client.get("/api/releases/active").json()["version"] == "v2"
    assert client.post("/api/releases/nie-ma/activate").status_code == 404

    events = [(e["event"], e.get("release")) for e in store.audit_entries()]
    assert events == [
        ("wydanie_aktywowane", "v2"),
        ("wydanie_opublikowane", "v2"),
        ("wydanie_aktywowane", "v1"),
        ("wydanie_opublikowane", "v1"),
    ]

    (files.seed_dir / "release.yaml").write_text("settings: {nieznane_pole: 1}\n", encoding="utf-8")
    assert client.post("/api/releases", json={"version": "v3"}).status_code == 409


def test_publish_runs_engine_checks(client, files):
    """Publikacja sprawdza konfigurację jak validate-config, nie tylko model Pydantic."""
    path = files.seed_dir / "document_types" / "przelew.yaml"
    text = path.read_text(encoding="utf-8")
    path.write_text(text.replace("{name: date_iso}", "{name: nie_ma_takiego}", 1), encoding="utf-8")
    r = client.post("/api/releases", json={"version": "v1"})
    assert r.status_code == 409
    assert "nieznany normalizator nie_ma_takiego" in r.json()["detail"]
    assert client.get("/api/config/draft").status_code == 409
    assert not files.active_file.exists()
    assert not (files.releases_dir / "v1.json").exists()

    path.write_text(text.replace("pattern: 'PRZELEW'", "pattern: 'PRZELEW('", 1), encoding="utf-8")
    r = client.post("/api/releases", json={"version": "v1"})
    assert r.status_code == 409
    assert "niepoprawny regex" in r.json()["detail"]


def test_draft(client, files):
    draft = client.get("/api/config/draft").json()
    assert draft["version"] == "draft"
    assert [d["code"] for d in draft["document_types"]] == ["odwolanie", "pelnomocnictwo", "przelew"]

    (files.seed_dir / "release.yaml").write_text("settings: {nieznane_pole: 1}\n", encoding="utf-8")
    assert client.get("/api/config/draft").status_code == 409


def test_llm_providers(client):
    providers = client.get("/api/llm-providers").json()
    assert {p["code"] for p in providers} >= {"edenai"}
    assert all(p["base_url"].startswith("https://") for p in providers)
