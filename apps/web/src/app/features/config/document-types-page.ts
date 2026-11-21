import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONVERSION_PROFILES, DOCUMENT_TYPES } from '../../core/config/mock-config';
import { Notice } from '../../shared/ui/notice';
import { PageHeader } from '../../shared/ui/page-header';

@Component({
  selector: 'app-document-types-page',
  imports: [RouterLink, PageHeader, Notice],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header
        heading="Typy dokumentów"
        description="Każdy typ to plik konfiguracyjny YAML: reguły klasyfikacji, pola, grupy ekstrakcji i profil Docling. Nowy typ nie wymaga zmian w kodzie."
      />
      <app-notice>
        Makieta pokazuje konfigurację w trybie odczytu. Edycja, szkic i publikacja wydania będą dostępne po podłączeniu API.
      </app-notice>
      <section class="card card--flush" aria-label="Lista typów dokumentów">
        <div class="table-wrap">
          <table class="app-table">
            <thead>
              <tr>
                <th scope="col">Nazwa</th>
                <th scope="col">Kod</th>
                <th scope="col" class="num">Pola</th>
                <th scope="col" class="num">Grupy ekstrakcji</th>
                <th scope="col">Profil Docling</th>
                <th scope="col">Plik wynikowy</th>
              </tr>
            </thead>
            <tbody>
              @for (type of types; track type.code) {
                <tr>
                  <td><a [routerLink]="['/konfiguracja/typy-dokumentow', type.code]">{{ type.name }}</a></td>
                  <td class="mono">{{ type.code }}</td>
                  <td class="num">{{ type.fields.length }}</td>
                  <td class="num">{{ type.groups.length }}</td>
                  <td>{{ profileName(type.conversionProfile) }}</td>
                  <td class="mono">{{ type.outputFile }}</td>
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
  protected readonly types = DOCUMENT_TYPES;

  protected profileName(code: string): string {
    return CONVERSION_PROFILES.find((p) => p.code === code)?.name ?? code;
  }
}
