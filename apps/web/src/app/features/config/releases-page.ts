import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CONFIG_RELEASES } from '../../core/config/mock-config';
import { Notice } from '../../shared/ui/notice';
import { PageHeader } from '../../shared/ui/page-header';

@Component({
  selector: 'app-releases-page',
  imports: [PageHeader, Notice],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header
        heading="Wydania konfiguracji"
        description="Publikacja tworzy niezmienny snapshot konfiguracji. Każdy wynik zapisuje, którym wydaniem powstał."
      />
      <app-notice>
        Publikacja eksportuje wydanie do pliku <span class="mono">engine/config/release.json</span>, z którego korzysta
        CLI uruchamiane przez oceniających. Wycofanie zmian to aktywacja poprzedniego wydania.
      </app-notice>
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
              </tr>
            </thead>
            <tbody>
              @for (release of releases; track release.version) {
                <tr>
                  <td class="mono">{{ release.version }}</td>
                  <td>{{ release.status }}</td>
                  <td>{{ release.date }}</td>
                  <td>{{ release.author }}</td>
                  <td>{{ release.summary }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
})
export class ReleasesPage {
  protected readonly releases = CONFIG_RELEASES;
}
