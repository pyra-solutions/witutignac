"""API HTTP platformy (FastAPI).

* Sprawy z GUI: wgranie PDF-ów (lub ZIP), przetwarzanie silnikiem w tle, wyniki, ślad ekstrakcji,
  tekst z Docling, poprawki i zatwierdzenie przez człowieka, dziennik audytu.
* Konfiguracja: aktywne wydanie, wydania, szkic z plików YAML, dostawcy i modele LLM.
* Zbudowany interfejs (Angular) z katalogu `static/`, jeśli istnieje.
"""

import importlib.metadata
import io
import json
import logging
import os
import zipfile
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from datetime import UTC, datetime
from pathlib import Path
from typing import Annotated, Any

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, PlainTextResponse, Response
from pydantic import BaseModel

from . import REPO_ROOT, __version__
from . import releases as rel
from .cases import (
    MAX_FILE_BYTES,
    MAX_ZIP_TOTAL_BYTES,
    PENDING,
    CaseError,
    CaseRecord,
    CaseStore,
    DocStatus,
    DocumentRecord,
    collect_pdfs,
)
from .processing import ActiveRelease, Processor, active_config_path, validate_result

log = logging.getLogger(__name__)

STATIC_DIR = Path(os.environ.get("O2J_WEB_DIR") or Path(__file__).resolve().parent / "static")

# --- zależności (podmieniane w testach) -----------------------------------------------------

_active = ActiveRelease()
_store: CaseStore | None = None
_processor: Processor | None = None


def get_files() -> rel.ConfigFiles:
    return rel.ConfigFiles()


def get_store() -> CaseStore:
    global _store
    if _store is None:
        _store = CaseStore()
    return _store


def get_processor() -> Processor:
    global _processor
    if _processor is None:
        from odwolania2json.cli import _cache_dir

        _processor = Processor(get_store(), _active, _cache_dir(None), use_llm=not os.environ.get("O2J_NO_LLM"))
    return _processor


def get_release() -> Any:
    return _active.get()


FilesDep = Annotated[rel.ConfigFiles, Depends(get_files)]
StoreDep = Annotated[CaseStore, Depends(get_store)]
ProcessorDep = Annotated[Processor, Depends(get_processor)]
ReleaseDep = Annotated[Any, Depends(get_release)]


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    from odwolania2json.llm import load_dotenv

    load_dotenv(Path.cwd() / ".env")
    load_dotenv(REPO_ROOT / ".env")
    processor = get_processor()
    processor.start()
    yield
    processor.stop()


app = FastAPI(title="Odwołania2json API", version=__version__, lifespan=lifespan)


# --- wydania i konfiguracja ------------------------------------------------------------------


class ReleaseSummary(BaseModel):
    version: str
    status: rel.ReleaseStatus
    sha256: str
    author: str
    summary: str
    created_at: datetime


class ReleaseDetail(ReleaseSummary):
    snapshot: dict[str, Any]


def _summary(record: rel.ReleaseRecord, status: rel.ReleaseStatus) -> ReleaseSummary:
    return ReleaseSummary(**record.model_dump(exclude={"snapshot"}), status=status)


def _detail(record: rel.ReleaseRecord, status: rel.ReleaseStatus) -> ReleaseDetail:
    return ReleaseDetail(**record.model_dump(), status=status)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/releases")
def list_releases(files: FilesDep) -> list[ReleaseSummary]:
    return [_summary(r, s) for r, s in rel.list_releases(files)]


@app.get("/api/releases/active")
def get_active_release(files: FilesDep) -> ReleaseDetail:
    record = rel.active_release(files)
    if record is None:
        raise HTTPException(
            status_code=404,
            detail="engine/config/release.json nie odpowiada żadnemu opublikowanemu wydaniu",
        )
    return _detail(record, rel.ReleaseStatus.ACTIVE)


@app.get("/api/releases/{version}")
def get_release_by_version(version: str, files: FilesDep) -> ReleaseDetail:
    try:
        record = rel.get_release(files, version)
    except rel.ReleaseError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e
    if record is None:
        raise HTTPException(status_code=404, detail=f"Nie ma wydania {version}")
    return _detail(record, rel.status_of(record, rel.active_sha256(files)))


@app.get("/api/config/draft")
def get_draft_config(files: FilesDep) -> dict[str, Any]:
    """Bieżąca konfiguracja z `config/seed/*.yaml` w formacie `release.json` (jeszcze nieopublikowana)."""
    try:
        return rel.build_draft(files).model_dump(mode="json")
    except rel.ReleaseError as e:
        raise HTTPException(status_code=409, detail=str(e)) from e


class ActiveConfig(BaseModel):
    source: str
    published_version: str | None
    snapshot: dict[str, Any]


