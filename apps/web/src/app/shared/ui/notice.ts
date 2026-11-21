import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Komunikat informacyjny, np. o danych przykładowych w makiecie. */
@Component({
  selector: 'app-notice',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-icon [svgIcon]="tone() === 'warning' ? 'warning' : 'info'" aria-hidden="true" />
    <div><ng-content /></div>
  `,
  host: { role: 'note', '[class.warning]': 'tone() === "warning"' },
  styles: `
    :host {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      padding: 12px 16px;
      border-radius: var(--app-radius);
      border: 1px solid #b9c9e4;
      background: var(--app-accent-soft);
      color: var(--app-text);
    }
    :host(.warning) {
      border-color: #e6c77a;
      background: var(--app-warning-bg);
    }
    mat-icon {
      color: var(--app-accent);
    }
    :host(.warning) mat-icon {
      color: var(--app-warning);
    }
  `,
})
export class Notice {
  readonly tone = input<'info' | 'warning'>('info');
}
