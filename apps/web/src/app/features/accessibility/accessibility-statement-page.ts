import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeader } from '../../shared/ui/page-header';

@Component({
  selector: 'app-accessibility-statement-page',
  imports: [PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header
        heading="Deklaracja dostępności"
        description="Projekt deklaracji dla prototypu. Pełna deklaracja, z datą publikacji i danymi kontaktowymi, powstanie przed wdrożeniem."
      />
      <section class="card stack" aria-labelledby="goal-heading">
        <h2 id="goal-heading">Cel</h2>
        <p>
          Aplikacja ma spełniać wymagania WCAG 2.1 na poziomie AA, zgodnie z ustawą z dnia 4 kwietnia 2019 r.
          o dostępności cyfrowej stron internetowych i aplikacji mobilnych podmiotów publicznych.
        </p>
      </section>
      <section class="card stack" aria-labelledby="done-heading">
        <h2 id="done-heading">Zastosowane rozwiązania</h2>
        <ul>
          <li>Link „Przejdź do treści” na początku strony.</li>
          <li>Pełna obsługa klawiaturą i widoczny fokus.</li>
          <li>Kontrast tekstu co najmniej 4,5:1.</li>
          <li>Statusy oznaczone tekstem i ikoną, nie tylko kolorem.</li>
          <li>Jeden nagłówek pierwszego poziomu na stronę i ścieżka nawigacji.</li>
          <li>Tytuł karty przeglądarki zmienia się razem ze stroną.</li>
          <li>Układ działa od szerokości telefonu do dużego monitora.</li>
        </ul>
      </section>
      <section class="card stack" aria-labelledby="limits-heading">
        <h2 id="limits-heading">Znane ograniczenia</h2>
        <ul>
          <li>
            Podgląd PDF jest obrazem strony. Ten sam tekst jest dostępny w zakładkach „Pola” i „Markdown” na ekranie
            weryfikacji dokumentu.
          </li>
          <li>Prototyp nie przeszedł jeszcze audytu dostępności.</li>
        </ul>
      </section>
    </div>
  `,
  styles: `
    ul {
      margin: 0;
      padding-left: 20px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
  `,
})
export class AccessibilityStatementPage {}
