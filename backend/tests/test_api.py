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


def test_draft(client, files):
    draft = client.get("/api/config/draft").json()
    assert draft["version"] == "draft"
    assert [d["code"] for d in draft["document_types"]] == ["odwolanie", "pelnomocnictwo", "przelew"]

    (files.seed_dir / "release.yaml").write_text("settings: {nieznane_pole: 1}\n", encoding="utf-8")
    assert client.get("/api/config/draft").status_code == 409


def test_llm_providers(client):
    providers = client.get("/api/llm-providers").json()
    assert {p["code"] for p in providers} >= {"ovhcloud"}
    assert all(p["base_url"].startswith("https://") for p in providers)
