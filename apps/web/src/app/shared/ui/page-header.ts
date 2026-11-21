import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

export interface Breadcrumb {
  label: string;
  link?: string;
}

/** Nagłówek strony: ścieżka nawigacji, tytuł (jedyny h1), opis i miejsce na akcje. */
@Component({
  selector: 'app-page-header',
  imports: [RouterLink, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (breadcrumbs().length) {
      <nav aria-label="Ścieżka nawigacji" class="breadcrumbs">
        <ol>
          @for (crumb of breadcrumbs(); track $index; let last = $last) {
            <li>
              @if (crumb.link && !last) {
                <a [routerLink]="crumb.link">{{ crumb.label }}</a>
                <mat-icon svgIcon="chevron_right" aria-hidden="true" />
              } @else {
                <span [attr.aria-current]="last ? 'page' : null">{{ crumb.label }}</span>
              }
            </li>
          }
        </ol>
      </nav>
    }
    <div class="title-row">
      <div class="titles">
        <h1>{{ heading() }}</h1>
        @if (description()) {
          <p class="description">{{ description() }}</p>
        }
      </div>
      <div class="actions"><ng-content select="[actions]" /></div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .breadcrumbs ol {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 2px;
      margin: 0 0 8px;
      padding: 0;
      list-style: none;
      font-size: 0.9375rem;
    }
    .breadcrumbs li {
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }
    .breadcrumbs mat-icon {
      width: 18px;
      height: 18px;
      color: var(--app-text-muted);
    }
    .breadcrumbs span {
      color: var(--app-text-muted);
    }
    .title-row {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: 16px;
    }
    .titles {
      min-width: 0;
    }
    h1 {
      overflow-wrap: anywhere;
    }
    .description {
      margin-top: 6px;
      max-width: 72ch;
      color: var(--app-text-muted);
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  `,
})
export class PageHeader {
  readonly heading = input.required<string>();
  readonly description = input<string>('');
  readonly breadcrumbs = input<Breadcrumb[]>([]);
}
