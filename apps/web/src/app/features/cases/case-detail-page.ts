import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router, RouterLink } from '@angular/router';
import { apiErrorMessage } from '../../core/api/errors';
import { ConfigStore } from '../../core/config/config.store';
import { CasesStore } from '../../core/data/cases.store';
import { formatDateTime, formatNumber, formatSize } from '../../core/format';
import { EmptyState } from '../../shared/ui/empty-state';
import { Notice } from '../../shared/ui/notice';
import { PageHeader } from '../../shared/ui/page-header';
import { StatusBadge } from '../../shared/ui/status-badge';

@Component({
  selector: 'app-case-detail-page',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressBarModule, PageHeader, StatusBadge, EmptyState, Notice],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      @if (store.loading() && !record()) {
        <mat-progress-bar mode="indeterminate" aria-label="Wczytywanie sprawy" />
      } @else if (record(); as c) {
        <app-page-header
          [heading]="c.name"
          [description]="c.procurementTitle ?? ''"
          [breadcrumbs]="[{ label: 'Sprawy', link: '/sprawy' }, { label: c.name }]"
        >
          <a actions mat-flat-button [href]="zipUrl()" [class.disabled-link]="c.processing" download>
            <mat-icon svgIcon="download" aria-hidden="true" />Pobierz wyniki (ZIP)
          </a>
          <button actions mat-stroked-button type="button" [disabled]="c.processing || busy()" (click)="reprocess()">
            <mat-icon svgIcon="undo" aria-hidden="true" />Przetwórz ponownie
          </button>
          <button actions mat-button type="button" [disabled]="c.processing || busy()" (click)="remove()">
            <mat-icon svgIcon="close" aria-hidden="true" />Usuń sprawę
          </button>
        </app-page-header>

        @if (rejected().length) {
          <app-notice tone="warning">
            <p>Część plików pominięto:</p>
            <ul class="list">
              @for (line of rejected(); track line) {
                <li>{{ line }}</li>
              }
            </ul>
          </app-notice>
        }
        @if (actionError()) {
          <app-notice tone="warning">{{ actionError() }}</app-notice>
        }

        @if (c.processing) {
          <section class="card stack" aria-live="polite" aria-labelledby="progress-heading">
            <h2 id="progress-heading">Przetwarzanie: {{ done() }} z {{ c.documents.length }}</h2>
            <mat-progress-bar mode="determinate" [value]="(done() / c.documents.length) * 100" aria-labelledby="progress-heading" />
            <p class="muted">
              Konwersja PDF (Docling, OCR dla skanów), rozpoznanie rodzaju dokumentu, reguły i model językowy. Skan zajmuje
              zwykle kilka sekund na stronę. Strona odświeża się sama.
            </p>
          </section>
        }

        <section class="card" aria-labelledby="parties-heading">
          <h2 id="parties-heading">Strony i postępowanie</h2>
          <dl class="definition-list">
            <dt>Odwołujący</dt>
            <dd>{{ c.appellant ?? '—' }}</dd>
            <dt>Zamawiający</dt>
            <dd>{{ c.contractingAuthority ?? '—' }}</dd>
            <dt>Utworzona</dt>
            <dd>{{ date(c.createdAt) }}</dd>
            <dt>Identyfikator</dt>
            <dd class="mono">{{ c.id }}</dd>
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
                  <th scope="col" class="num">Strony</th>
                  <th scope="col" class="num">Ostrzeżenia</th>
                  <th scope="col">Plik wynikowy</th>
                  <th scope="col">Status</th>
                  <th scope="col"><span class="visually-hidden">Akcje</span></th>
                </tr>
              </thead>
              <tbody>
                @for (doc of documents(); track doc.id) {
                  <tr>
                    <td>
                      <span class="file">{{ doc.fileName }}</span>
                      <span class="muted small">{{ size(doc.size) }}{{ doc.scanned ? ' · skan (OCR)' : '' }}</span>
                    </td>
                    <td>{{ doc.typeName }}</td>
                    <td class="num">{{ doc.pages ?? '—' }}</td>
                    <td class="num">{{ doc.warnings }}</td>
                    <td class="mono">{{ doc.outputFileName }}</td>
                    <td>
                      <app-status-badge [status]="doc.status" />
                      @if (doc.stage) {
                        <span class="muted small">{{ doc.stage }}</span>
                      } @else if (doc.seconds !== null) {
                        <span class="muted small">{{ number(doc.seconds, 1) }} s</span>
                      }
                    </td>
                    <td>
                      @if (doc.ready) {
                        <a mat-stroked-button [routerLink]="['/sprawy', c.id, 'dokumenty', doc.id]">
                          {{ doc.status === 'zatwierdzony' || doc.status === 'gotowy' ? 'Podgląd' : 'Weryfikuj' }}
                          <span class="visually-hidden"> {{ doc.fileName }}</span>
                        </a>
                      }
                    </td>
                  </tr>
                  @if (doc.errors.length) {
                    <tr class="errors-row">
                      <td colspan="7">
                        <ul class="list">
                          @for (err of doc.errors; track err) {
                            <li><mat-icon svgIcon="warning" aria-hidden="true" />{{ err }}</li>
                          }
                        </ul>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </section>
      } @else if (store.error()) {
        <app-empty-state icon="error" heading="Błąd wczytywania">{{ store.error() }}</app-empty-state>
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
    .file {
      display: block;
      font-weight: 600;
      overflow-wrap: anywhere;
    }
    .small {
      display: block;
      font-size: 0.8125rem;
    }
    .list {
      margin: 4px 0 0;
      padding-left: 0;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .list mat-icon {
      width: 18px;
      height: 18px;
      margin-right: 6px;
      vertical-align: -4px;
      color: var(--app-warning);
    }
    .errors-row td {
      padding-top: 0;
      font-size: 0.875rem;
      color: var(--app-warning);
    }
    .disabled-link {
      pointer-events: none;
      opacity: 0.5;
    }
  `,
})
export class CaseDetailPage {
  protected readonly store = inject(CasesStore);
  private readonly config = inject(ConfigStore);
  private readonly router = inject(Router);
  readonly caseId = input.required<string>();

  protected readonly busy = signal(false);
  protected readonly actionError = signal<string | null>(null);
  /** Pliki odrzucone przy wysyłaniu (przekazane z ekranu „Nowa sprawa”). */
  protected readonly rejected = signal<string[]>(
    (this.router.getCurrentNavigation()?.extras.state?.['rejected'] as string[] | undefined) ??
      (history.state?.rejected as string[] | undefined) ??
      [],
  );
  protected readonly size = formatSize;
  protected readonly date = formatDateTime;
  protected readonly number = formatNumber;

  protected readonly record = computed(() => this.store.findCase(this.caseId()));
  protected readonly zipUrl = computed(() => `/api/cases/${encodeURIComponent(this.caseId())}/results.zip`);
  protected readonly done = computed(
    () => this.record()?.documents.filter((d) => d.status !== 'w-kolejce' && d.status !== 'przetwarzanie').length ?? 0,
  );

  protected readonly documents = computed(() =>
    (this.record()?.documents ?? []).map((doc) => ({
      ...doc,
      typeName: doc.typeCode ? this.config.typeName(doc.typeCode) : doc.status === 'nieobslugiwany' ? 'nieobsługiwany' : '—',
      warnings: doc.warningCount,
      ready: doc.status !== 'w-kolejce' && doc.status !== 'przetwarzanie',
    })),
  );

  protected async reprocess(): Promise<void> {
    const reviewed = this.record()?.documents.some((d) => d.reviewed);
    if (reviewed && !confirm('Ponowne przetworzenie usunie poprawki i zatwierdzenia dokumentów tej sprawy. Kontynuować?')) {
      return;
    }
    await this.run(() => this.store.reprocess(this.caseId()));
  }

  protected async remove(): Promise<void> {
    if (!confirm('Usunąć sprawę razem z plikami PDF i wynikami? Tej operacji nie można cofnąć.')) return;
    await this.run(async () => {
      await this.store.deleteCase(this.caseId());
      await this.router.navigate(['/sprawy']);
    });
  }

  private async run(action: () => Promise<void>): Promise<void> {
    this.busy.set(true);
    this.actionError.set(null);
    try {
      await action();
    } catch (e) {
      this.actionError.set(apiErrorMessage(e, 'Operacja nie powiodła się.'));
    } finally {
      this.busy.set(false);
    }
  }
}