@app.get("/api/config/active")
def get_active_config(files: FilesDep, release: ReleaseDep) -> ActiveConfig:
    """Konfiguracja, której używa silnik (CLI i GUI): `engine/config/release.json`."""
    path = active_config_path()
    record = rel.active_release(files)
    return ActiveConfig(
        source=str(path.relative_to(REPO_ROOT)) if path.is_relative_to(REPO_ROOT) else str(path),
        published_version=record.version if record else None,
        snapshot=release.model_dump(mode="json"),
    )


@app.get("/api/llm-providers")
def list_llm_providers(files: FilesDep) -> list[rel.ProviderInfo]:
    try:
        return rel.load_providers(files)
    except rel.ReleaseError as e:
        raise HTTPException(status_code=409, detail=str(e)) from e


@app.get("/api/llm-models")
def list_llm_models(files: FilesDep) -> list[rel.ModelInfo]:
    try:
        return rel.load_models(files)
    except rel.ReleaseError as e:
        raise HTTPException(status_code=409, detail=str(e)) from e


def _document_type(release: Any, code: str) -> Any:
    dt = next((d for d in release.document_types if d.code == code), None)
    if dt is None:
        raise HTTPException(status_code=404, detail=f"Nie ma typu dokumentu {code}")
    return dt


@app.get("/api/document-types/{code}/llm-schemas")
def get_llm_schemas(code: str, release: ReleaseDep) -> list[dict[str, Any]]:
    """Schemat JSON odpowiedzi, który silnik wysyła do LLM dla każdej grupy ekstrakcji."""
    from odwolania2json.assemble import build_tree, json_schema

    dt = _document_type(release, code)
    out = []
    for g in dt.groups:
        fields = [f for f in dt.fields if f.group == g.name and not f.derive]
        if not fields:
            continue
        lists = [ld for ld in dt.lists if any(f.path.startswith(ld.path + "[]") for f in fields)]
        out.append({
            "group": g.name,
            "llm_profile": release.llm_profile(g.llm_profile).id,
            "fields": [f.path for f in fields],
            "schema": json_schema(build_tree(fields), lists),
        })
    return out


@app.get("/api/document-types/{code}/source", response_class=PlainTextResponse)
def get_document_type_source(code: str, files: FilesDep) -> str:
    """Plik YAML typu dokumentu z `config/seed/document_types` (konfiguracja robocza)."""
    import yaml

    for path in sorted((files.seed_dir / "document_types").glob("*.yaml")):
        text = path.read_text(encoding="utf-8")
        try:
            data = yaml.safe_load(text) or {}
        except yaml.YAMLError:
            continue
        if isinstance(data, dict) and data.get("code") == code:
            return text
    raise HTTPException(status_code=404, detail=f"Nie ma pliku YAML typu {code}")


class LlmStatus(BaseModel):
    enabled: bool
    profile: str
    model: str | None
    base_url: str
    key: str


class SystemStatus(BaseModel):
    version: str
    release: str
    published_release: str | None
    docling_version: str | None
    llm: LlmStatus
    pending_documents: int
    data_dir: str


@app.get("/api/system")
def system_status(files: FilesDep, store: StoreDep, processor: ProcessorDep, release: ReleaseDep) -> SystemStatus:
    from odwolania2json.llm import LlmClient

    profile = release.llm_profile(None)
    client = LlmClient(profile, None)
    enabled = client.enabled and not os.environ.get("O2J_NO_LLM")
    try:
        docling = importlib.metadata.version("docling")
    except importlib.metadata.PackageNotFoundError:
        docling = None
    record = rel.active_release(files)
    return SystemStatus(
        version=__version__,
        release=release.version,
        published_release=record.version if record else None,
        docling_version=docling,
        llm=LlmStatus(enabled=enabled, profile=profile.id, model=client.model, base_url=client.base_url,
                      key=client.key_source()),
        pending_documents=processor.pending,
        data_dir=str(store.root),
    )


# --- sprawy ------------------------------------------------------------------------------------


class DocumentView(BaseModel):
    id: str
    file_name: str
    output_file_name: str
    size: int
    status: DocStatus
    doc_type: str | None
    pages: int | None
    scanned: bool | None
    release: str | None
    errors: list[str]
    seconds: float | None
    processed_at: datetime | None
    reviewed_at: datetime | None
    approved_at: datetime | None
    result: Any = None
    review: Any = None
    validation: dict[str, list[str]] = {}


class CaseView(BaseModel):
    id: str
    name: str
    created_at: datetime
    documents: list[DocumentView]


class CreatedCase(BaseModel):
    case: CaseView
    rejected: list[str]


def _document_view(store: CaseStore, release: Any, case_id: str, doc: DocumentRecord) -> DocumentView:
    result = review = None
    if doc.status not in PENDING:
        result = store.read_json(store.output_path(case_id, doc))
        review = store.read_json(store.review_path(case_id, doc))
    current = review if review is not None else result
    validation = validate_result(release, doc.doc_type, current) if doc.status == DocStatus.DONE else {}
    return DocumentView(**doc.model_dump(), output_file_name=doc.output_file_name, result=result, review=review,
                        validation=validation)


