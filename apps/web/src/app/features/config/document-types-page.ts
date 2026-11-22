import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { ConfigStore } from '../../core/config/config.store';
import { formatNumber } from '../../core/format';
import { Notice } from '../../shared/ui/notice';
import { PageHeader } from '../../shared/ui/page-header';

@Component({
  selector: 'app-document-types-page',
  imports: [RouterLink, MatProgressBarModule, PageHeader, Notice],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header
        heading="Typy dokumentów"
        description="Każdy typ to plik YAML: reguły klasyfikacji, sekcje, pola, grupy ekstrakcji LLM i profil konwersji. Nowy typ nie wymaga zmian w kodzie."
      />
      <app-notice>
        Ekran pokazuje konfigurację, której używa silnik: wydanie <span class="mono">{{ config.version() }}</span> z pliku
        <span class="mono">{{ config.source() }}</span>. Nowy typ dokumentu to nowy plik w
        <span class="mono">config/seed/document_types/</span> i publikacja wydania poleceniem
        <span class="mono">python backend/manage.py publish --version …</span> (opis w docs/silnik.md).
      </app-notice>
      @if (config.loading()) {
        <mat-progress-bar mode="indeterminate" aria-label="Wczytywanie konfiguracji" />
      } @else if (config.error()) {
        <app-notice tone="warning">{{ config.error() }}</app-notice>
      }
      <section class="card card--flush" aria-label="Lista typów dokumentów">
        <div class="table-wrap">
          <table class="app-table">
            <thead>
              <tr>
                <th scope="col">Nazwa</th>
                <th scope="col">Kod</th>
                <th scope="col" class="num">Pola</th>
                <th scope="col" class="num">Grupy LLM</th>
                <th scope="col" class="num">Wzorce klasyfikacji</th>
                <th scope="col" class="num">Próg</th>
                <th scope="col">Profil konwersji</th>
              </tr>
            </thead>
            <tbody>
              @for (type of config.documentTypes(); track type.code) {
                <tr>
                  <td><a [routerLink]="['/konfiguracja/typy-dokumentow', type.code]">{{ type.name }}</a></td>
                  <td class="mono">{{ type.code }}</td>
                  <td class="num">{{ type.fields.length }}</td>
                  <td class="num">{{ type.groups.length }}</td>
                  <td class="num">{{ type.classifier.length }}</td>
                  <td class="num">{{ num(type.minScore) }}</td>
                  <td class="mono">{{ type.conversionProfile }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
})
export class DocumentTypesPage {
  protected readonly config = inject(ConfigStore);
  protected readonly num = (value: number) => formatNumber(value);
}
