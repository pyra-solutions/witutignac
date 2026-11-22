import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, firstValueFrom, tap } from 'rxjs';
import { CaseDto, CreatedCaseDto, DocumentDto, EngineDocStatus } from '../api/api.models';
import { apiErrorMessage } from '../api/errors';
import { CaseDocument, CaseRecord, DocumentStatus } from '../models/case.model';

const POLL_MS = 2000;

const STAGES: Partial<Record<EngineDocStatus, string>> = {
  queued: 'W kolejce',
  converting: 'Konwersja Docling i klasyfikacja',
  extracting: 'Ekstrakcja: reguły i LLM',
};

function statusOf(d: DocumentDto, warnings: number): DocumentStatus {
  switch (d.status) {
    case 'queued':
      return 'w-kolejce';
    case 'converting':
    case 'extracting':
      return 'przetwarzanie';
    case 'unsupported':
      return 'nieobslugiwany';
    case 'error':
      return 'blad';
    default:
      if (d.approved_at) return 'zatwierdzony';
      return warnings > 0 || d.errors.length > 0 ? 'do-weryfikacji' : 'gotowy';
  }
}

function pick(result: unknown, path: (string | number)[]): string | null {
  let node: unknown = result;
  for (const key of path) {
    if (node === null || typeof node !== 'object') return null;
    node = (node as Record<string | number, unknown>)[key];
  }
  return typeof node === 'string' ? node : null;
}

export function documentUrl(caseId: string, docId: string): string {
  return `/api/cases/${encodeURIComponent(caseId)}/documents/${encodeURIComponent(docId)}`;
}

export function toDocument(caseId: string, d: DocumentDto): CaseDocument {
  const base = documentUrl(caseId, d.id);
  const warningCount = Object.values(d.validation ?? {}).reduce((sum, w) => sum + w.length, 0);
  return {
    id: d.id,
    caseId,
    fileName: d.file_name,
    outputFileName: d.output_file_name,
    size: d.size,
    status: statusOf(d, warningCount),
    stage: STAGES[d.status] ?? null,
    typeCode: d.doc_type,
    pages: d.pages,
    scanned: d.scanned,
    release: d.release,
    errors: d.errors,
    seconds: d.seconds,
    processedAt: d.processed_at,
    approvedAt: d.approved_at,
    pdfUrl: `${base}/pdf`,
    markdownUrl: `${base}/markdown`,
    traceUrl: `${base}/trace`,
    engineResult: d.result ?? null,
    result: d.review ?? d.result ?? null,
    reviewed: d.review !== null && d.review !== undefined,
    validation: d.validation ?? {},
    warningCount,
  };
}

export function toCase(c: CaseDto): CaseRecord {
  const documents = c.documents.map((d) => toDocument(c.id, d));
  const appeal = documents.find((d) => d.typeCode === 'odwolanie')?.result;
  return {
    id: c.id,
    name: c.name,
    createdAt: c.created_at,
    appellant: pick(appeal, ['Odwolujacy', 0, 'nazwa']),
    contractingAuthority: pick(appeal, ['Zamawiajacy', 0, 'nazwa']),
    procurementTitle: pick(appeal, ['ZamowieniePubliczne', 'tytul']),
    documents,
    processing: documents.some((d) => d.status === 'w-kolejce' || d.status === 'przetwarzanie'),
  };
}

/** Sprawy z API backendu. W trakcie przetwarzania stan odświeża się co 2 s. */
@Injectable({ providedIn: 'root' })
export class CasesStore {
  private readonly http = inject(HttpClient);
  private readonly raw = signal<CaseDto[]>([]);
  private readonly tick = signal(0);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly cases = computed(() => this.raw().map(toCase));
  readonly documents = computed(() => this.cases().flatMap((c) => c.documents));
  readonly toReview = computed(() => this.documents().filter((d) => d.status === 'do-weryfikacji'));
  readonly processing = computed(() => this.cases().some((c) => c.processing));

  constructor() {
    void this.load();
    effect((onCleanup) => {
      this.tick();
      if (!this.processing()) return;
      const timer = setTimeout(() => void this.load(true), POLL_MS);
      onCleanup(() => clearTimeout(timer));
    });
  }

  async load(silent = false): Promise<void> {
    if (!silent) this.loading.set(true);
    try {
      this.raw.set(await firstValueFrom(this.http.get<CaseDto[]>('/api/cases')));
      this.error.set(null);
    } catch (e) {
      this.error.set(apiErrorMessage(e, 'Nie udało się wczytać spraw.'));
    } finally {
      this.loading.set(false);
      this.tick.update((n) => n + 1);
    }
  }

  findCase(caseId: string): CaseRecord | undefined {
    return this.cases().find((c) => c.id === caseId);
  }

  findDocument(caseId: string, documentId: string): CaseDocument | undefined {
    return this.findCase(caseId)?.documents.find((d) => d.id === documentId);
  }

  /** Wysyła pliki nowej sprawy; zdarzenia HTTP niosą postęp wysyłania. */
  upload(name: string, files: File[]): Observable<HttpEvent<CreatedCaseDto>> {
    const form = new FormData();
    form.append('name', name);
    for (const file of files) form.append('files', file, file.name);
    return this.http
      .post<CreatedCaseDto>('/api/cases', form, { reportProgress: true, observe: 'events' })
      .pipe(
        tap((event) => {
          if ('body' in event && event.body) this.putCase(event.body.case);
        }),
      );
  }

  /** Zapisuje wynik po weryfikacji (poprawki pól, zatwierdzenie). Ostrzeżenia przelicza silnik. */
  async saveReview(caseId: string, documentId: string, result: unknown, approved: boolean): Promise<void> {
    const doc = await firstValueFrom(
      this.http.put<DocumentDto>(`${documentUrl(caseId, documentId)}/review`, { result, approved }),
    );
    this.putDocument(caseId, doc);
  }

  /** Przywraca wynik silnika (usuwa poprawki i zatwierdzenie). */
  async discardReview(caseId: string, documentId: string): Promise<void> {
    const doc = await firstValueFrom(this.http.delete<DocumentDto>(`${documentUrl(caseId, documentId)}/review`));
    this.putDocument(caseId, doc);
  }

  async reprocess(caseId: string): Promise<void> {
    const c = await firstValueFrom(this.http.post<CaseDto>(`/api/cases/${encodeURIComponent(caseId)}/reprocess`, {}));
    this.putCase(c);
  }

  async deleteCase(caseId: string): Promise<void> {
    await firstValueFrom(this.http.delete(`/api/cases/${encodeURIComponent(caseId)}`));
    this.raw.update((cases) => cases.filter((c) => c.id !== caseId));
  }

  private putCase(c: CaseDto): void {
    this.raw.update((cases) => [c, ...cases.filter((x) => x.id !== c.id)].sort((a, b) => b.created_at.localeCompare(a.created_at)));
  }

  private putDocument(caseId: string, doc: DocumentDto): void {
    this.raw.update((cases) =>
      cases.map((c) => (c.id !== caseId ? c : { ...c, documents: c.documents.map((d) => (d.id === doc.id ? doc : d)) })),
    );
  }
}