def _case_view(store: CaseStore, release: Any, record: CaseRecord) -> CaseView:
    return CaseView(id=record.id, name=record.name, created_at=record.created_at,
                    documents=[_document_view(store, release, record.id, d) for d in record.documents])


def _case(store: CaseStore, case_id: str) -> CaseRecord:
    try:
        store.case_dir(case_id)
    except CaseError:
        raise HTTPException(status_code=404, detail=f"Nie ma sprawy {case_id}") from None
    record = store.get(case_id)
    if record is None:
        raise HTTPException(status_code=404, detail=f"Nie ma sprawy {case_id}")
    return record


def _doc(record: CaseRecord, doc_id: str) -> DocumentRecord:
    doc = record.document(doc_id)
    if doc is None:
        raise HTTPException(status_code=404, detail=f"Nie ma dokumentu {doc_id} w sprawie {record.id}")
    return doc


@app.get("/api/cases")
def list_cases(store: StoreDep, release: ReleaseDep) -> list[CaseView]:
    return [_case_view(store, release, r) for r in store.list()]


@app.post("/api/cases", status_code=201)
async def create_case(
    store: StoreDep,
    processor: ProcessorDep,
    release: ReleaseDep,
    files: Annotated[list[UploadFile], File(description="pliki PDF albo archiwa ZIP z PDF-ami")],
    name: Annotated[str, Form()] = "",
) -> CreatedCase:
    uploads: list[tuple[str, bytes]] = []
    too_big: list[str] = []
    for f in files:
        fname = f.filename or "dokument.pdf"
        limit = MAX_ZIP_TOTAL_BYTES if fname.lower().endswith(".zip") else MAX_FILE_BYTES
        data = await f.read(limit + 1)
        if len(data) > limit:
            too_big.append(f"{fname}: plik większy niż {limit // 2**20} MB")
            continue
        uploads.append((fname, data))
    pdfs, rejected = collect_pdfs(uploads)
    rejected = too_big + rejected
    if not pdfs:
        raise HTTPException(status_code=422, detail={"message": "Brak plików PDF do przetworzenia.", "rejected": rejected})
    try:
        record = store.create(name, pdfs)
    except CaseError as e:
        raise HTTPException(status_code=422, detail={"message": str(e), "rejected": rejected}) from e
    for doc in record.documents:
        processor.enqueue(record.id, doc.id)
    return CreatedCase(case=_case_view(store, release, record), rejected=rejected)


@app.get("/api/cases/{case_id}")
def get_case(case_id: str, store: StoreDep, release: ReleaseDep) -> CaseView:
    return _case_view(store, release, _case(store, case_id))


@app.delete("/api/cases/{case_id}", status_code=204)
def delete_case(case_id: str, store: StoreDep) -> Response:
    record = _case(store, case_id)
    if any(d.status in PENDING for d in record.documents):
        raise HTTPException(status_code=409, detail="Sprawa jest w trakcie przetwarzania. Spróbuj po jego zakończeniu.")
    store.delete(case_id)
    return Response(status_code=204)


@app.post("/api/cases/{case_id}/reprocess")
def reprocess_case(case_id: str, store: StoreDep, processor: ProcessorDep, release: ReleaseDep) -> CaseView:
    """Przetwarza dokumenty sprawy od nowa (np. po dodaniu klucza API). Usuwa poprawki i zatwierdzenia."""
    record = _case(store, case_id)
    if any(d.status in PENDING for d in record.documents):
        raise HTTPException(status_code=409, detail="Sprawa jest już w trakcie przetwarzania.")
    for doc in record.documents:
        store.review_path(case_id, doc).unlink(missing_ok=True)
        store.update_document(case_id, doc.id, status=DocStatus.QUEUED, reviewed_at=None, approved_at=None)
        processor.enqueue(case_id, doc.id)
    store.audit("sprawa_przetworzona_ponownie", case_id, documents=len(record.documents))
    return _case_view(store, release, _case(store, case_id))


@app.get("/api/cases/{case_id}/results.zip")
def download_results(case_id: str, store: StoreDep) -> Response:
    """Pliki JSON sprawy w układzie katalogu output (`<sprawa>/<plik>.json`), z poprawkami człowieka."""
    record = _case(store, case_id)
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for doc in record.documents:
            for path in (store.review_path(case_id, doc), store.output_path(case_id, doc)):
                if path.is_file():
                    zf.writestr(f"{case_id}/{doc.output_file_name}", path.read_bytes())
                    break
    return Response(buf.getvalue(), media_type="application/zip",
                    headers={"Content-Disposition": f'attachment; filename="{case_id}.zip"'})


