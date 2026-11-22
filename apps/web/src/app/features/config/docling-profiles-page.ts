import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ConfigStore } from '../../core/config/config.store';
import { PageHeader } from '../../shared/ui/page-header';

@Component({
  selector: 'app-docling-profiles-page',
  imports: [MatProgressBarModule, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header
        heading="Profile Docling"
        description="Ustawienia konwersji PDF → Markdown (Docling, lokalnie na CPU) i ustawienia silnika z aktywnego wydania."
      />
      @if (config.loading()) {
        <mat-progress-bar mode="indeterminate" aria-label="Wczytywanie konfiguracji" />
      }
      @for (profile of config.conversionProfiles(); track profile.code) {
        <section class="card card--flush" [attr.aria-labelledby]="'profile-' + profile.code">
          <div class="head">
            <h2 [id]="'profile-' + profile.code">Profil <span class="mono">{{ profile.code }}</span></h2>
            <p class="muted">
              Docling {{ config.system()?.docling_version ?? '' }} · używany przez: {{ usedBy(profile.code) }}
            </p>
          </div>
          <div class="table-wrap">
            <table class="app-table">
              <thead>
                <tr>
                  <th scope="col">Ustawienie</th>
                  <th scope="col">Wartość</th>
                  <th scope="col">Dlaczego</th>
                </tr>
              </thead>
              <tbody>
                @for (setting of profile.settings; track setting.key) {
                  <tr>
                    <td>{{ setting.name }} <span class="muted mono small">{{ setting.key }}</span></td>
                    <td class="mono">{{ setting.value }}</td>
                    <td class="muted">{{ setting.reason }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }

      @if (config.engineSettings().length) {
        <section class="card card--flush" aria-labelledby="settings-heading">
          <div class="head">
            <h2 id="settings-heading">Ustawienia silnika</h2>
            <p class="muted">Sekcja <span class="mono">settings</span> w config/seed/release.yaml.</p>
          </div>
          <div class="table-wrap">
            <table class="app-table">
              <thead>
                <tr>
                  <th scope="col">Ustawienie</th>
                  <th scope="col">Wartość</th>
                  <th scope="col">Dlaczego</th>
                </tr>
              </thead>
              <tbody>
                @for (setting of config.engineSettings(); track setting.key) {
                  <tr>
                    <td>{{ setting.name }} <span class="muted mono small">{{ setting.key }}</span></td>
                    <td class="mono">{{ setting.value }}</td>
                    <td class="muted">{{ setting.reason }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }
    </div>
  `,
  styles: `
    .head {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 16px 24px;
      border-bottom: 1px solid var(--app-border);
    }
    .small {
      display: block;
      font-size: 0.75rem;
    }
  `,
})
export class DoclingProfilesPage {
  protected readonly config = inject(ConfigStore);

  protected usedBy(code: string): string {
    return (
      this.config
        .documentTypes()
        .filter((t) => t.conversionProfile === code)
        .map((t) => t.name)
        .join(', ') || '—'
    );
  }
}
