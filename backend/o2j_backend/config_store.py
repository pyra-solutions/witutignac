"""Konfiguracja w bazie ↔ wydanie silnika (`odwolania2json.config.Release`).

* `import_release` zapisuje wydanie (np. zbudowane z `config/seed/*.yaml`) do tabel konfiguracji,
  zastępując dotychczasową konfigurację.
* `export_release` składa wydanie z tabel. Wynik przechodzi walidację modeli silnika.

Kolumny mają nazwy pól silnika, więc mapowanie jest generyczne: dla każdego pola modelu
Pydantic bierzemy atrybut o tej samej nazwie (wyjątki są w `_MAPS`). Gdy silnik doda pole,
którego baza nie zna, import zatrzyma się z komunikatem, zamiast je po cichu zgubić.
Po imporcie eksportujemy konfigurację z powrotem i porównujemy ze źródłem.
"""

from collections.abc import Iterable, Sequence
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit

import yaml
from pydantic import BaseModel, ValidationError
from pydantic_core import to_jsonable_python
from sqlalchemy import inspect, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from odwolania2json import config as ec

from . import models as m


class ConfigStoreError(Exception):
    """Konfiguracji nie da się zapisać w bazie albo z niej odtworzyć."""


@dataclass(frozen=True)
class _Map:
    renames: dict[str, str] = field(default_factory=dict)  # pole silnika -> atrybut ORM
    manual: frozenset[str] = frozenset()  # pola obsługiwane osobno (relacje, listy podrzędne)


_MAPS: dict[type[BaseModel], _Map] = {
    ec.Settings: _Map(manual=frozenset({"default_llm_profile"})),
    ec.ConversionProfile: _Map(renames={"id": "code"}),
    ec.LlmProfile: _Map(renames={"id": "code"}, manual=frozenset({"base_url"})),
    ec.Dictionary: _Map(manual=frozenset({"entries"})),
    ec.DocumentType: _Map(
        manual=frozenset({"classification", "conversion_profile", "sections", "lists", "groups", "fields"})
    ),
    ec.Classification: _Map(renames={"patterns": "classification_patterns", "min_score": "classification_min_score"}),
    ec.Section: _Map(renames={"start": "start_patterns", "end": "end_patterns"}),
    ec.ListDef: _Map(),
    ec.ExtractionGroup: _Map(manual=frozenset({"llm_profile"})),
    ec.FieldDef: _Map(
        renames={"enum": "enum_values", "default": "default_value"}, manual=frozenset({"group", "dictionary"})
    ),
}


def _assign(row: m.Base, model: BaseModel) -> None:
    """Przepisuje pola modelu silnika do kolumn wiersza (zagnieżdżone modele jako JSON)."""
    mp = _MAPS[type(model)]
    columns = inspect(type(row)).attrs
    for name in type(model).model_fields:
        if name in mp.manual:
            continue
        attr = mp.renames.get(name, name)
        if attr not in columns:
            raise ConfigStoreError(
                f"Tabela {row.__tablename__} nie ma kolumny dla pola silnika "
                f"{type(model).__name__}.{name}. Dodaj kolumnę w backend/o2j_backend/models.py i migrację."
            )
        setattr(row, attr, to_jsonable_python(getattr(model, name)))


def _read(row: m.Base, model_cls: type[BaseModel]) -> dict[str, Any]:
    mp = _MAPS[model_cls]
    return {name: getattr(row, mp.renames.get(name, name)) for name in model_cls.model_fields if name not in mp.manual}


# ---------------------------------------------------------------------------
# Dostawcy LLM (metadane platformy spoza wydania silnika)
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class ProviderInfo:
    code: str
    name: str
    base_url: str
    data_location: str | None = None
    note: str = ""


def load_providers(path: Path) -> list[ProviderInfo]:
    """Czyta `llm_providers.yaml`; brak pliku oznacza brak metadanych dostawców."""
    if not path.is_file():
        return []
    data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    allowed = set(ProviderInfo.__dataclass_fields__)
    out = []
    for i, item in enumerate(data.get("providers") or []):
        unknown = set(item) - allowed
        if unknown:
            raise ConfigStoreError(f"{path}: providers[{i}] ma nieznane klucze: {', '.join(sorted(unknown))}")
        out.append(ProviderInfo(**item))
    return out


