import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DICTIONARIES } from '../../core/config/mock-config';
import { PageHeader } from '../../shared/ui/page-header';

@Component({
  selector: 'app-dictionaries-page',
  imports: [PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header
        heading="Słowniki"
        description="Wartości kanoniczne. Pole słownikowe przyjmuje tylko pozycje ze słownika, więc opis zawsze zgadza się z identyfikatorem."
      />
      @for (dictionary of dictionaries; track dictionary.code) {
        <section class="card card--flush" [attr.aria-labelledby]="'dict-' + dictionary.code">
          <div class="head">
            <h2 [id]="'dict-' + dictionary.code">{{ dictionary.name }}</h2>
            <p class="muted">{{ dictionary.description }}</p>
            <p class="muted">
              Kod: <span class="mono">{{ dictionary.code }}</span> · w wyniku zapisujemy:
              {{ dictionary.valueKind === 'id' ? 'identyfikator' : 'etykietę' }}
            </p>
          </div>
          <div class="table-wrap">
            <table class="app-table">
              <thead>
                <tr>
                  <th scope="col" class="num">Id</th>
                  <th scope="col">Wartość</th>
                  <th scope="col">Uwagi</th>
                </tr>
              </thead>
              <tbody>
                @for (entry of dictionary.entries; track entry.id) {
                  <tr>
                    <td class="num">{{ entry.id }}</td>
                    <td>{{ entry.label }}</td>
                    <td class="muted">{{ entry.note ?? '' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
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
  `,
})
export class DictionariesPage {
  protected readonly dictionaries = DICTIONARIES;
}
