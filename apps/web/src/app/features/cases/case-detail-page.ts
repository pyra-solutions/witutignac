import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { findDocumentType } from '../../core/config/mock-config';
import { CasesStore } from '../../core/data/cases.store';
import { EmptyState } from '../../shared/ui/empty-state';
import { PageHeader } from '../../shared/ui/page-header';
import { StatusBadge } from '../../shared/ui/status-badge';

@Component({
  selector: 'app-case-detail-page',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressBarModule, PageHeader, StatusBadge, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      @if (store.loading()) {
        <mat-progress-bar mode="indeterminate" aria-label="Wczytywanie sprawy" />
      } @else if (record(); as c) {
        <app-page-header
          [heading]="'Sprawa ' + c.id"
          [description]="c.procurementTitle ?? ''"
          [breadcrumbs]="[{ label: 'Sprawy', link: '/sprawy' }, { label: c.id }]"
        />

        <section class="card" aria-labelledby="parties-heading">
          <h2 id="parties-heading">Strony i postępowanie</h2>
          <dl class="definition-list">
            <dt>Odwołujący</dt>
            <dd>{{ c.appellant ?? '—' }}</dd>
            <dt>Zamawiający</dt>
            <dd>{{ c.contractingAuthority ?? '—' }}</dd>
            <dt>Źródło plików</dt>
            <dd class="mono">{{ c.source }}</dd>
          </dl>
        </section>

        <section class="card card--flush" aria-labelledby="docs-heading">
          <h2 id="docs-heading" class="section-title">Dokumenty ({{ c.documents.length }})</h2>
          <div class="table-wrap">
            <table class="app-table">
              <thead>
                <tr>
                  <th scope="col">Plik</th>
                  <th scope="col">Rozpoznany typ</th>
                  <th scope="col" class="num">Pola</th>
                  <th scope="col" class="num">Ostrzeżenia</th>
                  <th scope="col">Plik wynikowy</th>
                  <th scope="col">Status</th>
                  <th scope="col"><span class="visually-hidden">Akcje</span></th>
                </tr>
              </thead>
              <tbody>
                @for (doc of documents(); track doc.id) {
                  <tr>
                    <td>{{ doc.fileName }}</td>
                    <td>{{ doc.typeName }}</td>
                    <td class="num">{{ doc.fieldCount }}</td>
                    <td class="num">{{ doc.warnings }}</td>
                    <td class="mono">{{ doc.outputFileName }}</td>
                    <td><app-status-badge [status]="doc.status" /></td>
                    <td>
                      <a mat-stroked-button [routerLink]="['/sprawy', c.id, 'dokumenty', doc.id]">
                        Weryfikuj<span class="visually-hidden"> {{ doc.fileName }}</span>
                      </a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      } @else {
        <app-empty-state icon="search" heading="Nie znaleziono sprawy">
          Sprawa „{{ caseId() }}” nie istnieje. <a routerLink="/sprawy">Wróć do listy spraw</a>.
        </app-empty-state>
      }
    </div>
  `,
  styles: `
    .section-title {
      padding: 16px 24px;
      border-bottom: 1px solid var(--app-border);
    }
  `,
})
export class CaseDetailPage {
  protected readonly store = inject(CasesStore);
  readonly caseId = input.required<string>();

  protected readonly record = computed(() => this.store.cases().find((c) => c.id === this.caseId()));

  protected readonly documents = computed(() =>
    (this.record()?.documents ?? []).map((doc) => ({
      ...doc,
      typeName: findDocumentType(doc.typeCode)?.name ?? doc.typeCode,
      fieldCount: doc.fields.length,
      warnings: doc.fields.reduce((sum, f) => sum + f.warnings.length, 0),
    })),
  );
}
