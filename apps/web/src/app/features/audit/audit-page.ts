import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuditEntryDto } from '../../core/api/api.models';
import { apiErrorMessage } from '../../core/api/errors';
import { ConfigStore } from '../../core/config/config.store';
import { CasesStore } from '../../core/data/cases.store';
import { formatDateTime } from '../../core/format';
import { EmptyState } from '../../shared/ui/empty-state';
import { Notice } from '../../shared/ui/notice';
import { PageHeader } from '../../shared/ui/page-header';

const EVENTS: Record<string, string> = {
  sprawa_utworzona: 'Utworzono sprawę',
  sprawa_usunieta: 'Usunięto sprawę',
  sprawa_przetworzona_ponownie: 'Ponowne przetwarzanie sprawy',
  dokument_przetworzony: 'Przetworzono dokument',
  dokument_poprawiony: 'Poprawiono pola',
  dokument_zatwierdzony: 'Zatwierdzono dokument',
  zatwierdzenie_cofniete: 'Cofnięto zatwierdzenie',
  poprawki_odrzucone: 'Przywrócono wynik silnika',
};

@Component({
  selector: 'app-audit-page',
  imports: [RouterLink, MatProgressBarModule, PageHeader, EmptyState, Notice],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header
        heading="Audyt"
        description="Kto, co i kiedy zrobił z dokumentami: przetworzenie, poprawki pól i zatwierdzenia. Ostatnie 200 zdarzeń."
      />
      @if (loading()) {
        <mat-progress-bar mode="indeterminate" aria-label="Wczytywanie dziennika" />
      } @else if (error()) {
        <app-notice tone="warning">{{ error() }}</app-notice>
      }
      <section class="card card--flush" aria-label="Dziennik zdarzeń">
        @if (entries().length) {
          <div class="table-wrap">
            <table class="app-table">
              <thead>
                <tr>
                  <th scope="col">Czas</th>
                  <th scope="col">Zdarzenie</th>
                  <th scope="col">Sprawa</th>
                  <th scope="col">Dokument</th>
                  <th scope="col">Szczegóły</th>
                  <th scope="col">Użytkownik</th>
                </tr>
              </thead>
              <tbody>
                @for (e of entries(); track $index) {
                  <tr>
                    <td>{{ date(e.at) }}</td>
                    <td>{{ label(e.event) }}</td>
                    <td>
                      @if (e.case_id && caseName(e.case_id); as name) {
                        <a [routerLink]="['/sprawy', e.case_id]">{{ name }}</a>
                      } @else {
                        <span class="mono">{{ e.case_id ?? '—' }}</span>
                      }
                    </td>
                    <td>
                      @if (e.case_id && e.document && caseName(e.case_id)) {
                        <a [routerLink]="['/sprawy', e.case_id, 'dokumenty', e.document]">{{ e.document }}</a>
                      } @else {
                        {{ e.document ?? '—' }}
                      }
                    </td>
                    <td class="small">{{ details(e) }}</td>
                    <td>{{ e.user }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else if (!loading()) {
          <app-empty-state icon="history" heading="Brak zdarzeń">
            Dziennik zapisuje wgranie spraw, wyniki przetwarzania, poprawki pól i zatwierdzenia dokumentów.
          </app-empty-state>
        }
      </section>
      <p class="muted">
        Dziennik jest w pliku <span class="mono">{{ dataDir() }}/audit.jsonl</span>. Historia konfiguracji to
        <a routerLink="/konfiguracja/wydania">wydania</a> i historia git katalogu config/.
      </p>
    </div>
  `,
  styles: `
    .small {
      font-size: 0.875rem;
      overflow-wrap: anywhere;
    }
  `,
})
export class AuditPage {
  private readonly http = inject(HttpClient);
  private readonly cases = inject(CasesStore);
  private readonly config = inject(ConfigStore);

  protected readonly entries = signal<AuditEntryDto[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly date = formatDateTime;
  protected readonly dataDir = () => this.config.system()?.data_dir ?? 'gui-data';

  constructor() {
    void this.load();
  }

  protected label(event: string): string {
    return EVENTS[event] ?? event;
  }

  protected caseName(caseId: string): string | null {
    return this.cases.findCase(caseId)?.name ?? null;
  }

  protected details(e: AuditEntryDto): string {
    const parts: string[] = [];
    if (typeof e['doc_type'] === 'string') parts.push(`typ: ${this.config.typeName(e['doc_type'])}`);
    if (e['status'] === 'unsupported') parts.push('typ nieobsługiwany, wynik {}');
    if (e['status'] === 'error') parts.push('błąd przetwarzania');
    if (typeof e['seconds'] === 'number') parts.push(`${e['seconds']} s`);
    if (typeof e['release'] === 'string') parts.push(`wydanie ${e['release']}`);
    if (typeof e['documents'] === 'number') parts.push(`dokumenty: ${e['documents']}`);
    if (Array.isArray(e['fields'])) parts.push(`pola: ${e['fields'].join(', ')}`);
    return parts.join(' · ') || '—';
  }

  private async load(): Promise<void> {
    try {
      this.entries.set(await firstValueFrom(this.http.get<AuditEntryDto[]>('/api/audit')));
    } catch (e) {
      this.error.set(apiErrorMessage(e, 'Nie udało się wczytać dziennika.'));
    } finally {
      this.loading.set(false);
    }
  }
}