def load_seed(seed_dir: Path) -> tuple[ec.Release, list[ProviderInfo]]:
    """Wydanie z plików YAML (tak samo jak `odwolania2json build-release`) i metadane dostawców."""
    try:
        release = ec.build_from_seed(seed_dir)
    except ValidationError as e:
        raise ConfigStoreError(f"Pliki w {seed_dir} nie przechodzą walidacji silnika:\n{e}") from e
    return release, load_providers(seed_dir / "llm_providers.yaml")


def _derived_provider(base_url: str) -> ProviderInfo:
    host = urlsplit(base_url).hostname or base_url
    return ProviderInfo(code=host.replace(".", "-"), name=host, base_url=base_url)


# ---------------------------------------------------------------------------
# Import
# ---------------------------------------------------------------------------


def _check_unique(values: Iterable[str], what: str) -> None:
    seen: set[str] = set()
    for v in values:
        if v in seen:
            raise ConfigStoreError(f"Powtórzony identyfikator w {what}: {v}")
        seen.add(v)


def _dictionary_key_type(d: ec.Dictionary) -> str:
    ids = [e.id for e in d.entries]
    if all(isinstance(i, int) and not isinstance(i, bool) for i in ids):
        return "integer"
    if all(isinstance(i, str) for i in ids):
        return "string"
    raise ConfigStoreError(f"Słownik {d.code}: identyfikatory pozycji muszą być wszystkie liczbami albo tekstem")


def _lookup(rows: dict[str, Any], key: str, what: str) -> Any:
    try:
        return rows[key]
    except KeyError:
        raise ConfigStoreError(f"{what} wskazuje nieistniejący element: {key}") from None


def import_release(session: Session, release: ec.Release, providers: Sequence[ProviderInfo] = ()) -> dict[str, int]:
    """Zastępuje konfigurację w bazie treścią wydania. Nie zatwierdza transakcji.

    Elementy, których nie ma w wydaniu, są usuwane; gdy wskazują na nie dane robocze
    (np. dokumenty sklasyfikowane jako dany typ), import kończy się błędem.
    """
    try:
        counts = _import(session, release, providers)
        session.flush()
    except IntegrityError as e:
        raise ConfigStoreError(f"Baza odrzuciła zmianę konfiguracji: {e.orig}") from e

    problems = diff_releases(release, export_release(session, release.version))
    if problems:
        raise ConfigStoreError("Baza nie odwzorowuje konfiguracji wiernie:\n  " + "\n  ".join(problems[:20]))
    return counts


