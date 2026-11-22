import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';
import { LlmSchemaDto } from '../../core/api/api.models';
import { ConfigStore } from '../../core/config/config.store';
import { FIELD_TYPE_LABELS, STRATEGY_LABELS, formatNumber } from '../../core/format';
import { EmptyState } from '../../shared/ui/empty-state';
import { PageHeader } from '../../shared/ui/page-header';

@Component({
  selector: 'app-document-type-detail-page',
  imports: [RouterLink, MatTabsModule, MatProgressBarModule, PageHeader, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      @if (config.loading()) {
        <mat-progress-bar mode="indeterminate" aria-label="Wczytywanie konfiguracji" />
      } @else if (type(); as t) {
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
                  <dd>nazwa pliku wejściowego z rozszerzeniem <span class="mono">.json</span></dd>
                  <dt>Profil konwersji</dt>
                  <dd>
                    <a routerLink="/konfiguracja/profile-docling" class="mono">{{ t.conversionProfile }}</a>
                  </dd>
                  <dt>Liczba pól</dt>
                  <dd>{{ t.fields.length }}</dd>
                  <dt>Sekcje dokumentu</dt>
                  <dd>{{ sectionNames() }}</dd>
                  <dt>Wydanie</dt>
                  <dd class="mono">{{ config.version() }}</dd>
                </dl>
              </div>
            </mat-tab>

            <mat-tab label="Klasyfikacja">
              <div class="tab-body stack">
                <p class="muted">
                  Wzorce (wyrażenia regularne) z wagami szukane w tekście dokumentu. Typ wygrywa, gdy suma wag osiąga próg
                  <strong>{{ num(t.minScore) }}</strong>; ujemne wagi wykluczają podobne pisma (np. wyroki, ogłoszenia BZP).
                  Dokument bez typu dostaje pusty plik JSON. Nazwa pliku nie ma znaczenia.
                </p>
                <div class="table-wrap">
                  <table class="app-table">
                    <thead>
                      <tr>
                        <th scope="col">Wzorzec</th>
                        <th scope="col" class="num">Waga</th>
                        <th scope="col">Zakres</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (rule of t.classifier; track $index) {
                        <tr>
                          <td class="mono pattern">{{ rule.pattern }}</td>
                          <td class="num">{{ num(rule.weight) }}</td>
                          <td>{{ rule.firstChars === null ? 'cały dokument' : 'pierwsze ' + rule.firstChars + ' znaków' }}</td>
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
                        <th scope="col">Źródła</th>
                        <th scope="col" class="num">Reguły</th>
                        <th scope="col">Normalizatory</th>
                        <th scope="col">Walidatory</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (field of t.fields; track field.path) {
                        <tr>
                          <td class="mono">{{ field.path }}</td>
                          <td>{{ field.label }}</td>
                          <td>{{ typeLabels[field.type] }}</td>
                          <td>{{ strategyLabels[field.strategy] }}{{ field.derive ? ' (' + field.derive + ')' : '' }}</td>
                          <td class="num">{{ field.ruleCount }}</td>
                          <td class="mono">{{ field.normalizers.join(', ') || '—' }}</td>
                          <td class="mono">{{ field.validators.join(', ') || '—' }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </mat-tab>

            <mat-tab label="Grupy ekstrakcji">
              <div class="tab-body stack">
                <p class="muted">
                  Każda grupa to jedno wywołanie LLM z wybranymi sekcjami tekstu dokumentu. Wartość z LLM silnik przyjmuje
                  tylko wtedy, gdy występuje w tekście dokumentu.
                </p>
                <div class="table-wrap">
                  <table class="app-table">
                    <thead>
                      <tr>
                        <th scope="col">Grupa</th>
                        <th scope="col">Tekst dla LLM</th>
                        <th scope="col">Profil LLM</th>
                        <th scope="col" class="num">Pola</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (group of t.groups; track group.code) {
                        <tr>
                          <td>{{ group.label }} <span class="muted mono">({{ group.code }})</span></td>
                          <td>
                            {{ group.sections.length ? 'sekcje: ' + group.sections.join(', ') : 'cały dokument' }}, do
                            {{ group.maxChars }} znaków
                          </td>
                          <td class="mono">{{ group.llmProfile }}</td>
                          <td class="num">{{ fieldCount(group.code) }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
                @for (group of t.groups; track group.code) {
                  @if (group.instruction) {
                    <p><strong>Instrukcja grupy {{ group.label }}:</strong> {{ group.instruction }}</p>
                  }
                }
              </div>
            </mat-tab>

            <mat-tab label="Schemat dla LLM">
              <div class="tab-body stack">
                <p class="muted">
                  Schemat JSON, który silnik wysyła do modelu jako <span class="mono">response_format: json_schema</span>.
                  Powstaje z definicji pól, więc odpowiedź ma zawsze strukturę z konfiguracji.
                </p>
                @for (s of schemas(); track s.group) {
                  <h3 class="schema-title">Grupa <span class="mono">{{ s.group }}</span> · profil {{ s.llm_profile }}</h3>
                  <pre class="code" tabindex="0" [attr.aria-label]="'Schemat JSON grupy ' + s.group">{{ pretty(s.schema) }}</pre>
                } @empty {
                  <p>Ten typ nie ma pól wypełnianych przez LLM.</p>
                }
              </div>
            </mat-tab>

            <mat-tab label="Plik YAML">
              <div class="tab-body stack">
                <p class="muted">
                  Konfiguracja robocza z <span class="mono">config/seed/document_types/</span>. Zmiany w pliku działają po
                  publikacji nowego wydania.
                </p>
                @if (source() === null) {
                  <mat-progress-bar mode="indeterminate" aria-label="Wczytywanie pliku YAML" />
                } @else if (source()) {
                  <pre class="code" tabindex="0" aria-label="Plik YAML typu dokumentu">{{ source() }}</pre>
                } @else {
                  <p>Brak pliku YAML dla tego typu w konfiguracji roboczej.</p>
                }
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
    .pattern {
      overflow-wrap: anywhere;
    }
    .schema-title {
      font-size: 1rem;
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

  protected readonly config = inject(ConfigStore);
  private readonly http = inject(HttpClient);

  protected readonly typeLabels = FIELD_TYPE_LABELS;
  protected readonly strategyLabels = STRATEGY_LABELS;
  protected readonly type = computed(() => this.config.documentType(this.code()));
  protected readonly schemas = signal<LlmSchemaDto[]>([]);
  protected readonly source = signal<string | null>(null);
  protected readonly sectionNames = computed(() => this.type()?.sections.map((s) => s.name).join(', ') || '—');

  constructor() {
    effect((onCleanup) => {
      const code = encodeURIComponent(this.code());
      this.schemas.set([]);
      this.source.set(null);
      const a = this.http.get<LlmSchemaDto[]>(`/api/document-types/${code}/llm-schemas`).subscribe({
        next: (s) => this.schemas.set(s),
        error: () => this.schemas.set([]),
      });
      const b = this.http.get(`/api/document-types/${code}/source`, { responseType: 'text' }).subscribe({
        next: (text) => this.source.set(text),
        error: () => this.source.set(''),
      });
      onCleanup(() => {
        a.unsubscribe();
        b.unsubscribe();
      });
    });
  }

  protected num(value: number): string {
    return formatNumber(value);
  }

  protected pretty(value: unknown): string {
    return JSON.stringify(value, null, 2);
  }

  protected fieldCount(group: string): number {
    return this.type()?.fields.filter((f) => f.group === group && !f.derive).length ?? 0;
  }
}
