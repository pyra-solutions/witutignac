import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { ConfigStore } from '../../core/config/config.store';
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
      <app-page-header heading="Pulpit" description="Stan spraw i dokumentów, silnik ekstrakcji i aktywna konfiguracja.">
        <a actions mat-flat-button routerLink="/sprawy/nowa">
          <mat-icon svgIcon="upload_file" aria-hidden="true" />Nowa sprawa
        </a>
      </app-page-header>

      @if (config.error() || store.error(); as message) {
        <app-notice tone="warning">{{ message }}</app-notice>
      } @else if (system(); as s) {
        @if (!s.llm.enabled) {
          <app-notice tone="warning">
            Model językowy jest wyłączony: brak klucza API w pliku <span class="mono">.env</span> (zmienna
            <span class="mono">EDEN_AI_API_KEY</span>). Silnik działa na samych regułach i odczytuje mniej pól.
          </app-notice>
        }
      }

      @if (store.loading() || config.loading()) {
        <mat-progress-bar mode="indeterminate" aria-label="Wczytywanie" />
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
          <span class="kpi-note">ostrzeżenia walidatorów, np. sumy kontrolne NIP</span>
        </div>
        <div class="card kpi">
          <span class="kpi-label">Konfiguracja</span>
          <span class="kpi-value kpi-value--text mono">{{ config.version() ?? '—' }}</span>
          <span class="kpi-note">
            <a routerLink="/konfiguracja/typy-dokumentow">typy dokumentów: {{ config.documentTypes().length }}</a>
          </span>
        </div>
      </section>

      @if (system(); as s) {
        <section class="card" aria-labelledby="engine-heading">
          <h2 id="engine-heading">Silnik ekstrakcji</h2>
          <dl class="definition-list">
            <dt>Model językowy</dt>
            <dd>
              @if (s.llm.enabled) {
                <span class="mono">{{ s.llm.model }}</span> (profil {{ s.llm.profile }}) ·
                <a routerLink="/konfiguracja/modele-llm">szczegóły</a>
              } @else {
                wyłączony, tylko reguły
              }
            </dd>
            <dt>Klucz API</dt>
            <dd>{{ s.llm.key }}</dd>
            <dt>Konwersja PDF</dt>
            <dd>Docling {{ s.docling_version ?? '—' }}, lokalnie na CPU</dd>
            <dt>Kolejka</dt>
            <dd aria-live="polite">
              {{ s.pending_documents ? 'dokumenty w przetwarzaniu: ' + s.pending_documents : 'pusta' }}
            </dd>
            <dt>Dane aplikacji</dt>
            <dd class="mono">{{ s.data_dir }}</dd>
          </dl>
        </section>
      }

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
                    <td><a [routerLink]="['/sprawy', row.caseId]">{{ row.caseName }}</a></td>
                    <td>{{ row.typeName }}</td>
                    <td class="num">{{ row.warnings }}</td>
                    <td><app-status-badge [status]="row.status" /></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else if (!store.loading()) {
          <p class="empty">
            @if (store.documents().length) {
              Brak dokumentów z ostrzeżeniami.
            } @else {
              Brak spraw. <a routerLink="/sprawy/nowa">Dodaj pierwszą sprawę</a>.
            }
          </p>
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
  protected readonly config = inject(ConfigStore);
  protected readonly system = this.config.system;

  protected readonly reviewRows = computed(() =>
    this.store.toReview().map((doc) => ({
      id: doc.id,
      caseId: doc.caseId,
      caseName: this.store.findCase(doc.caseId)?.name ?? doc.caseId,
      fileName: doc.fileName,
      typeName: this.config.typeName(doc.typeCode),
      warnings: doc.warningCount + doc.errors.length,
      status: doc.status,
    })),
  );

  constructor() {
    // Stan kolejki i klucza API przy każdym wejściu na pulpit.
    void this.config.refreshSystem();
  }
}