def _import(session: Session, release: ec.Release, providers: Sequence[ProviderInfo]) -> dict[str, int]:
    _check_unique((p.id for p in release.conversion_profiles), "conversion_profiles")
    _check_unique((p.id for p in release.llm_profiles), "llm_profiles")
    _check_unique((d.code for d in release.dictionaries), "dictionaries")
    _check_unique((d.code for d in release.document_types), "document_types")

    # Profile konwersji
    old_cps = {r.code: r for r in session.scalars(select(m.ConversionProfile))}
    cps: dict[str, m.ConversionProfile] = {}
    for p in release.conversion_profiles:
        row = old_cps.pop(p.id, None) or m.ConversionProfile()
        _assign(row, p)
        session.add(row)
        cps[p.id] = row

    # Dostawcy LLM: z pliku metadanych albo wyprowadzeni z adresu API
    old_providers = {r.base_url: r for r in session.scalars(select(m.LlmProvider))}
    listed = {p.base_url: p for p in providers}
    used = [p.base_url for p in release.llm_profiles if p.base_url]
    provider_rows: dict[str, m.LlmProvider] = {}
    for url in dict.fromkeys([*listed, *used]):
        row = old_providers.pop(url, None)
        info = listed.get(url)
        if row is None:
            info = info or _derived_provider(url)
            row = m.LlmProvider(base_url=url)
        if info is not None:
            row.code, row.name, row.data_location, row.note = info.code, info.name, info.data_location, info.note
        session.add(row)
        provider_rows[url] = row

    # Profile LLM
    old_profiles = {r.code: r for r in session.scalars(select(m.LlmProfile))}
    profiles: dict[str, m.LlmProfile] = {}
    for p in release.llm_profiles:
        row = old_profiles.pop(p.id, None) or m.LlmProfile()
        _assign(row, p)
        row.provider = provider_rows[p.base_url] if p.base_url else None
        session.add(row)
        profiles[p.id] = row

    # Słowniki
    old_dicts = {r.code: r for r in session.scalars(select(m.Dictionary))}
    dicts: dict[str, m.Dictionary] = {}
    for d in release.dictionaries:
        row = old_dicts.pop(d.code, None) or m.Dictionary()
        _assign(row, d)
        row.key_type = _dictionary_key_type(d)
        _check_unique((str(e.id) for e in d.entries), f"słowniku {d.code}")
        session.add(row)
        row.entries.clear()
        session.flush()
        row.entries = [
            m.DictionaryEntry(
                position=i,
                key=str(e.id),
                keywords=list(e.keywords),
                attributes=to_jsonable_python(e.model_extra or {}),
            )
            for i, e in enumerate(d.entries)
        ]
        dicts[d.code] = row

    # Typy dokumentów
    old_types = {r.code: r for r in session.scalars(select(m.DocumentType))}
    n_fields = 0
    for pos, dt in enumerate(release.document_types):
        where = f"Typ dokumentu {dt.code}"
        _check_unique((s.name for s in dt.sections), f"sekcjach typu {dt.code}")
        _check_unique((g.name for g in dt.groups), f"grupach typu {dt.code}")
        _check_unique((f.path for f in dt.fields), f"polach typu {dt.code}")
        _check_unique((li.path for li in dt.lists), f"listach typu {dt.code}")

        row = old_types.pop(dt.code, None) or m.DocumentType()
        row.position = pos
        _assign(row, dt)
        _assign(row, dt.classification)
        row.conversion_profile = _lookup(cps, dt.conversion_profile, f"{where}: conversion_profile")
        session.add(row)
        # Elementy podrzędne zastępujemy w całości. Pola wskazują na grupy, więc usuwamy je wcześniej.
        row.fields.clear()
        row.lists.clear()
        row.sections.clear()
        session.flush()
        row.groups.clear()
        session.flush()

        groups: dict[str, m.ExtractionGroup] = {}
        for i, g in enumerate(dt.groups):
            gr = m.ExtractionGroup(position=i)
            _assign(gr, g)
            gr.llm_profile = _lookup(profiles, g.llm_profile, f"{where}, grupa {g.name}: llm_profile") if g.llm_profile else None
            groups[g.name] = gr
        row.groups = list(groups.values())

        sections = []
        for i, s in enumerate(dt.sections):
            sec = m.DocumentSection(position=i)
            _assign(sec, s)
            sections.append(sec)
        row.sections = sections

        lists = []
        for i, li in enumerate(dt.lists):
            ld = m.ListDefinition(position=i)
            _assign(ld, li)
            lists.append(ld)
        row.lists = lists

        fields = []
        for i, f in enumerate(dt.fields):
            fd = m.FieldDefinition(position=i)
            _assign(fd, f)
            fd.group = _lookup(groups, f.group, f"{where}, pole {f.path}: group") if f.group else None
            fd.dictionary = _lookup(dicts, f.dictionary, f"{where}, pole {f.path}: dictionary") if f.dictionary else None
            fields.append(fd)
        row.fields = fields
        n_fields += len(fields)

    # Ustawienia wydania
    settings = session.get(m.EngineSettings, 1) or m.EngineSettings(id=1)
    _assign(settings, release.settings)
    settings.default_llm_profile = _lookup(
        profiles, release.settings.default_llm_profile, "settings.default_llm_profile"
    )
    session.add(settings)
    session.flush()

    # Usunięcie elementów, których nie ma w wydaniu (w kolejności zależności)
    for rows in (old_types, old_dicts, old_profiles):
        for row in rows.values():
            session.delete(row)
    session.flush()
    for row in old_providers.values():
        session.delete(row)
    for row in old_cps.values():
        session.delete(row)

    return {
        "conversion_profiles": len(cps),
        "llm_providers": len(provider_rows),
        "llm_profiles": len(profiles),
        "dictionaries": len(dicts),
        "document_types": len(release.document_types),
        "fields": n_fields,
    }


