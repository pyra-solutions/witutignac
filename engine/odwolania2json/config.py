"""Model konfiguracji (wydania) i jego wczytywanie.

Źródłem konfiguracji są pliki YAML w `config/seed/`. Silnik dostaje z nich
wydanie w postaci JSON (`release.json`): poleceniem `build-release` albo przez
publikację wydania w backendzie (`backend/manage.py publish`).
"""

import hashlib
import json
from pathlib import Path
from typing import Any, Literal

import yaml
from pydantic import BaseModel, ConfigDict, Field, model_validator


class _Model(BaseModel):
    model_config = ConfigDict(extra="forbid")


class StepRef(_Model):
    """Odwołanie do normalizatora albo walidatora po nazwie, z parametrami."""

    name: str
    args: dict[str, Any] = Field(default_factory=dict)
    severity: Literal["warning", "error"] = "warning"


class Section(_Model):
    """Nazwany fragment tekstu: od pierwszego dopasowania `start` do najbliższego `end`."""

    name: str
    start: list[str]
    end: list[str] = Field(default_factory=list)
    include_start: bool = True
    max_chars: int | None = None
    within: str | None = None  # szukaj wewnątrz innej sekcji


class Rule(_Model):
    """Ekstraktor deterministyczny."""

    kind: Literal["regex", "dictionary_match"] = "regex"
    pattern: str | None = None
    group: int | str = 1
    section: str | None = None
    occurrence: Literal["first", "last", "all"] = "first"
    unique: bool = False  # dla occurrence=all: pomiń powtórzenia tej samej wartości
    ignore_case: bool = True
    dictionary: str | None = None  # dla dictionary_match
    value_key: str = "id"

    @model_validator(mode="after")
    def _check(self) -> "Rule":
        if self.kind == "regex" and not self.pattern:
            raise ValueError("reguła regex wymaga 'pattern'")
        if self.kind == "dictionary_match" and not self.dictionary:
            raise ValueError("reguła dictionary_match wymaga 'dictionary'")
        return self


class Derive(_Model):
    """Wartość wyliczana z innych pól, a nie odczytywana z tekstu."""

    kind: Literal["dictionary_lookup", "present", "map_regex", "constant", "count_at_least"]
    source: str | None = None  # ścieżka pola źródłowego
    dictionary: str | None = None
    key: str = "id"
    value: str = "opis"
    if_true: Any = 1
    if_false: Any = 0
    cases: list[dict[str, Any]] = Field(default_factory=list)  # [{pattern, value}]
    default: Any = None
    constant: Any = None
    min_count: int = 2


class FieldDef(_Model):
    path: str  # np. "ZamowieniePubliczne.numer_ted", "Odwolujacy[].nip"
    type: Literal["string", "integer", "number", "date"] = "string"
    instruction: str = ""
    group: str | None = None  # grupa ekstrakcji LLM
    rules: list[Rule] = Field(default_factory=list)
    strategy: Literal["llm_first", "rules_first", "rules_only", "llm_only"] = "llm_first"
    normalizers: list[StepRef] = Field(default_factory=list)
    validators: list[StepRef] = Field(default_factory=list)
    derive: Derive | None = None
    enum: list[Any] | None = None
    dictionary: str | None = None  # słownik dołączany do instrukcji dla LLM
    # Weryfikacja wartości z LLM w tekście: required (dosłownie, bez spacji i interpunkcji),
    # tokens (każdy wyraz/liczba), token_prefix (początki wyrazów — dla odmienionych nazwisk), none.
    grounding: Literal["required", "tokens", "token_prefix", "none"] = "required"
    default: Any = None
    # Pole ma sens tylko, gdy lista nadrzędna ma co najmniej tyle elementów (np. prowadzący
    # postępowanie przy kilku zamawiających); inaczej zostaje null.
    only_if_list_size_at_least: int | None = None


class ListDef(_Model):
    path: str  # np. "Odwolujacy", "mocodawca[].podpisujacy"
    min_items: int = 1
    max_items: int | None = None  # nadmiarowe elementy są odrzucane
    instruction: str = ""


class ExtractionGroup(_Model):
    name: str
    instruction: str = ""
    sections: list[str] = Field(default_factory=list)  # pusta lista = cały dokument
    max_chars: int = 24000
    llm_profile: str | None = None


class ClassifierPattern(_Model):
    pattern: str
    weight: float = 1.0
    first_chars: int | None = 3000  # szukaj tylko na początku dokumentu


class Classification(_Model):
    patterns: list[ClassifierPattern] = Field(default_factory=list)
    filename_patterns: list[ClassifierPattern] = Field(default_factory=list)
    min_score: float = 1.0
    description: str = ""


