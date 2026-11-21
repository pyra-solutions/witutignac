import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, ElementRef, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavContent, MatSidenavModule } from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { AppIcon } from './core/icons';

interface NavItem {
  label: string;
  icon: AppIcon;
  link: string;
  /** Ścieżki, które nie podświetlają tej pozycji (np. „Nowa sprawa” pod „Sprawy”). */
  exclude?: string[];
  exact?: boolean;
}

interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);

  private readonly sidenav = viewChild.required(MatSidenav);
  private readonly content = viewChild.required(MatSidenavContent);
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  protected readonly isHandset = toSignal(
    inject(BreakpointObserver)
      .observe('(max-width: 1023px)')
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  protected readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects.split(/[?#]/)[0]),
    ),
    { initialValue: '' },
  );

  protected readonly sections: NavSection[] = [
    {
      id: 'nav-praca',
      label: 'Praca',
      items: [
        { label: 'Pulpit', icon: 'dashboard', link: '/pulpit' },
        { label: 'Sprawy', icon: 'folder_open', link: '/sprawy', exclude: ['/sprawy/nowa'] },
        { label: 'Nowa sprawa', icon: 'upload_file', link: '/sprawy/nowa', exact: true },
      ],
    },
    {
      id: 'nav-konfiguracja',
      label: 'Konfiguracja',
      items: [
        { label: 'Typy dokumentów', icon: 'description', link: '/konfiguracja/typy-dokumentow' },
        { label: 'Słowniki', icon: 'menu_book', link: '/konfiguracja/slowniki' },
        { label: 'Modele LLM', icon: 'smart_toy', link: '/konfiguracja/modele-llm' },
        { label: 'Profile Docling', icon: 'tune', link: '/konfiguracja/profile-docling' },
        { label: 'Wydania', icon: 'inventory_2', link: '/konfiguracja/wydania' },
      ],
    },
    {
      id: 'nav-nadzor',
      label: 'Nadzór',
      items: [
        { label: 'Jakość', icon: 'query_stats', link: '/jakosc' },
        { label: 'Audyt', icon: 'history', link: '/audyt' },
      ],
    },
  ];

  constructor() {
    let first = true;
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        // Treść przewija się w kontenerze sidenav, nie w oknie: wracamy na górę ręcznie.
        this.content().scrollTo({ top: 0 });
        if (this.isHandset()) void this.sidenav().close();
        // Po zmianie strony fokus trafia do treści, żeby czytnik ekranu ogłosił nową stronę.
        if (!first) this.main().nativeElement.focus({ preventScroll: true });
        first = false;
      });
  }

  protected isActive(item: NavItem): boolean {
    const url = this.url();
    if (item.exclude?.some((path) => url === path || url.startsWith(`${path}/`))) return false;
    return item.exact ? url === item.link : url === item.link || url.startsWith(`${item.link}/`);
  }

  protected skipToContent(event: Event): void {
    event.preventDefault();
    this.main().nativeElement.focus();
  }

  protected toggleNav(): void {
    void this.sidenav().toggle();
  }
}