# ---------------------------------------------------------------------------
# Eksport
# ---------------------------------------------------------------------------


def _entry(e: m.DictionaryEntry, key_type: str) -> dict[str, Any]:
    return {"id": int(e.key) if key_type == "integer" else e.key, "keywords": list(e.keywords), **e.attributes}


def _document_type(dt: m.DocumentType) -> dict[str, Any]:
    return {
        **_read(dt, ec.DocumentType),
        "classification": _read(dt, ec.Classification),
        "conversion_profile": dt.conversion_profile.code,
        "sections": [_read(s, ec.Section) for s in dt.sections],
        "lists": [_read(li, ec.ListDef) for li in dt.lists],
        "groups": [
            {**_read(g, ec.ExtractionGroup), "llm_profile": g.llm_profile.code if g.llm_profile else None}
            for g in dt.groups
        ],
        "fields": [
            {
                **_read(f, ec.FieldDef),
                "group": f.group.name if f.group else None,
                "dictionary": f.dictionary.code if f.dictionary else None,
            }
            for f in dt.fields
        ],
    }


def export_release(session: Session, version: str) -> ec.Release:
    """Składa wydanie silnika z aktualnej konfiguracji w bazie."""
    settings = session.get(m.EngineSettings, 1)
    if settings is None:
        raise ConfigStoreError("Baza nie zawiera konfiguracji. Uruchom: python backend/manage.py seed")

    data = {
        "version": version,
        "settings": {**_read(settings, ec.Settings), "default_llm_profile": settings.default_llm_profile.code},
        "conversion_profiles": [
            _read(r, ec.ConversionProfile)
            for r in session.scalars(select(m.ConversionProfile).order_by(m.ConversionProfile.code))
        ],
        "llm_profiles": [
            {**_read(r, ec.LlmProfile), "base_url": r.provider.base_url if r.provider else None}
            for r in session.scalars(select(m.LlmProfile).order_by(m.LlmProfile.code))
        ],
        "dictionaries": [
            {**_read(d, ec.Dictionary), "entries": [_entry(e, d.key_type) for e in d.entries]}
            for d in session.scalars(select(m.Dictionary).order_by(m.Dictionary.code))
        ],
        "document_types": [
            _document_type(dt)
            for dt in session.scalars(select(m.DocumentType).order_by(m.DocumentType.position, m.DocumentType.code))
        ],
    }
    try:
        return ec.Release.model_validate(data)
    except ValidationError as e:
        raise ConfigStoreError(f"Konfiguracja w bazie nie przechodzi walidacji silnika:\n{e}") from e


# ---------------------------------------------------------------------------
# Porównanie wydań
# ---------------------------------------------------------------------------

# Listy, w których kolejność nie ma znaczenia dla silnika (wyszukiwanie po identyfikatorze).
_UNORDERED = {"conversion_profiles": "id", "llm_profiles": "id", "dictionaries": "code"}


def comparable(release: ec.Release) -> dict[str, Any]:
    """Postać wydania do porównań: bez wersji, listy wyszukiwane po kluczu posortowane."""
    data = release.model_dump(mode="json")
    data.pop("version")
    for name, key in _UNORDERED.items():
        data[name] = sorted(data[name], key=lambda x: x[key])
    return data


def _diff(a: Any, b: Any, path: str, out: list[str]) -> None:
    if isinstance(a, dict) and isinstance(b, dict):
        for k in sorted(set(a) | set(b)):
            _diff(a.get(k, "<brak>"), b.get(k, "<brak>"), f"{path}.{k}" if path else k, out)
    elif isinstance(a, list) and isinstance(b, list) and len(a) == len(b):
        for i, (x, y) in enumerate(zip(a, b, strict=True)):
            _diff(x, y, f"{path}[{i}]", out)
    elif a != b:
        out.append(f"{path}: {a!r} ≠ {b!r}")


def diff_releases(expected: ec.Release, actual: ec.Release) -> list[str]:
    out: list[str] = []
    _diff(comparable(expected), comparable(actual), "", out)
    return out
