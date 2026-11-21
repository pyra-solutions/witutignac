import json

import pytest

from odwolania2json.config import build_from_seed, load_release
from o2j_backend.releases import (
    ReleaseError,
    ReleaseStatus,
    activate_release,
    active_release,
    get_release,
    list_releases,
    publish,
    release_file_text,
)


def test_publish_writes_record_and_active_file(files):
    record = publish(files, "v1", summary="pierwsze", author="test")

    stored = json.loads((files.releases_dir / "v1.json").read_text(encoding="utf-8"))
    assert stored["version"] == "v1"
    assert stored["sha256"] == record.sha256
    assert stored["snapshot"]["version"] == "v1"

    # Aktywny plik ma ten sam format co `odwolania2json build-release`.
    expected = build_from_seed(files.seed_dir).model_copy(update={"version": "v1"}).model_dump(mode="json")
    assert files.active_file.read_text(encoding="utf-8") == release_file_text(expected)
    assert load_release(files.active_file).version == "v1"
    assert active_release(files).version == "v1"


def test_releases_are_immutable(files):
    publish(files, "v1", summary="pierwsze")
    before = (files.releases_dir / "v1.json").read_bytes()
    with pytest.raises(ReleaseError, match="już istnieje"):
        publish(files, "v1", summary="drugie")
    assert (files.releases_dir / "v1.json").read_bytes() == before


def test_activate_and_rollback(files):
    publish(files, "v1")
    (files.seed_dir / "release.yaml").write_text(
        (files.seed_dir / "release.yaml").read_text(encoding="utf-8").replace("llm_concurrency: 4", "llm_concurrency: 2"),
        encoding="utf-8",
    )
    publish(files, "v2", activate=False)
    assert {r.version: s for r, s in list_releases(files)} == {"v1": ReleaseStatus.ACTIVE, "v2": ReleaseStatus.INACTIVE}

    activate_release(files, "v2")
    assert load_release(files.active_file).settings.llm_concurrency == 2
    assert active_release(files).version == "v2"

    activate_release(files, "v1")
    assert load_release(files.active_file).settings.llm_concurrency == 4
    assert active_release(files).version == "v1"


def test_unpublished_active_file_has_no_release(files):
    publish(files, "v1")
    files.active_file.write_text(files.active_file.read_text(encoding="utf-8").replace('"v1"', '"lokalna"'))
    assert active_release(files) is None
    assert [s for _, s in list_releases(files)] == [ReleaseStatus.INACTIVE]


def test_tampered_release_is_not_activated(files):
    publish(files, "v1", activate=False)
    path = files.releases_dir / "v1.json"
    path.write_text(path.read_text(encoding="utf-8").replace('"llm_concurrency": 4', '"llm_concurrency": 9'))
    with pytest.raises(ReleaseError, match="SHA-256"):
        activate_release(files, "v1")
    assert not files.active_file.exists()


@pytest.mark.parametrize("version", ["../v1", "v1/x", "", ".hidden", "a" * 65])
def test_invalid_version(files, version):
    with pytest.raises(ReleaseError, match="Niepoprawna wersja"):
        publish(files, version)
    with pytest.raises(ReleaseError, match="Niepoprawna wersja"):
        get_release(files, version)


def test_invalid_seed_is_rejected(files):
    (files.seed_dir / "release.yaml").write_text("settings: {nieznane_pole: 1}\n", encoding="utf-8")
    with pytest.raises(ReleaseError, match="walidacji"):
        publish(files, "v1")
    assert not files.releases_dir.exists() or not any(files.releases_dir.iterdir())
