import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';
import { CONVERSION_PROFILES, LLM_PROFILES, findDocumentType } from '../../core/config/mock-config';
import { buildJsonSchema } from '../../core/extraction/json-schema';
import { METHOD_LABELS } from '../../core/format';
import { ExtractionStrategy } from '../../core/models/config.model';
import { EmptyState } from '../../shared/ui/empty-state';
import { PageHeader } from '../../shared/ui/page-header';

@Component({
  selector: 'app-document-type-detail-page',
  imports: [RouterLink, MatTabsModule, PageHeader, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      @if (type(); as t) {
        <app-page-header
          [heading]="t.name"
          [description]="t.description"
          [breadcrumbs]="[{ label: 'Typy dokumentów', link: '/konfiguracja/typy-dokumentow' }, { label: t.name }]"
        />
        <section class="card card--flush">
          <mat-tab-group mat-stretch-tabs="false" animationDuration="0ms">
            <mat-tab label="Ogólne">
              <div class="tab-body">
                <dl class="definition-list">
                  <dt>Kod</dt>
                  <dd class="mono">{{ t.code }}</dd>
                  <dt>Plik wynikowy</dt>
                  <dd class="mono">{{ t.outputFile }}</dd>
                  <dt>Profil Docling</dt>
                  <dd>
                    <a routerLink="/konfiguracja/profile-docling">{{ profileName() }}</a>
                  </dd>
                  <dt>Liczba pól</dt>
                  <dd>{{ t.fields.length }}</dd>
                </dl>
              </div>
            </mat-tab>

            <mat-tab label="Klasyfikacja">
              <div class="tab-body stack">
                <p class="muted">
                  Słowa kluczowe z wagami liczone na Markdown pierwszej strony. Przy niskiej pewności typ wybiera LLM
                  z listy opisów typów; dokument spoza listy dostaje pusty plik JSON.
                </p>
                <div class="table-wrap">
                  <table class="app-table">
                    <thead>
                      <tr>
                        <th scope="col">Fraza</th>
                        <th scope="col" class="num">Waga</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (rule of t.classifier; track rule.term) {
                        <tr>
                          <td>{{ rule.term }}</td>
                          <td class="num">{{ rule.weight }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </mat-tab>

            <mat-tab label="Pola">
              <div class="tab-body">
                <div class="table-wrap">
                  <table class="app-table">
                    <thead>
                      <tr>
                        <th scope="col">Ścieżka</th>
                        <th scope="col">Etykieta</th>
                        <th scope="col">Typ</th>
                        <th scope="col">Strategie</th>
                        <th scope="col">Normalizatory</th>
                        <th scope="col">Walidatory</th>
                        <th scope="col">Null</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (field of t.fields; track field.path) {
                        <tr>
                          <td class="mono">{{ field.path }}</td>
                          <td>{{ field.label }}</td>
                          <td>{{ field.type }}</td>
                          <td>{{ strategies(field.strategies) }}</td>
                          <td class="mono">{{ field.normalizers.join(', ') || '—' }}</td>
                          <td class="mono">{{ field.validators.join(', ') || '—' }}</td>
                          <td>{{ field.nullable ? 'tak' : 'nie' }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </mat-tab>

            <mat-tab label="Grupy ekstrakcji">
              <div class="tab-body stack">
                <p class="muted">Każda grupa to jedno wywołanie LLM z własnym fragmentem Markdown.</p>
                <div class="table-wrap">
                  <table class="app-table">
                    <thead>
                      <tr>
                        <th scope="col">Grupa</th>
                        <th scope="col">Kontekst dla LLM</th>
                        <th scope="col">Model</th>
                        <th scope="col" class="num">Pola</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (group of t.groups; track group.code) {
                        <tr>
                          <td>{{ group.label }}</td>
                          <td>{{ group.context }}</td>
                          <td>{{ modelName(group.llmProfile) }}</td>
                          <td class="num">{{ fieldCount(group.code) }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </mat-tab>

            <mat-tab label="Schemat JSON">
              <div class="tab-body stack">
                <p class="muted">
                  Schemat generowany z definicji pól. Silnik przekazuje go do LLM jako
                  <span class="mono">response_format: json_schema</span>, więc odpowiedź ma zawsze tę strukturę.
                </p>
                <pre class="code" tabindex="0" aria-label="Schemat JSON">{{ schema() }}</pre>
              </div>
            </mat-tab>
          </mat-tab-group>
        </section>
      } @else {
        <app-empty-state icon="search" heading="Nie znaleziono typu dokumentu">
          Typ „{{ code() }}” nie istnieje. <a routerLink="/konfiguracja/typy-dokumentow">Wróć do listy</a>.
        </app-empty-state>
      }
    </div>
  `,
  styles: `
    .tab-body {
      padding: 20px 24px 24px;
    }
    @media (max-width: 767px) {
      .tab-body {
        padding: 12px;
      }
    }
    .code {
      margin: 0;
      padding: 16px;
      max-height: 60vh;
      overflow: auto;
      border: 1px solid var(--app-border);
      border-radius: var(--app-radius);
      background: var(--mat-sys-surface-container-low);
      font-family: var(--app-mono);
      font-size: 0.8125rem;
    }
  `,
})
export class DocumentTypeDetailPage {
  readonly code = input.required<string>();

  protected readonly type = computed(() => findDocumentType(this.code()));
  protected readonly schema = computed(() => {
    const type = this.type();
    return type ? JSON.stringify(buildJsonSchema(type), null, 2) : '';
  });
  protected readonly profileName = computed(
    () => CONVERSION_PROFILES.find((p) => p.code === this.type()?.conversionProfile)?.name ?? '—',
  );

  protected strategies(list: ExtractionStrategy[]): string {
    return list.map((s) => METHOD_LABELS[s]).join(' → ');
  }

  protected modelName(code: string): string {
    return LLM_PROFILES.find((p) => p.code === code)?.model ?? code;
  }

  protected fieldCount(group: string): number {
    return this.type()?.fields.filter((f) => f.group === group).length ?? 0;
  }
}
