"""Schemat bazy danych platformy (PostgreSQL, SQLAlchemy 2).

Dwie części:

* **Konfiguracja** – typy dokumentów, pola, grupy ekstrakcji, słowniki, profile Docling i LLM.
  Kolumny mają te same nazwy co pola modeli wydania silnika (`odwolania2json.config`).
  Wartości domyślne pochodzą wyłącznie z modeli silnika (import zawsze zapisuje komplet wartości),
  dlatego kolumny konfiguracji nie mają domyślnych wartości po stronie bazy.
  Zagnieżdżone struktury silnika (reguły, normalizatory, walidatory, wyprowadzenia, wzorce
  klasyfikacji) są w JSONB: ich kształt należy do silnika i jest sprawdzany przy eksporcie wydania.
* **Dane robocze** – sprawy, dokumenty, artefakty konwersji, zadania, wyniki, poprawki,
  ewaluacje i audyt.

Silnik nie czyta tabel. Dostaje niezmienne wydanie (`config_release.snapshot` → `release.json`).
"""

import enum
import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    DateTime,
    Double,
    Enum,
    ForeignKey,
    Index,
    MetaData,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSON, JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

NAMING_CONVENTION = {
    "ix": "ix_%(table_name)s_%(column_0_N_name)s",
    "uq": "uq_%(table_name)s_%(column_0_N_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

# JSONB, w którym None oznacza SQL NULL (a nie wartość JSON null). Dla danych, po których się wyszukuje.
JsonB = JSONB(none_as_null=True)
# JSON (nie JSONB) zachowuje tekst i kolejność kluczy. Używamy go dla struktur silnika, snapshotu
# wydania i wynikowego JSON-a dokumentu, żeby plik z bazy był bajtowo identyczny ze źródłem.
JsonDoc = JSON(none_as_null=True)
TextArray = ARRAY(Text)


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=NAMING_CONVENTION)
    type_annotation_map = {
        str: Text,
        float: Double,
        datetime: DateTime(timezone=True),
        uuid.UUID: UUID(as_uuid=True),
        dict[str, Any]: JsonB,
        list[str]: TextArray,
    }


def _created_at() -> Mapped[datetime]:
    return mapped_column(server_default=func.now())


def _updated_at() -> Mapped[datetime]:
    return mapped_column(server_default=func.now(), onupdate=func.now())


def _uuid_pk() -> Mapped[uuid.UUID]:
    # uuidv7() jest wbudowane od PostgreSQL 18; identyfikatory rosną w czasie (dobre dla indeksów).
    return mapped_column(primary_key=True, server_default=text("uuidv7()"))


def _pg_enum(cls: type[enum.Enum], name: str) -> Enum:
    return Enum(cls, name=name, values_callable=lambda e: [m.value for m in e])


# ---------------------------------------------------------------------------
# Konfiguracja
# ---------------------------------------------------------------------------


