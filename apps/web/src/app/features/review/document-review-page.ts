import { BreakpointObserver } from '@angular/cdk/layout';
import { NgTemplateOutlet } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { findDocumentType } from '../../core/config/mock-config';
import { CasesStore } from '../../core/data/cases.store';
import { EmptyState } from '../../shared/ui/empty-state';
import { Notice } from '../../shared/ui/notice';
import { Breadcrumb, PageHeader } from '../../shared/ui/page-header';
import { StatusBadge } from '../../shared/ui/status-badge';
import { FieldList } from './field-list';
import { PdfViewer } from './pdf-viewer';

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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './document-review-page.html',
  styleUrl: './document-review-page.scss',
})
export class DocumentReviewPage {
  readonly caseId = input.required<string>();
  readonly documentId = input.required<string>();

  protected readonly store = inject(CasesStore);
  private readonly http = inject(HttpClient);

  protected readonly isWide = toSignal(
    inject(BreakpointObserver)
      .observe('(min-width: 1280px)')
      .pipe(map((s) => s.matches)),
    { initialValue: true },
  );

  protected readonly doc = computed(() =>
    this.store.cases().find((c) => c.id === this.caseId())?.documents.find((d) => d.id === this.documentId()),
  );
  protected readonly definition = computed(() => findDocumentType(this.doc()?.typeCode ?? ''));
  protected readonly typeName = computed(() => this.definition()?.name ?? 'Dokument');

  protected readonly selectedKey = signal<string | null>(null);
  protected readonly sourceFound = signal<boolean | null>(null);
  protected readonly tabIndex = signal(TAB_FIELDS);
  protected readonly markdown = signal<string | null>(null);

  protected readonly candidates = computed(() => {
    const key = this.selectedKey();
    return this.doc()?.fields.find((f) => f.key === key)?.candidates ?? [];
  });

  protected readonly stats = computed(() => {
    const fields = this.doc()?.fields ?? [];
    return {
      fields: fields.length,
      warnings: fields.filter((f) => f.warnings.length > 0).length,
      corrected: fields.filter((f) => f.corrected).length,
    };
  });

  protected readonly json = computed(() => JSON.stringify(this.doc()?.result ?? null, null, 2));

  protected readonly breadcrumbs = computed<Breadcrumb[]>(() => [
    { label: 'Sprawy', link: '/sprawy' },
    { label: this.caseId(), link: `/sprawy/${this.caseId()}` },
    { label: this.doc()?.fileName ?? this.documentId() },
  ]);

  /** Adres zmienia się tylko przy zmianie dokumentu, nie przy poprawkach pól. */
  private readonly markdownUrl = computed(() => this.doc()?.markdownUrl ?? null);

  constructor() {
    // Nowy dokument: czyścimy zaznaczenie i wczytujemy Markdown z Docling.
    effect((onCleanup) => {
      const url = this.markdownUrl();
      this.selectedKey.set(null);
      this.markdown.set(null);
      if (!url) return;
      const sub = this.http.get(url, { responseType: 'text' }).subscribe({
        next: (text) => this.markdown.set(text),
        error: () => this.markdown.set(''),
      });
      onCleanup(() => sub.unsubscribe());
    });
  }

  protected select(key: string): void {
    this.sourceFound.set(null);
    this.selectedKey.set(this.selectedKey() === key ? null : key);
    if (!this.isWide() && this.selectedKey()) this.tabIndex.set(TAB_DOCUMENT);
  }

  protected save(change: { key: string; raw: string }): void {
    this.store.updateField(this.caseId(), this.documentId(), change.key, change.raw);
  }

  protected approve(): void {
    this.store.approveDocument(this.caseId(), this.documentId());
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
}
