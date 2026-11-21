import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EmptyState } from '../../shared/ui/empty-state';
import { PageHeader } from '../../shared/ui/page-header';

@Component({
  selector: 'app-audit-page',
  imports: [PageHeader, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header
        heading="Audyt"
        description="Kto, co i kiedy zmienił w konfiguracji i w wynikach ekstrakcji."
      />
      <section class="card">
        <app-empty-state icon="history" heading="Brak zdarzeń">
          Dziennik audytu zapisuje API: publikacje i aktywacje wydań, zmiany definicji, poprawki pól i zatwierdzenia
          dokumentów. W makiecie zmiany istnieją tylko w pamięci przeglądarki.
        </app-empty-state>
      </section>
    </div>
  `,
})
export class AuditPage {}
