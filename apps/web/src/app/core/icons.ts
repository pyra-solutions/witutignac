import { inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Ikony Material Symbols (Apache 2.0) jako pojedyncze pliki SVG w public/icons.
 * Zamiast fontu z ikonami (4 MB) ładujemy tylko te, których używamy.
 */
export const APP_ICONS = [
  'accessibility_new',
  'account_circle',
  'arrow_back',
  'article',
  'check_circle',
  'chevron_right',
  'close',
  'dashboard',
  'data_object',
  'description',
  'download',
  'edit',
  'error',
  'folder_open',
  'gavel',
  'history',
  'home',
  'info',
  'inventory_2',
  'menu',
  'menu_book',
  'open_in_new',
  'picture_as_pdf',
  'query_stats',
  'rule',
  'save',
  'schedule',
  'search',
  'smart_toy',
  'task_alt',
  'tune',
  'undo',
  'upload',
  'upload_file',
  'visibility',
  'warning',
] as const;

export type AppIcon = (typeof APP_ICONS)[number];

export function registerAppIcons(): void {
  const registry = inject(MatIconRegistry);
  const sanitizer = inject(DomSanitizer);
  for (const name of APP_ICONS) {
    registry.addSvgIcon(name, sanitizer.bypassSecurityTrustResourceUrl(`icons/${name}.svg`));
  }
}
