import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AppIcon } from '../../core/icons';

@Component({
  selector: 'app-empty-state',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-icon [svgIcon]="icon()" aria-hidden="true" />
    <h2>{{ heading() }}</h2>
    <p><ng-content /></p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 40px 24px;
      text-align: center;
      color: var(--app-text-muted);
    }
    mat-icon {
      width: 40px;
      height: 40px;
      color: var(--app-accent);
    }
    h2 {
      color: var(--app-text);
    }
    p {
      max-width: 60ch;
    }
  `,
})
export class EmptyState {
  readonly icon = input<AppIcon>('info');
  readonly heading = input.required<string>();
}
