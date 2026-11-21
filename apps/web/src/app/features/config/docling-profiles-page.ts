import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CONVERSION_PROFILES, DOCUMENT_TYPES } from '../../core/config/mock-config';
import { PageHeader } from '../../shared/ui/page-header';

@Component({
  selector: 'app-docling-profiles-page',
  imports: [PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header
        heading="Profile Docling"
        description="Ustawienia konwersji PDF → Markdown na CPU. Typ dokumentu wskazuje swój profil."
      />
      @for (profile of profiles; track profile.code) {
        <section class="card card--flush" [attr.aria-labelledby]="'profile-' + profile.code">
          <div class="head">
            <h2 [id]="'profile-' + profile.code">{{ profile.name }}</h2>
            <p class="muted">
              Kod: <span class="mono">{{ profile.code }}</span> · Docling {{ profile.doclingVersion }} · używany przez:
              {{ usedBy(profile.code) }}
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
                @for (setting of profile.settings; track setting.name) {
                  <tr>
                    <td>{{ setting.name }}</td>
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
  `,
})
export class DoclingProfilesPage {
  protected readonly profiles = CONVERSION_PROFILES;

  protected usedBy(code: string): string {
    return (
      DOCUMENT_TYPES.filter((t) => t.conversionProfile === code)
        .map((t) => t.name)
        .join(', ') || '—'
    );
  }
}
