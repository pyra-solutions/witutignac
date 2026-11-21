import pytest
from fastapi.testclient import TestClient

from o2j_backend import REPO_ROOT
from o2j_backend.api import app, get_session
from o2j_backend.config_store import import_release, load_seed
from o2j_backend.releases import publish


@pytest.fixture
def client(session):
    app.dependency_overrides[get_session] = lambda: session
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok", "database": "ok"}


def test_empty_database(client):
    assert client.get("/api/releases").json() == []
    assert client.get("/api/releases/active").status_code == 404
    assert client.get("/api/config/draft").status_code == 409


def test_releases_and_draft(client, session):
    release, providers = load_seed(REPO_ROOT / "config" / "seed")
    import_release(session, release, providers)
    publish(session, "v1", summary="pierwsze")

    listed = client.get("/api/releases").json()
    assert [(r["version"], r["status"], r["summary"]) for r in listed] == [("v1", "active", "pierwsze")]

    active = client.get("/api/releases/active").json()
    assert active["snapshot"]["version"] == "v1"
    assert client.get("/api/releases/v1").json()["sha256"] == active["sha256"]
    assert client.get("/api/releases/nie-ma").status_code == 404

    draft = client.get("/api/config/draft").json()
    assert draft["version"] == "draft"
    assert [d["code"] for d in draft["document_types"]] == ["odwolanie", "pelnomocnictwo", "przelew"]
