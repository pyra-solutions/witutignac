import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { STATUS_LABELS } from '../../core/format';
import { AppIcon } from '../../core/icons';
import { DocumentStatus } from '../../core/models/case.model';

const ICONS: Record<DocumentStatus, AppIcon> = {
  gotowy: 'check_circle',
  'do-weryfikacji': 'warning',
  zatwierdzony: 'task_alt',
};

/** Status dokumentu: kolor zawsze z ikoną i tekstem, nigdy sam kolor. */
@Component({
  selector: 'app-status-badge',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<mat-icon [svgIcon]="icon()" aria-hidden="true" />{{ label() }}`,
  host: { '[class]': '"badge badge--" + status()' },
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 10px 2px 6px;
      border-radius: 999px;
      font-size: 0.875rem;
      font-weight: 600;
      white-space: nowrap;
    }
    mat-icon {
      width: 18px;
      height: 18px;
    }
    :host(.badge--gotowy) {
      background: var(--app-success-bg);
      color: var(--app-success);
    }
    :host(.badge--do-weryfikacji) {
      background: var(--app-warning-bg);
      color: var(--app-warning);
    }
    :host(.badge--zatwierdzony) {
      background: var(--app-accent-soft);
      color: var(--app-accent);
    }
  `,
})
export class StatusBadge {
  readonly status = input.required<DocumentStatus>();
  protected readonly label = computed(() => STATUS_LABELS[this.status()]);
  protected readonly icon = computed(() => ICONS[this.status()]);
}
