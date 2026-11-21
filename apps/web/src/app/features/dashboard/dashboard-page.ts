import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { CONFIG_RELEASES, DOCUMENT_TYPES, findDocumentType } from '../../core/config/mock-config';
import { CasesStore } from '../../core/data/cases.store';
import { Notice } from '../../shared/ui/notice';
import { PageHeader } from '../../shared/ui/page-header';
import { StatusBadge } from '../../shared/ui/status-badge';

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressBarModule, PageHeader, Notice, StatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header heading="Pulpit" description="Stan spraw i dokumentów oraz aktywna konfiguracja ekstrakcji.">
        <a actions mat-flat-button routerLink="/sprawy/nowa">
          <mat-icon svgIcon="upload_file" aria-hidden="true" />Nowa sprawa
        </a>
      </app-page-header>

      <app-notice>
        Makieta: sprawy pochodzą z danych treningowych organizatora (przykłady 01–03), a wartości pól ze wzorcowych
        plików JSON. Silnik ekstrakcji nie jest jeszcze podłączony.
      </app-notice>

      @if (store.loading()) {
        <mat-progress-bar mode="indeterminate" aria-label="Wczytywanie spraw" />
      }

      <section class="kpis" aria-label="Podsumowanie">
        <div class="card kpi">
          <span class="kpi-label">Sprawy</span>
          <span class="kpi-value">{{ store.cases().length }}</span>
        </div>
        <div class="card kpi">
          <span class="kpi-label">Dokumenty</span>
          <span class="kpi-value">{{ store.documents().length }}</span>
        </div>
        <div class="card kpi">
          <span class="kpi-label">Do weryfikacji</span>
          <span class="kpi-value">{{ store.toReview().length }}</span>
          <span class="kpi-note">ostrzeżenia walidacji, np. sumy kontrolne</span>
        </div>
        <div class="card kpi">
          <span class="kpi-label">Konfiguracja</span>
          <span class="kpi-value kpi-value--text">{{ release.version }} · {{ release.status }}</span>
          <span class="kpi-note">{{ typeCount }} typy dokumentów</span>
        </div>
      </section>

      <section class="card card--flush" aria-labelledby="review-heading">
        <div class="section-head">
          <h2 id="review-heading">Dokumenty do weryfikacji</h2>
          <a mat-button routerLink="/sprawy">Wszystkie sprawy</a>
        </div>
        @if (reviewRows().length) {
          <div class="table-wrap">
            <table class="app-table">
              <thead>
                <tr>
                  <th scope="col">Dokument</th>
                  <th scope="col">Sprawa</th>
                  <th scope="col">Typ</th>
                  <th scope="col" class="num">Ostrzeżenia</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                @for (row of reviewRows(); track row.caseId + row.id) {
                  <tr>
                    <td>
                      <a [routerLink]="['/sprawy', row.caseId, 'dokumenty', row.id]">{{ row.fileName }}</a>
                    </td>
                    <td>{{ row.caseId }}</td>
                    <td>{{ row.typeName }}</td>
                    <td class="num">{{ row.warnings }}</td>
                    <td><app-status-badge [status]="row.status" /></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else if (!store.loading()) {
          <p class="empty">Brak dokumentów z ostrzeżeniami.</p>
        }
      </section>
    </div>
  `,
  styles: `
    .kpis {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
    }
    @media (max-width: 1023px) {
      .kpis {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    @media (max-width: 359px) {
      .kpis {
        grid-template-columns: minmax(0, 1fr);
      }
    }
    .kpi {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .kpi-label {
      color: var(--app-text-muted);
      font-weight: 600;
    }
    .kpi-value {
      font-size: 2rem;
      font-weight: 700;
      line-height: 1.2;
      font-variant-numeric: tabular-nums;
    }
    .kpi-value--text {
      font-size: 1.25rem;
      padding: 6px 0;
    }
    .kpi-note {
      font-size: 0.875rem;
      color: var(--app-text-muted);
    }
    .section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 16px 24px;
      border-bottom: 1px solid var(--app-border);
    }
    .empty {
      padding: 24px;
      color: var(--app-text-muted);
    }
  `,
})
export class DashboardPage {
  protected readonly store = inject(CasesStore);
  protected readonly release = CONFIG_RELEASES[0];
  protected readonly typeCount = DOCUMENT_TYPES.length;

  protected readonly reviewRows = computed(() =>
    this.store.toReview().map((doc) => ({
      id: doc.id,
      caseId: doc.caseId,
      fileName: doc.fileName,
      typeName: findDocumentType(doc.typeCode)?.name ?? doc.typeCode,
      warnings: doc.fields.reduce((sum, f) => sum + f.warnings.length, 0),
      status: doc.status,
    })),
  );
}