class EngineSettings(Base):
    """Ustawienia wspólne całego wydania (`Release.settings`). Zawsze jeden wiersz o id = 1."""

    __tablename__ = "engine_settings"
    __table_args__ = (CheckConstraint("id = 1", name="singleton"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=False, default=1)
    unsupported_output: Mapped[str]
    default_llm_profile_id: Mapped[int] = mapped_column(ForeignKey("llm_profile.id", ondelete="RESTRICT"))
    llm_concurrency: Mapped[int]
    updated_at: Mapped[datetime] = _updated_at()

    default_llm_profile: Mapped["LlmProfile"] = relationship()


class ConversionProfile(Base):
    """Ustawienia Docling (`Release.conversion_profiles[]`)."""

    __tablename__ = "conversion_profile"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(unique=True)
    ocr_engine: Mapped[str]
    ocr_lang: Mapped[list[str]]
    ocr_mode: Mapped[str]
    replace_broken_text_layer: Mapped[bool]
    table_structure: Mapped[bool]
    max_pages: Mapped[int]
    num_threads: Mapped[int]
    document_timeout_s: Mapped[float | None]
    scanned_ocr_mode: Mapped[str | None]
    created_at: Mapped[datetime] = _created_at()
    updated_at: Mapped[datetime] = _updated_at()


class LlmProvider(Base):
    """Dostawca API zgodnego z OpenAI. Metadane platformy; silnik widzi tylko `base_url` w profilu."""

    __tablename__ = "llm_provider"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(unique=True)
    name: Mapped[str]
    base_url: Mapped[str] = mapped_column(unique=True)
    data_location: Mapped[str | None]
    note: Mapped[str] = mapped_column(server_default="")
    created_at: Mapped[datetime] = _created_at()
    updated_at: Mapped[datetime] = _updated_at()

    profiles: Mapped[list["LlmProfile"]] = relationship(back_populates="provider")


class LlmProfile(Base):
    """Model i parametry wywołań (`Release.llm_profiles[]` bez `base_url`, który jest u dostawcy)."""

    __tablename__ = "llm_profile"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(unique=True)
    provider_id: Mapped[int | None] = mapped_column(ForeignKey("llm_provider.id", ondelete="RESTRICT"), index=True)
    model: Mapped[str | None]
    # Nazwa zmiennej środowiskowej z kluczem API; samego klucza baza nie przechowuje.
    api_key_env: Mapped[str]
    temperature: Mapped[float]
    max_tokens: Mapped[int]
    seed: Mapped[int | None]
    timeout_s: Mapped[float]
    max_retries: Mapped[int]
    reasoning_effort: Mapped[str | None]
    structured_output: Mapped[str]
    system_prompt: Mapped[str]
    tokens_per_minute: Mapped[int | None]
    requests_per_minute: Mapped[int | None]
    created_at: Mapped[datetime] = _created_at()
    updated_at: Mapped[datetime] = _updated_at()

    provider: Mapped[LlmProvider | None] = relationship(back_populates="profiles")


class Dictionary(Base):
    """Słownik wartości (`Release.dictionaries[]`), np. powody czynności 1–12."""

    __tablename__ = "dictionary"
    __table_args__ = (CheckConstraint("key_type IN ('integer', 'string')", name="key_type"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(unique=True)
    name: Mapped[str]
    # Typ identyfikatorów pozycji w wydaniu JSON (w bazie klucz jest tekstem).
    key_type: Mapped[str]
    created_at: Mapped[datetime] = _created_at()
    updated_at: Mapped[datetime] = _updated_at()

    entries: Mapped[list["DictionaryEntry"]] = relationship(
        back_populates="dictionary", cascade="all, delete-orphan", order_by="DictionaryEntry.position"
    )


class DictionaryEntry(Base):
    __tablename__ = "dictionary_entry"
    __table_args__ = (UniqueConstraint("dictionary_id", "key"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    dictionary_id: Mapped[int] = mapped_column(ForeignKey("dictionary.id", ondelete="CASCADE"))
    position: Mapped[int]
    key: Mapped[str]
    keywords: Mapped[list[str]]
    # Pozostałe atrybuty pozycji widoczne w wydaniu, np. {"opis": "Decyzja o odrzuceniu oferty"}.
    attributes: Mapped[dict[str, Any]] = mapped_column(JsonDoc)

    dictionary: Mapped[Dictionary] = relationship(back_populates="entries")


class DocumentType(Base):
    """Typ dokumentu (`Release.document_types[]`) z regułami klasyfikacji."""

    __tablename__ = "document_type"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(unique=True)
    # Kolejność w wydaniu: przy remisie wyników klasyfikacji silnik wybiera typ wcześniejszy.
    position: Mapped[int]
    name: Mapped[str]
    # Opis typu (`classification.description`), używany też przy klasyfikacji przez LLM.
    description: Mapped[str]
    conversion_profile_id: Mapped[int] = mapped_column(
        ForeignKey("conversion_profile.id", ondelete="RESTRICT"), index=True
    )
    classification_min_score: Mapped[float]
    classification_patterns: Mapped[list[dict[str, Any]]] = mapped_column(JsonDoc)
    filename_patterns: Mapped[list[dict[str, Any]]] = mapped_column(JsonDoc)
    created_at: Mapped[datetime] = _created_at()
    updated_at: Mapped[datetime] = _updated_at()

    conversion_profile: Mapped[ConversionProfile] = relationship()
    sections: Mapped[list["DocumentSection"]] = relationship(
        back_populates="document_type", cascade="all, delete-orphan", order_by="DocumentSection.position"
    )
    lists: Mapped[list["ListDefinition"]] = relationship(
        back_populates="document_type", cascade="all, delete-orphan", order_by="ListDefinition.position"
    )
    groups: Mapped[list["ExtractionGroup"]] = relationship(
        back_populates="document_type", cascade="all, delete-orphan", order_by="ExtractionGroup.position"
    )
    fields: Mapped[list["FieldDefinition"]] = relationship(
        back_populates="document_type", cascade="all, delete-orphan", order_by="FieldDefinition.position"
    )


class DocumentSection(Base):
    """Nazwany fragment tekstu dokumentu: od wzorca `start` do najbliższego wzorca `end`."""

    __tablename__ = "document_section"
    __table_args__ = (UniqueConstraint("document_type_id", "name"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    document_type_id: Mapped[int] = mapped_column(ForeignKey("document_type.id", ondelete="CASCADE"))
    position: Mapped[int]
    name: Mapped[str]
    start_patterns: Mapped[list[str]]
    end_patterns: Mapped[list[str]]
    include_start: Mapped[bool]
    max_chars: Mapped[int | None]
    within: Mapped[str | None]

    document_type: Mapped[DocumentType] = relationship(back_populates="sections")


class ListDefinition(Base):
    """Lista w wyniku (np. `Odwolujacy`, `mocodawca[].podpisujacy`) z limitami liczby elementów."""

    __tablename__ = "list_definition"
    __table_args__ = (UniqueConstraint("document_type_id", "path"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    document_type_id: Mapped[int] = mapped_column(ForeignKey("document_type.id", ondelete="CASCADE"))
    position: Mapped[int]
    path: Mapped[str]
    min_items: Mapped[int]
    max_items: Mapped[int | None]
    instruction: Mapped[str]

    document_type: Mapped[DocumentType] = relationship(back_populates="lists")


class ExtractionGroup(Base):
    """Grupa pól odczytywana jednym wywołaniem LLM, z własnym fragmentem tekstu."""

    __tablename__ = "extraction_group"
    __table_args__ = (UniqueConstraint("document_type_id", "name"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    document_type_id: Mapped[int] = mapped_column(ForeignKey("document_type.id", ondelete="CASCADE"))
    position: Mapped[int]
    name: Mapped[str]
    instruction: Mapped[str]
    sections: Mapped[list[str]]
    max_chars: Mapped[int]
    llm_profile_id: Mapped[int | None] = mapped_column(ForeignKey("llm_profile.id", ondelete="RESTRICT"), index=True)

    document_type: Mapped[DocumentType] = relationship(back_populates="groups")
    llm_profile: Mapped[LlmProfile | None] = relationship()


class FieldDefinition(Base):
    """Pole wyniku: ścieżka w JSON, strategia, reguły, normalizatory i walidatory."""

    __tablename__ = "field_definition"
    __table_args__ = (UniqueConstraint("document_type_id", "path"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    document_type_id: Mapped[int] = mapped_column(ForeignKey("document_type.id", ondelete="CASCADE"))
    position: Mapped[int]
    path: Mapped[str]
    type: Mapped[str]
    instruction: Mapped[str]
    group_id: Mapped[int | None] = mapped_column(ForeignKey("extraction_group.id", ondelete="RESTRICT"), index=True)
    strategy: Mapped[str]
    rules: Mapped[list[dict[str, Any]]] = mapped_column(JsonDoc)
    normalizers: Mapped[list[dict[str, Any]]] = mapped_column(JsonDoc)
    validators: Mapped[list[dict[str, Any]]] = mapped_column(JsonDoc)
    derive: Mapped[dict[str, Any] | None] = mapped_column(JsonDoc)
    enum_values: Mapped[list[Any] | None] = mapped_column(JsonDoc)
    dictionary_id: Mapped[int | None] = mapped_column(ForeignKey("dictionary.id", ondelete="RESTRICT"), index=True)
    grounding: Mapped[str]
    default_value: Mapped[Any] = mapped_column(JsonDoc, nullable=True)
    only_if_list_size_at_least: Mapped[int | None]

    document_type: Mapped[DocumentType] = relationship(back_populates="fields")
    group: Mapped[ExtractionGroup | None] = relationship()
    dictionary: Mapped[Dictionary | None] = relationship()


class ReleaseStatus(enum.StrEnum):
    DRAFT = "draft"  # opublikowane, czeka na aktywację (np. po ewaluacji)
    ACTIVE = "active"  # używane do przetwarzania; dokładnie jedno naraz
    ARCHIVED = "archived"  # wcześniej aktywne; można je przywrócić


class ConfigRelease(Base):
    """Niezmienne wydanie konfiguracji: pełna treść `release.json` i jej SHA-256.

    Trigger `config_release_immutable` blokuje zmianę wersji, treści i skrótu po utworzeniu.
    """

    __tablename__ = "config_release"
    __table_args__ = (
        Index("uq_config_release_single_active", "status", unique=True, postgresql_where=text("status = 'active'")),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    version: Mapped[str] = mapped_column(unique=True)
    status: Mapped[ReleaseStatus] = mapped_column(_pg_enum(ReleaseStatus, "release_status"))
    snapshot: Mapped[dict[str, Any]] = mapped_column(JsonDoc)
    sha256: Mapped[str] = mapped_column(String(64))
    author: Mapped[str] = mapped_column(server_default="")
    summary: Mapped[str] = mapped_column(server_default="")
    created_at: Mapped[datetime] = _created_at()
    activated_at: Mapped[datetime | None]


# ---------------------------------------------------------------------------
# Dane robocze
# ---------------------------------------------------------------------------


class CaseStatus(enum.StrEnum):
    NEW = "new"
    PROCESSING = "processing"
    REVIEW = "review"
    DONE = "done"
    FAILED = "failed"


class DocumentStatus(enum.StrEnum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    REVIEW = "review"
    APPROVED = "approved"
    UNSUPPORTED = "unsupported"  # typ spoza konfiguracji: wynik to pusty JSON
    FAILED = "failed"


class JobStage(enum.StrEnum):
    CONVERT = "convert"
    EXTRACT = "extract"


class JobStatus(enum.StrEnum):
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"


class EvaluationStatus(enum.StrEnum):
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"


class CaseFile(Base):
    """Sprawa odwoławcza: zestaw dokumentów przetwarzanych razem."""

    __tablename__ = "case_file"
    __table_args__ = (Index(None, "status", "created_at"),)

    id: Mapped[uuid.UUID] = _uuid_pk()
    reference: Mapped[str | None]  # sygnatura albo nazwa katalogu sprawy
    title: Mapped[str] = mapped_column(server_default="")
    status: Mapped[CaseStatus] = mapped_column(_pg_enum(CaseStatus, "case_status"), server_default=CaseStatus.NEW.value)
    created_by: Mapped[str] = mapped_column(server_default="")
    created_at: Mapped[datetime] = _created_at()
    updated_at: Mapped[datetime] = _updated_at()

    documents: Mapped[list["Document"]] = relationship(back_populates="case", cascade="all, delete-orphan")


class Document(Base):
    """Plik PDF w sprawie. Sam plik leży w magazynie plików (`storage_key`)."""

    __tablename__ = "document"
    __table_args__ = (UniqueConstraint("case_id", "file_name"),)

    id: Mapped[uuid.UUID] = _uuid_pk()
    case_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("case_file.id", ondelete="CASCADE"))
    file_name: Mapped[str]
    storage_key: Mapped[str]
    sha256: Mapped[str] = mapped_column(String(64), index=True)
    mime_type: Mapped[str]
    size_bytes: Mapped[int] = mapped_column(BigInteger)
    page_count: Mapped[int | None]
    document_type_id: Mapped[int | None] = mapped_column(ForeignKey("document_type.id", ondelete="RESTRICT"), index=True)
    classification_score: Mapped[float | None]
    status: Mapped[DocumentStatus] = mapped_column(
        _pg_enum(DocumentStatus, "document_status"), server_default=DocumentStatus.UPLOADED.value, index=True
    )
    needs_review: Mapped[bool] = mapped_column(server_default=text("false"))
    created_at: Mapped[datetime] = _created_at()
    updated_at: Mapped[datetime] = _updated_at()

    case: Mapped[CaseFile] = relationship(back_populates="documents")
    document_type: Mapped[DocumentType | None] = relationship()


class ConversionArtifact(Base):
    """Wynik konwersji Docling: Markdown i JSON dokumentu z położeniem elementów."""

    __tablename__ = "conversion_artifact"
    __table_args__ = (UniqueConstraint("document_id", "cache_key"),)

    id: Mapped[uuid.UUID] = _uuid_pk()
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("document.id", ondelete="CASCADE"))
    conversion_profile_id: Mapped[int | None] = mapped_column(
        ForeignKey("conversion_profile.id", ondelete="SET NULL"), index=True
    )
    # SHA-256 pliku + wersja Docling + skrót profilu konwersji.
    cache_key: Mapped[str] = mapped_column(index=True)
    docling_version: Mapped[str]
    markdown: Mapped[str]
    docling_document: Mapped[dict[str, Any] | None]
    mean_grade: Mapped[str | None]
    low_grade: Mapped[str | None]
    duration_ms: Mapped[int | None]
    created_at: Mapped[datetime] = _created_at()


class ProcessingJob(Base):
    """Zadanie przetwarzania. Klucz idempotencji: dokument + wydanie + etap."""

    __tablename__ = "processing_job"
    __table_args__ = (UniqueConstraint("document_id", "release_id", "stage"),)

    id: Mapped[uuid.UUID] = _uuid_pk()
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("document.id", ondelete="CASCADE"))
    release_id: Mapped[int] = mapped_column(ForeignKey("config_release.id", ondelete="RESTRICT"), index=True)
    stage: Mapped[JobStage] = mapped_column(_pg_enum(JobStage, "job_stage"))
    status: Mapped[JobStatus] = mapped_column(
        _pg_enum(JobStatus, "job_status"), server_default=JobStatus.QUEUED.value, index=True
    )
    attempts: Mapped[int] = mapped_column(server_default=text("0"))
    error: Mapped[str | None]
    queued_at: Mapped[datetime] = _created_at()
    started_at: Mapped[datetime | None]
    finished_at: Mapped[datetime | None]


class DocumentResult(Base):
    """Wynikowy JSON dokumentu dla danego wydania konfiguracji, ze śladem ekstrakcji."""

    __tablename__ = "document_result"
    __table_args__ = (UniqueConstraint("document_id", "release_id"),)

    id: Mapped[uuid.UUID] = _uuid_pk()
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("document.id", ondelete="CASCADE"))
    release_id: Mapped[int] = mapped_column(ForeignKey("config_release.id", ondelete="RESTRICT"), index=True)
    output: Mapped[dict[str, Any]] = mapped_column(JsonDoc)
    trace: Mapped[dict[str, Any] | None]
    llm_model: Mapped[str | None]
    docling_version: Mapped[str | None]
    created_at: Mapped[datetime] = _created_at()

    fields: Mapped[list["FieldResult"]] = relationship(back_populates="result", cascade="all, delete-orphan")


class FieldResult(Base):
    """Wartość jednego pola z metodą, pewnością i źródłem (strona, ramka) do podświetlenia w UI."""

    __tablename__ = "field_result"
    __table_args__ = (UniqueConstraint("result_id", "path"),)

    id: Mapped[uuid.UUID] = _uuid_pk()
    result_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("document_result.id", ondelete="CASCADE"))
    path: Mapped[str]  # konkretna ścieżka, np. "Odwolujacy[0].nip"
    value: Mapped[Any] = mapped_column(JsonB, nullable=True)
    method: Mapped[str | None]  # rules | llm | derive | default
    confidence: Mapped[float | None]
    source_text: Mapped[str | None]
    page: Mapped[int | None]
    bbox: Mapped[dict[str, Any] | None]
    warnings: Mapped[list[str]] = mapped_column(JsonB, server_default=text("'[]'::jsonb"))

    result: Mapped[DocumentResult] = relationship(back_populates="fields")


class Correction(Base):
    """Ręczna poprawka wartości pola przez operatora."""

    __tablename__ = "correction"

    id: Mapped[uuid.UUID] = _uuid_pk()
    field_result_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("field_result.id", ondelete="CASCADE"), index=True)
    previous_value: Mapped[Any] = mapped_column(JsonB, nullable=True)
    new_value: Mapped[Any] = mapped_column(JsonB, nullable=True)
    reason: Mapped[str] = mapped_column(server_default="")
    author: Mapped[str]
    created_at: Mapped[datetime] = _created_at()


class EvaluationRun(Base):
    """Ewaluacja F1 wydania na zbiorze ze wzorcami."""

    __tablename__ = "evaluation_run"

    id: Mapped[uuid.UUID] = _uuid_pk()
    release_id: Mapped[int] = mapped_column(ForeignKey("config_release.id", ondelete="RESTRICT"), index=True)
    dataset: Mapped[str]
    status: Mapped[EvaluationStatus] = mapped_column(
        _pg_enum(EvaluationStatus, "evaluation_status"), server_default=EvaluationStatus.QUEUED.value
    )
    f1: Mapped[float | None]
    precision: Mapped[float | None]
    recall: Mapped[float | None]
    report: Mapped[dict[str, Any] | None]
    started_at: Mapped[datetime] = _created_at()
    finished_at: Mapped[datetime | None]


class AuditLog(Base):
    """Kto, co i kiedy zmienił w konfiguracji i wynikach."""

    __tablename__ = "audit_log"
    __table_args__ = (Index(None, "entity", "entity_id"),)

    id: Mapped[uuid.UUID] = _uuid_pk()
    at: Mapped[datetime] = mapped_column(server_default=func.now(), index=True)
    actor: Mapped[str]
    action: Mapped[str]  # create | update | delete | publish | activate | correct
    entity: Mapped[str]  # nazwa tabeli
    entity_id: Mapped[str]
    before: Mapped[dict[str, Any] | None]
    after: Mapped[dict[str, Any] | None]
