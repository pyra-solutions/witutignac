import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { CasesStore } from '../../core/data/cases.store';
import { formatDateTime } from '../../core/format';
import { EmptyState } from '../../shared/ui/empty-state';
import { PageHeader } from '../../shared/ui/page-header';

@Component({
  selector: 'app-case-list-page',
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    PageHeader,
    EmptyState,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header heading="Sprawy" description="Sprawy wgrane do aplikacji i stan weryfikacji ich dokumentów.">
        <a actions mat-flat-button routerLink="/sprawy/nowa">
          <mat-icon svgIcon="upload_file" aria-hidden="true" />Nowa sprawa
        </a>
      </app-page-header>

      <section class="card card--flush" aria-label="Lista spraw">
        <div class="toolbar">
          <mat-form-field class="search">
            <mat-label>Szukaj sprawy, odwołującego lub zamawiającego</mat-label>
            <mat-icon matPrefix svgIcon="search" aria-hidden="true" />
            <input matInput type="search" [value]="query()" (input)="query.set($any($event.target).value)" />
          </mat-form-field>
          <span class="muted" aria-live="polite">Wyniki: {{ rows().length }}</span>
        </div>

        @if (store.loading() && !store.cases().length) {
          <mat-progress-bar mode="indeterminate" aria-label="Wczytywanie spraw" />
        } @else if (store.error()) {
          <app-empty-state icon="error" heading="Błąd wczytywania">{{ store.error() }}</app-empty-state>
        } @else if (!store.cases().length) {
          <app-empty-state icon="upload_file" heading="Brak spraw">
            Dodaj pliki PDF sprawy na ekranie <a routerLink="/sprawy/nowa">Nowa sprawa</a>.
          </app-empty-state>
        } @else if (rows().length === 0) {
          <app-empty-state icon="search" heading="Brak wyników">Zmień kryteria wyszukiwania.</app-empty-state>
        } @else {
          <div class="table-wrap">
            <table class="app-table">
              <thead>
                <tr>
                  <th scope="col">Sprawa</th>
                  <th scope="col">Odwołujący</th>
                  <th scope="col">Zamawiający</th>
                  <th scope="col" class="num">Dokumenty</th>
                  <th scope="col" class="num">Do weryfikacji</th>
                  <th scope="col">Utworzona</th>
                </tr>
              </thead>
              <tbody>
                @for (row of rows(); track row.id) {
                  <tr>
                    <td>
                      <a [routerLink]="['/sprawy', row.id]">{{ row.name }}</a>
                      @if (row.processing) {
                        <span class="muted small">przetwarzanie: {{ row.done }} z {{ row.documents }}</span>
                      }
                    </td>
                    <td>{{ row.appellant ?? '—' }}</td>
                    <td>{{ row.contractingAuthority ?? '—' }}</td>
                    <td class="num">{{ row.documents }}</td>
                    <td class="num">{{ row.toReview }}</td>
                    <td>{{ date(row.createdAt) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>
    </div>
  `,
  styles: `
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px 24px;
      padding: 16px 24px;
      border-bottom: 1px solid var(--app-border);
    }
    .search {
      flex: 1 1 320px;
      max-width: 560px;
    }
    .small {
      display: block;
      font-size: 0.8125rem;
    }
  `,
})
export class CaseListPage {
  protected readonly store = inject(CasesStore);
  protected readonly query = signal('');
  protected readonly date = formatDateTime;

  protected readonly rows = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.store
      .cases()
      .filter((c) =>
        [c.id, c.name, c.appellant, c.contractingAuthority].some((v) => (v ?? '').toLowerCase().includes(q)),
      )
      .map((c) => ({
        id: c.id,
        name: c.name,
        appellant: c.appellant,
        contractingAuthority: c.contractingAuthority,
        documents: c.documents.length,
        done: c.documents.filter((d) => d.status !== 'w-kolejce' && d.status !== 'przetwarzanie').length,
        processing: c.processing,
        toReview: c.documents.filter((d) => d.status === 'do-weryfikacji').length,
        createdAt: c.createdAt,
      }));
  });
}
