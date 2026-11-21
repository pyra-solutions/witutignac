import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { EmptyState } from '../../shared/ui/empty-state';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, MatButtonModule, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h1 class="visually-hidden">Nie znaleziono strony</h1>
      <section class="card">
        <app-empty-state icon="search" heading="Nie ma takiej strony">
          Adres może być nieaktualny albo zawierać błąd.
        </app-empty-state>
        <div class="actions">
          <a mat-flat-button routerLink="/pulpit">Przejdź do pulpitu</a>
        </div>
      </section>
    </div>
  `,
  styles: `
    .actions {
      display: flex;
      justify-content: center;
      padding-bottom: 24px;
    }
  `,
})
export class NotFoundPage {}
