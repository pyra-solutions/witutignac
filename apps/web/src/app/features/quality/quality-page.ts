import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EmptyState } from '../../shared/ui/empty-state';
import { PageHeader } from '../../shared/ui/page-header';

interface SpikeRow {
  variant: string;
  documents: number;
  secondsPerDocument: string;
  found: string;
}

@Component({
  selector: 'app-quality-page',
  imports: [PageHeader, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header
        heading="Jakość"
        description="Ewaluacja F1 na zbiorze kontrolnym i pomiary konwersji Docling."
      />

      <section class="card card--flush" aria-labelledby="f1-heading">
        <h2 id="f1-heading" class="section-title">Ewaluacja F1</h2>
        <app-empty-state icon="query_stats" heading="Brak uruchomień ewaluacji">
          Silnik ekstrakcji jest w budowie. Po jego podłączeniu tutaj pojawi się F1 per typ dokumentu i per pole oraz
          porównanie wydań konfiguracji na 15 sprawach kontrolnych.
        </app-empty-state>
      </section>

      <section class="card card--flush" aria-labelledby="spike-heading">
        <div class="head">
          <h2 id="spike-heading">Próba Docling (21.11.2026)</h2>
          <p class="muted">
            Sprawy 01–03 z danych treningowych, Docling 2.151.1 na CPU (4 wątki), RapidOCR „pl”. Symulowany skan:
            150 dpi, odcienie szarości, obrót 0,7°. Pomiar na maszynie deweloperskiej, nie na laptopie testowym.
          </p>
        </div>
        <div class="table-wrap">
          <table class="app-table">
            <thead>
              <tr>
                <th scope="col">Wariant</th>
                <th scope="col" class="num">Dokumenty</th>
                <th scope="col">Czas na dokument</th>
                <th scope="col">Wartości wzorca znalezione dosłownie w Markdown</th>
              </tr>
            </thead>
            <tbody>
              @for (row of spike; track row.variant) {
                <tr>
                  <td>{{ row.variant }}</td>
                  <td class="num">{{ row.documents }}</td>
                  <td>{{ row.secondsPerDocument }}</td>
                  <td>{{ row.found }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <ul class="notes">
          <li>
            Liczone są tylko wartości tekstowe zapisane dosłownie; pominięto daty (we wzorcu w formacie ISO) i pola
            wyliczane ze słownika.
          </li>
          <li>
            Jedyna brakująca wartość w oryginalnych PDF-ach to numer TED zapisany jako „2026/S086-999073”; normalizator
            zamienia go na wymagany format.
          </li>
          <li>Na skanach OCR gubi fragmenty długich linii: tytuły zamówień, nazwę kancelarii, część opisu przelewu.</li>
          <li>Szczytowe zużycie pamięci: 2,0 GB.</li>
        </ul>
      </section>
    </div>
  `,
  styles: `
    .section-title {
      padding: 16px 24px;
      border-bottom: 1px solid var(--app-border);
    }
    .head {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 16px 24px;
      border-bottom: 1px solid var(--app-border);
    }
    .notes {
      margin: 0;
      padding: 16px 24px 20px 44px;
      color: var(--app-text-muted);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
  `,
})
export class QualityPage {
  protected readonly spike: SpikeRow[] = [
    { variant: 'Oryginalny PDF', documents: 9, secondsPerDocument: '0,8–1,9 s', found: '74 z 75' },
    { variant: 'Symulowany skan', documents: 9, secondsPerDocument: '2,4–12,3 s', found: '69 z 75' },
  ];
}
