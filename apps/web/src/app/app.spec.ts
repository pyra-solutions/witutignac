import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('renders the skip link, the brand and the main navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.skip-link')?.textContent).toContain('Przejdź do treści');
    expect(el.querySelector('.brand-name')?.textContent).toContain('Odwołania2json');
    const nav = el.querySelector('nav[aria-label="Nawigacja główna"]');
    expect(nav).toBeTruthy();
    expect(nav?.textContent).toContain('Typy dokumentów');
    expect(el.querySelector('main#main')).toBeTruthy();
  });
});
