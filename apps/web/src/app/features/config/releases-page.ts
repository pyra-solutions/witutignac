import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { firstValueFrom } from 'rxjs';
import { ReleaseDto } from '../../core/api/api.models';
import { apiErrorMessage } from '../../core/api/errors';
import { ConfigStore } from '../../core/config/config.store';
import { formatDateTime } from '../../core/format';
import { ConfigRelease } from '../../core/models/config.model';
import { Notice } from '../../shared/ui/notice';
import { PageHeader } from '../../shared/ui/page-header';

@Component({
  selector: 'app-releases-page',
  imports: [MatProgressBarModule, PageHeader, Notice],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header
        heading="Wydania konfiguracji"
        description="Publikacja tworzy niezmienny snapshot konfiguracji z plików YAML. Każdy wynik zapisuje w śladzie, którym wydaniem powstał."
      />
      <app-notice>
        Aktywne wydanie jest w pliku <span class="mono">{{ config.source() }}</span>, z którego korzysta CLI uruchamiane przez
        oceniających i ta aplikacja. Publikacja: <span class="mono">python backend/manage.py publish --version …</span>;
        wycofanie zmian to aktywacja poprzedniego wydania (<span class="mono">activate --version …</span>).
        @if (config.version() && !config.publishedVersion()) {
          Bieżący plik <span class="mono">release.json</span> (wersja {{ config.version() }}) nie odpowiada żadnemu
          opublikowanemu wydaniu: zbudowano go poleceniem build-release.
        }
      </app-notice>
      @if (loading()) {
        <mat-progress-bar mode="indeterminate" aria-label="Wczytywanie wydań" />
      } @else if (error()) {
        <app-notice tone="warning">{{ error() }}</app-notice>
      }
      <section class="card card--flush" aria-label="Lista wydań">
        <div class="table-wrap">
          <table class="app-table">
            <thead>
              <tr>
                <th scope="col">Wersja</th>
                <th scope="col">Status</th>
                <th scope="col">Data</th>
                <th scope="col">Autor</th>
                <th scope="col">Opis zmian</th>
                <th scope="col">SHA-256</th>
              </tr>
            </thead>
            <tbody>
              @for (release of releases(); track release.version) {
                <tr [class.active]="release.active">
                  <td class="mono">{{ release.version }}</td>
                  <td>{{ release.active ? 'aktywne' : 'archiwalne' }}</td>
                  <td>{{ date(release.createdAt) }}</td>
                  <td>{{ release.author || '—' }}</td>
                  <td>{{ release.summary || '—' }}</td>
                  <td class="mono small">{{ release.sha256.slice(0, 12) }}</td>
                </tr>
              } @empty {
                @if (!loading()) {
                  <tr>
                    <td colspan="6" class="muted">Brak opublikowanych wydań.</td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: `
    tr.active td {
      font-weight: 700;
    }
    .small {
      font-size: 0.8125rem;
    }
  `,
})
export class ReleasesPage {
  protected readonly config = inject(ConfigStore);
  private readonly http = inject(HttpClient);

  protected readonly releases = signal<ConfigRelease[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly date = formatDateTime;

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    try {
      const rows = await firstValueFrom(this.http.get<ReleaseDto[]>('/api/releases'));
      this.releases.set(
        rows.map((r) => ({
          version: r.version,
          active: r.status === 'active',
          author: r.author,
          createdAt: r.created_at,
          summary: r.summary,
          sha256: r.sha256,
        })),
      );
    } catch (e) {
      this.error.set(apiErrorMessage(e, 'Nie udało się wczytać wydań.'));
    } finally {
      this.loading.set(false);
    }
  }
}