@app.get("/api/cases/{case_id}/documents/{doc_id}/pdf")
def get_pdf(case_id: str, doc_id: str, store: StoreDep) -> FileResponse:
    record = _case(store, case_id)
    path = store.input_path(case_id, _doc(record, doc_id))
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Brak pliku PDF")
    return FileResponse(path, media_type="application/pdf")


@app.get("/api/cases/{case_id}/documents/{doc_id}/markdown", response_class=PlainTextResponse)
def get_markdown(case_id: str, doc_id: str, store: StoreDep) -> str:
    record = _case(store, case_id)
    path = store.markdown_path(case_id, _doc(record, doc_id))
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Dokument nie został jeszcze skonwertowany")
    return path.read_text(encoding="utf-8")


@app.get("/api/cases/{case_id}/documents/{doc_id}/trace")
def get_trace(case_id: str, doc_id: str, store: StoreDep) -> Any:
    record = _case(store, case_id)
    trace = store.read_json(store.trace_path(case_id, _doc(record, doc_id)))
    if trace is None:
        raise HTTPException(status_code=404, detail="Dokument nie został jeszcze przetworzony")
    return trace


class ReviewIn(BaseModel):
    result: dict[str, Any]
    approved: bool = False


def _changed_keys(release: Any, doc_type: str | None, before: Any, after: Any) -> list[str]:
    from odwolania2json.assemble import build_tree, flatten

    dt = next((d for d in release.document_types if d.code == doc_type), None)
    if dt is None:
        return []
    tree = build_tree(dt.fields)
    a = flatten(tree, before) if isinstance(before, dict) else {}
    b = flatten(tree, after)
    return sorted(k for k in set(a) | set(b) if a.get(k) != b.get(k))


@app.put("/api/cases/{case_id}/documents/{doc_id}/review")
def save_review(case_id: str, doc_id: str, body: ReviewIn, store: StoreDep, release: ReleaseDep) -> DocumentView:
    """Zapisuje wynik po weryfikacji człowieka (poprawki pól i zatwierdzenie)."""
    record = _case(store, case_id)
    doc = _doc(record, doc_id)
    if doc.status != DocStatus.DONE:
        raise HTTPException(status_code=409, detail="Poprawiać można tylko przetworzony dokument obsługiwanego typu.")
    previous = store.read_json(store.review_path(case_id, doc))
    if previous is None:
        previous = store.read_json(store.output_path(case_id, doc))
    changed = _changed_keys(release, doc.doc_type, previous, body.result)
    store.write_file(store.review_path(case_id, doc), json.dumps(body.result, ensure_ascii=False, indent=2) + "\n")
    now = datetime.now(UTC).replace(microsecond=0)
    approved_at = (doc.approved_at or now) if body.approved else None
    updated = store.update_document(case_id, doc_id, reviewed_at=now, approved_at=approved_at)
    if changed:
        store.audit("dokument_poprawiony", case_id, doc_id, fields=changed[:50])
    if body.approved and doc.approved_at is None:
        store.audit("dokument_zatwierdzony", case_id, doc_id)
    if not body.approved and doc.approved_at is not None:
        store.audit("zatwierdzenie_cofniete", case_id, doc_id)
    assert updated is not None
    return _document_view(store, release, case_id, updated)


@app.delete("/api/cases/{case_id}/documents/{doc_id}/review")
def discard_review(case_id: str, doc_id: str, store: StoreDep, release: ReleaseDep) -> DocumentView:
    """Przywraca wynik silnika: usuwa poprawki i zatwierdzenie."""
    record = _case(store, case_id)
    doc = _doc(record, doc_id)
    store.review_path(case_id, doc).unlink(missing_ok=True)
    updated = store.update_document(case_id, doc_id, reviewed_at=None, approved_at=None)
    store.audit("poprawki_odrzucone", case_id, doc_id)
    assert updated is not None
    return _document_view(store, release, case_id, updated)


@app.get("/api/audit")
def list_audit(store: StoreDep, limit: int = 200) -> list[dict[str, Any]]:
    return store.audit_entries(max(1, min(limit, 2000)))


# --- interfejs graficzny ----------------------------------------------------------------------

if STATIC_DIR.is_dir():
    _static_root = STATIC_DIR.resolve()

    @app.get("/{path:path}", include_in_schema=False)
    def spa(path: str) -> FileResponse:
        if path == "api" or path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Nie ma takiego zasobu API")
        target = (_static_root / path).resolve()
        if path and target.is_file() and target.is_relative_to(_static_root):
            # Pliki z hashem w nazwie (main-XYZ.js) można trzymać w cache przeglądarki długo.
            return FileResponse(target)
        return FileResponse(_static_root / "index.html", headers={"Cache-Control": "no-cache"})
