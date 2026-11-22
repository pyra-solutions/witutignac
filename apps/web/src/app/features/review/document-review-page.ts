import { BreakpointObserver } from '@angular/cdk/layout';
import { NgTemplateOutlet } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { TraceDto } from '../../core/api/api.models';
import { apiErrorMessage } from '../../core/api/errors';
import { ConfigStore } from '../../core/config/config.store';
import { CasesStore } from '../../core/data/cases.store';
import { flattenResult, parseInput, setValueAtKey } from '../../core/extraction/flatten';
import { EmptyState } from '../../shared/ui/empty-state';
import { Notice } from '../../shared/ui/notice';
import { Breadcrumb, PageHeader } from '../../shared/ui/page-header';
import { StatusBadge } from '../../shared/ui/status-badge';
import { FieldList } from './field-list';
import { PdfViewer } from './pdf-viewer';
import { TraceSummary } from './trace-summary';

const TAB_FIELDS = 0;
const TAB_DOCUMENT = 1;

@Component({
  selector: 'app-document-review-page',
  imports: [
    NgTemplateOutlet,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTabsModule,
    PageHeader,
    Notice,
    StatusBadge,
    EmptyState,
    FieldList,
    PdfViewer,
    TraceSummary,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './document-review-page.html',
  styleUrl: './document-review-page.scss',
})
export class DocumentReviewPage {
  readonly caseId = input.required<string>();
  readonly documentId = input.required<string>();

  protected readonly store = inject(CasesStore);
  protected readonly config = inject(ConfigStore);
  private readonly http = inject(HttpClient);

  protected readonly isWide = toSignal(
    inject(BreakpointObserver)
      .observe('(min-width: 1280px)')
      .pipe(map((s) => s.matches)),
    { initialValue: true },
  );

  protected readonly record = computed(() => this.store.findCase(this.caseId()));
  protected readonly doc = computed(() => this.store.findDocument(this.caseId(), this.documentId()));
  protected readonly definition = computed(() => this.config.documentType(this.doc()?.typeCode));
  protected readonly typeName = computed(() => this.definition()?.name ?? 'Dokument');
  protected readonly processed = computed(() => {
    const status = this.doc()?.status;
    return status !== undefined && status !== 'w-kolejce' && status !== 'przetwarzanie';
  });

  protected readonly selectedKey = signal<string | null>(null);
  protected readonly sourceFound = signal<boolean | null>(null);
  protected readonly tabIndex = signal(TAB_FIELDS);
  protected readonly markdown = signal<string | null>(null);
  protected readonly trace = signal<TraceDto | null>(null);
  protected readonly saving = signal(false);
  protected readonly saveError = signal<string | null>(null);

  protected readonly fields = computed(() => {
    const doc = this.doc();
    const definition = this.definition();
    if (!doc || !definition || doc.status === 'nieobslugiwany' || !doc.result) return [];
    return flattenResult(definition, doc.result, {
      trace: this.trace(),
      original: doc.reviewed ? doc.engineResult : undefined,
      validation: doc.validation,
    });
  });

  protected readonly candidates = computed(() => {
    const key = this.selectedKey();
    return this.fields().find((f) => f.key === key)?.candidates ?? [];
  });

  protected readonly stats = computed(() => {
    const fields = this.fields();
    return {
      fields: fields.length,
      filled: fields.filter((f) => f.value !== null && f.value !== '').length,
      warnings: fields.filter((f) => f.warnings.length > 0).length,
      corrected: fields.filter((f) => f.corrected).length,
      llm: fields.filter((f) => f.source === 'llm').length,
      rules: fields.filter((f) => f.source === 'rules').length,
    };
  });

  protected readonly json = computed(() => JSON.stringify(this.doc()?.result ?? {}, null, 2));

  protected readonly breadcrumbs = computed<Breadcrumb[]>(() => [
    { label: 'Sprawy', link: '/sprawy' },
    { label: this.record()?.name ?? this.caseId(), link: `/sprawy/${this.caseId()}` },
    { label: this.doc()?.fileName ?? this.documentId() },
  ]);

  /** Klucz zmienia się przy zmianie dokumentu albo po ponownym przetworzeniu, nie przy poprawkach pól. */
  private readonly sourceKey = computed(() => {
    const doc = this.doc();
    return doc && this.processed() ? `${doc.markdownUrl}|${doc.traceUrl}|${doc.processedAt}` : null;
  });

  constructor() {
    effect((onCleanup) => {
      const key = this.sourceKey();
      const doc = untracked(this.doc);
      this.selectedKey.set(null);
      this.markdown.set(null);
      this.trace.set(null);
      if (!key || !doc) return;
      const md = this.http.get(doc.markdownUrl, { responseType: 'text' }).subscribe({
        next: (text) => this.markdown.set(text),
        error: () => this.markdown.set(''),
      });
      const tr = this.http.get<TraceDto>(doc.traceUrl).subscribe({
        next: (trace) => this.trace.set(trace),
        error: () => this.trace.set(null),
      });
      onCleanup(() => {
        md.unsubscribe();
        tr.unsubscribe();
      });
    });
  }

  protected select(key: string): void {
    this.sourceFound.set(null);
    this.selectedKey.set(this.selectedKey() === key ? null : key);
    if (!this.isWide() && this.selectedKey()) this.tabIndex.set(TAB_DOCUMENT);
  }

  protected async save(change: { key: string; raw: string }): Promise<void> {
    const doc = this.doc();
    const field = this.fields().find((f) => f.key === change.key);
    const definition = this.definition()?.fields.find((d) => d.path === field?.path);
    if (!doc || !field || !definition) return;
    const value = parseInput(definition, change.raw);
    if (value === field.value) return;
    await this.persist(() => this.store.saveReview(this.caseId(), doc.id, setValueAtKey(doc.result, change.key, value), false));
  }

  protected async approve(approved: boolean): Promise<void> {
    const doc = this.doc();
    if (!doc) return;
    await this.persist(() => this.store.saveReview(this.caseId(), doc.id, doc.result, approved));
  }

  protected async discard(): Promise<void> {
    if (!confirm('Przywrócić wynik silnika? Poprawki i zatwierdzenie tego dokumentu zostaną usunięte.')) return;
    await this.persist(() => this.store.discardReview(this.caseId(), this.documentId()));
  }

  protected download(): void {
    const doc = this.doc();
    if (!doc) return;
    const blob = new Blob([`${this.json()}\n`], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.outputFileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  private async persist(action: () => Promise<void>): Promise<void> {
    this.saving.set(true);
    this.saveError.set(null);
    try {
      await action();
    } catch (e) {
      this.saveError.set(apiErrorMessage(e, 'Nie udało się zapisać zmian.'));
    } finally {
      this.saving.set(false);
    }
  }
}
