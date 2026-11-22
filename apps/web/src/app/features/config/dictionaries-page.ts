import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ConfigStore } from '../../core/config/config.store';
import { PageHeader } from '../../shared/ui/page-header';

@Component({
  selector: 'app-dictionaries-page',
  imports: [MatProgressBarModule, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header
        heading="Słowniki"
        description="Wartości kanoniczne z plików config/seed/dictionaries/*.yaml. Opis w wyniku pochodzi ze słownika, więc zawsze zgadza się z identyfikatorem."
      />
      @if (config.loading()) {
        <mat-progress-bar mode="indeterminate" aria-label="Wczytywanie słowników" />
      }
      @for (dictionary of config.dictionaries(); track dictionary.code) {
        <section class="card card--flush" [attr.aria-labelledby]="'dict-' + dictionary.code">
          <div class="head">
            <h2 [id]="'dict-' + dictionary.code">{{ dictionary.name }}</h2>
            <p class="muted">
              Kod: <span class="mono">{{ dictionary.code }}</span> · pozycji: {{ dictionary.entries.length }} · używany przez:
              {{ usedBy(dictionary.code) }}
            </p>
          </div>
          <div class="table-wrap">
            <table class="app-table">
              <thead>
                <tr>
                  <th scope="col" class="num">Id</th>
                  <th scope="col">Wartość</th>
                  <th scope="col">Wzorce dopasowania regułowego</th>
                </tr>
              </thead>
              <tbody>
                @for (entry of dictionary.entries; track entry.id) {
                  <tr>
                    <td class="num">{{ entry.id }}</td>
                    <td>{{ entry.label }}</td>
                    <td class="mono keywords">{{ entry.keywords.join(' · ') || '—' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      } @empty {
        @if (!config.loading()) {
          <section class="card"><p class="muted">Konfiguracja nie ma słowników.</p></section>
        }
      }
    </div>
  `,
  styles: `
    .head {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 16px 24px;
      border-bottom: 1px solid var(--app-border);
    }
    .keywords {
      font-size: 0.8125rem;
      overflow-wrap: anywhere;
    }
  `,
})
export class DictionariesPage {
  protected readonly config = inject(ConfigStore);

  protected usedBy(code: string): string {
    const paths = this.config
      .documentTypes()
      .flatMap((t) => t.fields.filter((f) => f.dictionary === code).map((f) => `${t.code}: ${f.path}`));
    return paths.join(', ') || '—';
  }
}
