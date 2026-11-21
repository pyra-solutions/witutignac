import json

import pytest
from sqlalchemy import func, select, update
from sqlalchemy.exc import IntegrityError

from odwolania2json import config as ec
from o2j_backend import REPO_ROOT
from o2j_backend import config_store as cs
from o2j_backend import models as m
from o2j_backend.releases import ReleaseError, activate_release, active_release, publish, release_file_text

SEED_DIR = REPO_ROOT / "config" / "seed"


def engine_file_text(release: ec.Release) -> str:
    """Plik jak z `odwolania2json build-release`, z listami wyszukiwanymi po kluczu w kolejności bazy."""
    data = release.model_dump(mode="json")
    for name, key in cs._UNORDERED.items():
        data[name] = sorted(data[name], key=lambda x: x[key])
    return json.dumps(data, ensure_ascii=False, indent=2) + "\n"


def count(session, model) -> int:
    return session.scalar(select(func.count()).select_from(model))


@pytest.fixture
def seeded(session) -> ec.Release:
    release, providers = cs.load_seed(SEED_DIR)
    cs.import_release(session, release, providers)
    return release


def test_export_reproduces_seed(session, seeded):
    assert cs.comparable(cs.export_release(session, seeded.version)) == cs.comparable(seeded)


def test_published_snapshot_is_byte_identical_to_engine_build(session, seeded):
    r = publish(session, seeded.version, author="test")
    session.expire_all()  # odczyt snapshotu z bazy, nie z pamięci
    stored = session.get(m.ConfigRelease, r.id)
    assert release_file_text(stored.snapshot) == engine_file_text(seeded)
    assert stored.status == m.ReleaseStatus.ACTIVE


def test_reimport_is_idempotent(session, seeded):
    tables = [m.DocumentType, m.FieldDefinition, m.ExtractionGroup, m.DictionaryEntry, m.LlmProfile, m.LlmProvider]
    before = {t.__tablename__: count(session, t) for t in tables}
    release, providers = cs.load_seed(SEED_DIR)
    cs.import_release(session, release, providers)
    assert {t.__tablename__: count(session, t) for t in tables} == before


def test_reimport_applies_changes_and_removes_missing(session, seeded):
    data = seeded.model_dump(mode="json")
    data["document_types"] = [d for d in data["document_types"] if d["code"] != "przelew"]
    data["document_types"][0]["fields"][0]["instruction"] = "Nowa instrukcja"
    data["llm_profiles"] = [p for p in data["llm_profiles"] if p["id"] == "default"]
    changed = ec.Release.model_validate(data)

    cs.import_release(session, changed)

    assert cs.comparable(cs.export_release(session, changed.version)) == cs.comparable(changed)
    assert session.scalars(select(m.DocumentType.code).order_by(m.DocumentType.position)).all() == [
        "odwolanie",
        "pelnomocnictwo",
    ]
    # Dostawca Gemini nie jest już używany ani opisany w metadanych, więc znika.
    assert session.scalars(select(m.LlmProvider.code)).all() == ["ovhcloud"]


def test_unknown_group_is_rejected(session, seeded):
    data = seeded.model_dump(mode="json")
    data["document_types"][0]["fields"][0]["group"] = "nie_ma_takiej"
    with pytest.raises(cs.ConfigStoreError, match="nie_ma_takiej"):
        cs.import_release(session, ec.Release.model_validate(data))


def test_engine_field_without_column_is_reported(session, monkeypatch):
    # Symulacja: silnik dostał pole, którego baza nie zna.
    monkeypatch.setitem(cs._MAPS, ec.ListDef, cs._Map(renames={"instruction": "instrukcja_bez_kolumny"}))
    release, providers = cs.load_seed(SEED_DIR)
    with pytest.raises(cs.ConfigStoreError, match="nie ma kolumny"):
        cs.import_release(session, release, providers)


def test_publish_activate_and_rollback(session, seeded):
    v1 = publish(session, "v1")
    publish(session, "v2")
    session.refresh(v1)
    assert active_release(session).version == "v2"
    assert v1.status == m.ReleaseStatus.ARCHIVED

    activate_release(session, "v1")
    assert active_release(session).version == "v1"
    assert session.scalar(
        select(func.count()).where(m.ConfigRelease.status == m.ReleaseStatus.ACTIVE)
    ) == 1

    with pytest.raises(ReleaseError):
        publish(session, "v1")


def test_database_allows_single_active_release(session, seeded):
    publish(session, "v1")
    with pytest.raises(IntegrityError), session.begin_nested():
        session.add(m.ConfigRelease(version="v2", status=m.ReleaseStatus.ACTIVE, snapshot={}, sha256="0" * 64))
        session.flush()


def test_release_content_is_immutable(session, seeded):
    r = publish(session, "v1")
    with pytest.raises(IntegrityError, match="niezmienne"), session.begin_nested():
        session.execute(update(m.ConfigRelease).where(m.ConfigRelease.id == r.id).values(snapshot={"x": 1}))

    # Opis i status wolno zmieniać.
    with session.begin_nested():
        session.execute(update(m.ConfigRelease).where(m.ConfigRelease.id == r.id).values(summary="nowy opis"))
