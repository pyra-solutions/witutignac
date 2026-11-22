import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { firstValueFrom } from 'rxjs';
import { ReleaseDto } from '../../core/api/api.models';
import { apiErrorMessage } from '../../core/api/errors';
import { ConfigStore } from '../../core/config/config.store';
import { formatDateTime } from '../../core/format';
import { ConfigRelease } from '../../core/models/config.model';
import { Notice } from '../../shared/ui/notice';
import { PageHeader } from '../../shared/ui/page-header';

/** Następna wersja w konwencji repozytorium: RRRR.MM.DD-dev.N z dzisiejszą datą. */
function nextVersion(versions: string[], now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const prefix = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}-dev.`;
  const used = versions
    .filter((v) => v.startsWith(prefix))
    .map((v) => Number(v.slice(prefix.length)))
    .filter((n) => Number.isInteger(n));
  return prefix + (Math.max(0, ...used) + 1);
}

const ENGINE_WARNING =
  'Silnik zacznie używać tej konfiguracji od razu: przetwarzanie w aplikacji i CLI (run.sh) czytają engine/config/release.json.';

@Component({
  selector: 'app-releases-page',
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    PageHeader,
    Notice,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header
        heading="Wydania konfiguracji"
        description="Publikacja tworzy niezmienny snapshot konfiguracji z plików YAML. Każdy wynik zapisuje w śladzie, którym wydaniem powstał."
      />
      <app-notice>
        Aktywne wydanie jest w pliku <span class="mono">{{ config.source() }}</span>, z którego korzysta CLI uruchamiane przez
        oceniających i ta aplikacja. Publikować i aktywować można tutaj albo poleceniami
        <span class="mono">python backend/manage.py publish --version …</span> i <span class="mono">activate --version …</span>.
        Wycofanie zmian to aktywacja poprzedniego wydania.
        @if (config.version() && !config.publishedVersion()) {
          Bieżący plik <span class="mono">release.json</span> (wersja {{ config.version() }}) nie odpowiada żadnemu
          opublikowanemu wydaniu: zbudowano go poleceniem build-release.
        }
      </app-notice>

      <section class="card stack" aria-labelledby="publish-heading">
        <h2 id="publish-heading">Opublikuj konfigurację roboczą</h2>
        <p class="muted">
          Snapshot bieżących plików <span class="mono">config/seed/*.yaml</span>, sprawdzony modelem konfiguracji silnika.
          Wersji nie można użyć drugi raz.
        </p>
        <div class="form-row">
          <mat-form-field class="version">
            <mat-label>Wersja</mat-label>
            <input
              matInput
              [value]="version()"
              (input)="version.set($any($event.target).value)"
              maxlength="64"
              autocomplete="off"
              required
            />
          </mat-form-field>
          <mat-form-field class="author">
            <mat-label>Autor</mat-label>
            <input matInput [value]="author()" (input)="author.set($any($event.target).value)" maxlength="100" autocomplete="off" />
            <mat-hint>Puste: użytkownik systemu</mat-hint>
          </mat-form-field>
        </div>
        <mat-form-field class="summary">
          <mat-label>Opis zmian</mat-label>
          <input matInput [value]="summary()" (input)="summary.set($any($event.target).value)" maxlength="500" autocomplete="off" />
        </mat-form-field>
        <mat-checkbox [checked]="activateNow()" (change)="activateNow.set($event.checked)">
          Od razu aktywuj (silnik zacznie go używać)
        </mat-checkbox>
        <div class="row">
          <button mat-flat-button type="button" [disabled]="!canPublish()" (click)="publish()">
            <mat-icon svgIcon="save" aria-hidden="true" />Opublikuj
          </button>
        </div>
      </section>

      @if (busy()) {
        <mat-progress-bar mode="indeterminate" aria-label="Zapisywanie wydania" />
      }
      @if (actionError()) {
        <app-notice tone="warning"><p class="pre">{{ actionError() }}</p></app-notice>
      }
      @if (message()) {
        <app-notice><p>{{ message() }}</p></app-notice>
      }

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
                <th scope="col"><span class="visually-hidden">Akcje</span></th>
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
                  <td class="actions">
                    @if (!release.active) {
                      <button
                        mat-stroked-button
                        type="button"
                        [disabled]="busy()"
                        [attr.aria-label]="'Aktywuj wydanie ' + release.version"
                        (click)="activate(release.version)"
                      >
                        <mat-icon svgIcon="task_alt" aria-hidden="true" />Aktywuj
                      </button>
                    }
                  </td>
                </tr>
              } @empty {
                @if (!loading()) {
                  <tr>
                    <td colspan="7" class="muted">Brak opublikowanych wydań.</td>
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
    .form-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .version,
    .author {
      flex: 1 1 240px;
      max-width: 360px;
    }
    .summary {
      max-width: 732px;
    }
    .actions {
      text-align: right;
      white-space: nowrap;
    }
    .pre {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
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

  protected readonly version = signal('');
  protected readonly author = signal('');
  protected readonly summary = signal('');
  protected readonly activateNow = signal(true);
  protected readonly busy = signal(false);
  protected readonly actionError = signal<string | null>(null);
  protected readonly message = signal<string | null>(null);
  protected readonly canPublish = computed(() => !this.busy() && this.version().trim().length > 0);

  constructor() {
    void this.load();
  }

  protected async publish(): Promise<void> {
    const version = this.version().trim();
    const activate = this.activateNow();
    if (activate && !confirm(`Opublikować i aktywować wydanie ${version}? ${ENGINE_WARNING}`)) return;
    await this.run(async () => {
      const r = await firstValueFrom(
        this.http.post<ReleaseDto>('/api/releases', {
          version,
          summary: this.summary().trim(),
          author: this.author().trim(),
          activate,
        }),
      );
      this.summary.set('');
      this.version.set('');
      this.message.set(
        r.status === 'active' ? `Opublikowano i aktywowano wydanie ${r.version}.` : `Opublikowano wydanie ${r.version}.`,
      );
    }, 'Nie udało się opublikować wydania.');
  }

  protected async activate(version: string): Promise<void> {
    if (!confirm(`Aktywować wydanie ${version}? ${ENGINE_WARNING}`)) return;
    await this.run(async () => {
      const r = await firstValueFrom(
        this.http.post<ReleaseDto>(`/api/releases/${encodeURIComponent(version)}/activate`, {}),
      );
      this.message.set(`Aktywne wydanie: ${r.version}.`);
    }, 'Nie udało się aktywować wydania.');
  }

  private async run(action: () => Promise<void>, fallback: string): Promise<void> {
    this.busy.set(true);
    this.actionError.set(null);
    this.message.set(null);
    try {
      await action();
      await Promise.all([this.load(), this.config.load()]);
    } catch (e) {
      this.actionError.set(apiErrorMessage(e, fallback));
    } finally {
      this.busy.set(false);
    }
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
      if (!this.version()) this.version.set(nextVersion(rows.map((r) => r.version)));
      this.error.set(null);
    } catch (e) {
      this.error.set(apiErrorMessage(e, 'Nie udało się wczytać wydań.'));
    } finally {
      this.loading.set(false);
    }
  }
}