class DocumentType(_Model):
    code: str
    name: str
    classification: Classification
    conversion_profile: str = "default"
    sections: list[Section] = Field(default_factory=list)
    lists: list[ListDef] = Field(default_factory=list)
    groups: list[ExtractionGroup] = Field(default_factory=list)
    fields: list[FieldDef]


class DictionaryEntry(_Model):
    model_config = ConfigDict(extra="allow")
    id: Any
    keywords: list[str] = Field(default_factory=list)


class Dictionary(_Model):
    code: str
    name: str = ""
    entries: list[DictionaryEntry]


class ConversionProfile(_Model):
    id: str = "default"
    ocr_engine: Literal["rapidocr", "tesseract"] = "rapidocr"
    ocr_lang: list[str] = Field(default_factory=lambda: ["pl"])
    ocr_mode: Literal["default", "full_page"] = "default"
    replace_broken_text_layer: bool = True
    table_structure: bool = True
    max_pages: int = 10
    num_threads: int = 4
    document_timeout_s: float | None = 180
    # Dokument bez warstwy tekstowej (skan) można czytać innym trybem OCR.
    scanned_ocr_mode: Literal["default", "full_page"] | None = "full_page"
    # RapidOCR: skala obrazu strony dla OCR (1.0 = 72 dpi, 3.0 = 216 dpi) i rozmiar modelu PP-OCRv6.
    ocr_scale: float = 3.0
    ocr_model_size: Literal["tiny", "small", "medium"] = "small"


class LlmProfile(_Model):
    id: str = "default"
    base_url: str | None = None
    model: str | None = None
    api_key_env: str = "LLM_API_KEY"
    temperature: float = 0.0
    max_tokens: int = 4096
    seed: int | None = 42
    timeout_s: float = 90
    max_retries: int = 3
    reasoning_effort: str | None = None
    structured_output: Literal["json_schema", "json_object", "prompt"] = "json_schema"
    system_prompt: str = ""
    # Dodatkowe nagłówki HTTP, np. {"x-edenai-metadata": "enabled"}: Eden AI zwraca wtedy dostawcę
    # i region przetwarzania, które trafiają do śladu ekstrakcji.
    extra_headers: dict[str, str] = Field(default_factory=dict)
    # Limity dostawcy egzekwowane po stronie klienta (None = bez limitu).
    tokens_per_minute: int | None = None
    requests_per_minute: int | None = None


class Settings(_Model):
    unsupported_output: str = "{}"
    default_llm_profile: str = "default"
    llm_concurrency: int = 4
    # Na skanach wartość z LLM może się różnić od tekstu OCR polskimi znakami, spacjami i pomyłkami
    # 0/o, 1/l/i; musi jednak wystąpić w tekście w całości (textutil.grounded).
    ocr_tolerant_grounding: bool = False


class Release(_Model):
    version: str = "dev"
    settings: Settings = Field(default_factory=Settings)
    conversion_profiles: list[ConversionProfile] = Field(default_factory=lambda: [ConversionProfile()])
    llm_profiles: list[LlmProfile] = Field(default_factory=lambda: [LlmProfile()])
    dictionaries: list[Dictionary] = Field(default_factory=list)
    document_types: list[DocumentType]

    def dictionary(self, code: str) -> Dictionary:
        for d in self.dictionaries:
            if d.code == code:
                return d
        raise KeyError(f"brak słownika '{code}'")

    def conversion_profile(self, pid: str) -> ConversionProfile:
        for p in self.conversion_profiles:
            if p.id == pid:
                return p
        raise KeyError(f"brak profilu konwersji '{pid}'")

    def llm_profile(self, pid: str | None) -> LlmProfile:
        pid = pid or self.settings.default_llm_profile
        for p in self.llm_profiles:
            if p.id == pid:
                return p
        raise KeyError(f"brak profilu LLM '{pid}'")

    def fingerprint(self) -> str:
        raw = json.dumps(self.model_dump(mode="json"), sort_keys=True, ensure_ascii=False)
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]


def load_release(path: Path) -> Release:
    """Wczytuje wydanie z pliku JSON albo buduje je z katalogu YAML (seed)."""
    if path.is_dir():
        return build_from_seed(path)
    data = json.loads(path.read_text(encoding="utf-8"))
    return Release.model_validate(data)


def _read_yaml(p: Path) -> Any:
    return yaml.safe_load(p.read_text(encoding="utf-8"))


def build_from_seed(seed_dir: Path) -> Release:
    """Składa wydanie z plików: release.yaml, dictionaries/*.yaml, document_types/*.yaml."""
    base = _read_yaml(seed_dir / "release.yaml") if (seed_dir / "release.yaml").exists() else {}
    base = base or {}
    base["dictionaries"] = [_read_yaml(p) for p in sorted((seed_dir / "dictionaries").glob("*.yaml"))]
    base["document_types"] = [_read_yaml(p) for p in sorted((seed_dir / "document_types").glob("*.yaml"))]
    return Release.model_validate(base)
