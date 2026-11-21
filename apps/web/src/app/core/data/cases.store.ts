import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { findDocumentType } from '../config/mock-config';
import { flattenResult, parseInput, setValueAtKey, warningsFor, candidatesFor } from '../extraction/flatten';
import { CaseDocument, CaseRecord, DocumentStatus, FieldResult } from '../models/case.model';

/**
 * Sprawy przykładowe: pliki z repozytorium organizatora (dane/przyklad_01–03),
 * skopiowane do public/mock. Wynik „ekstrakcji” w makiecie to wzorcowy JSON;
 * docelowo dane przyjdą z API NestJS.
 */
const MOCK_CASE_IDS = ['przyklad_01', 'przyklad_02', 'przyklad_03'];

const MOCK_DOCUMENTS = [
  { file: 'odwolanie.pdf', type: 'odwolanie', result: 'odwolanie.json' },
  { file: 'pelnomocnictwo.pdf', type: 'pelnomocnictwo', result: 'pelnomocnictwo.json' },
  { file: 'potwierdzenie_przelewu.pdf', type: 'przelew', result: 'przelew.json' },
] as const;

function stem(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '');
}

function statusFor(fields: FieldResult[]): DocumentStatus {
  return fields.some((f) => f.warnings.length > 0) ? 'do-weryfikacji' : 'gotowy';
}

function pick(result: unknown, path: (string | number)[]): string | null {
  let node: unknown = result;
  for (const key of path) {
    if (node === null || typeof node !== 'object') return null;
    node = (node as Record<string | number, unknown>)[key];
  }
  return typeof node === 'string' ? node : null;
}

@Injectable({ providedIn: 'root' })
export class CasesStore {
  private readonly http = inject(HttpClient);

  readonly cases = signal<CaseRecord[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly documents = computed(() => this.cases().flatMap((c) => c.documents));
  readonly toReview = computed(() => this.documents().filter((d) => d.status === 'do-weryfikacji'));

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const cases = await Promise.all(MOCK_CASE_IDS.map((id) => this.loadCase(id)));
      this.cases.set(cases);
    } catch {
      this.error.set('Nie udało się wczytać spraw przykładowych.');
    } finally {
      this.loading.set(false);
    }
  }

  findCase(caseId: string): CaseRecord | undefined {
    return this.cases().find((c) => c.id === caseId);
  }

  findDocument(caseId: string, documentId: string): CaseDocument | undefined {
    return this.findCase(caseId)?.documents.find((d) => d.id === documentId);
  }

  /** Poprawka człowieka: zmienia wartość pola i wynik JSON, przelicza ostrzeżenia. */
  updateField(caseId: string, documentId: string, key: string, raw: string): void {
    this.updateDocument(caseId, documentId, (doc) => {
      const definition = findDocumentType(doc.typeCode)?.fields;
      const fields = doc.fields.map((field) => {
        if (field.key !== key) return field;
        const fieldDef = definition?.find((d) => d.path === field.path);
        if (!fieldDef) return field;
        const value = parseInput(fieldDef, raw);
        return {
          ...field,
          value,
          warnings: warningsFor(fieldDef, value),
          candidates: candidatesFor(fieldDef, value),
          confidence: value === null ? null : 1,
          corrected: value !== field.originalValue,
        };
      });
      const changed = fields.find((f) => f.key === key);
      const result = changed ? setValueAtKey(doc.result, key, changed.value) : doc.result;
      return { ...doc, fields, result, status: statusFor(fields) };
    });
  }

  approveDocument(caseId: string, documentId: string): void {
    this.updateDocument(caseId, documentId, (doc) => ({ ...doc, status: 'zatwierdzony' }));
  }

  private updateDocument(caseId: string, documentId: string, change: (doc: CaseDocument) => CaseDocument): void {
    this.cases.update((cases) =>
      cases.map((c) =>
        c.id !== caseId ? c : { ...c, documents: c.documents.map((d) => (d.id === documentId ? change(d) : d)) },
      ),
    );
  }

  private async loadCase(caseId: string): Promise<CaseRecord> {
    const documents = await Promise.all(
      MOCK_DOCUMENTS.map(async (doc): Promise<CaseDocument> => {
        const base = `mock/${caseId}`;
        const result = await firstValueFrom(this.http.get<unknown>(`${base}/${doc.result}`));
        const definition = findDocumentType(doc.type);
        const fields = definition ? flattenResult(definition, result) : [];
        return {
          id: stem(doc.file),
          caseId,
          fileName: doc.file,
          outputFileName: `${stem(doc.file)}.json`,
          pdfUrl: `${base}/${doc.file}`,
          markdownUrl: `${base}/${stem(doc.file)}.docling.md`,
          typeCode: doc.type,
          status: statusFor(fields),
          result,
          fields,
        };
      }),
    );
    const appeal = documents.find((d) => d.typeCode === 'odwolanie')?.result;
    return {
      id: caseId,
      source: `dane/${caseId}`,
      appellant: pick(appeal, ['Odwolujacy', 0, 'nazwa']),
      contractingAuthority: pick(appeal, ['Zamawiajacy', 0, 'nazwa']),
      procurementTitle: pick(appeal, ['ZamowieniePubliczne', 'tytul']),
      documents,
    };
  }
}
