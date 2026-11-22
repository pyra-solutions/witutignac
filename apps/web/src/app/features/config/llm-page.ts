import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ConfigStore } from '../../core/config/config.store';
import { formatNumber } from '../../core/format';
import { Notice } from '../../shared/ui/notice';
import { PageHeader } from '../../shared/ui/page-header';

@Component({
  selector: 'app-llm-page',
  imports: [MatProgressBarModule, PageHeader, Notice],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header
        heading="Modele LLM"
        description="Dostawcy API zgodnego z OpenAI i profile modeli z aktywnego wydania. Wszystkie modele mają otwarte wagi, a dane są przetwarzane w UE."
      />

      @if (config.system(); as s) {
        <app-notice [tone]="s.llm.enabled ? 'info' : 'warning'">
          @if (s.llm.enabled) {
            Silnik używa profilu <span class="mono">{{ s.llm.profile }}</span>: model
            <span class="mono">{{ s.llm.model }}</span> przez <span class="mono">{{ s.llm.base_url }}</span>. Klucz:
            {{ s.llm.key }}.
          } @else {
            Model językowy jest wyłączony (brak klucza API). Dodaj klucz do pliku <span class="mono">.env</span> w katalogu
            głównym, na wzór <span class="mono">.env.example</span>, i uruchom aplikację ponownie.
          }
        </app-notice>
      }
      @if (config.loading()) {
        <mat-progress-bar mode="indeterminate" aria-label="Wczytywanie konfiguracji" />
      }

      <section class="card card--flush" aria-labelledby="profiles-heading">
        <h2 id="profiles-heading" class="section-title">Profile modeli</h2>
        <div class="table-wrap">
          <table class="app-table">
            <thead>
              <tr>
                <th scope="col">Profil</th>
                <th scope="col">Model</th>
                <th scope="col" class="num">Parametry (mld)</th>
                <th scope="col">Licencja</th>
                <th scope="col">Dostawca API</th>
                <th scope="col">Ustawienia</th>
                <th scope="col">Uwagi</th>
              </tr>
            </thead>
            <tbody>
              @for (row of profiles(); track row.code) {
                <tr>
                  <td class="mono">
                    {{ row.code }}
                    @if (row.isDefault) {
                      <span class="chip">domyślny</span>
                    }
                  </td>
                  <td class="model">{{ row.model ?? '—' }}</td>
                  <td class="num">{{ num(row.info?.paramsBillions ?? null) }}</td>
                  <td>{{ row.info?.license || '—' }}</td>
                  <td>{{ row.provider?.name ?? row.baseUrl ?? '—' }}</td>
                  <td class="small">
                    temperatura {{ num(row.temperature) }}, do {{ row.maxTokens }} tokenów, odpowiedź
                    {{ row.structuredOutput }}, klucz {{ row.apiKeyEnv }}
                  </td>
                  <td class="muted small">{{ row.info?.note ?? '' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section class="card card--flush" aria-labelledby="providers-heading">
        <h2 id="providers-heading" class="section-title">Dostawcy</h2>
        <div class="table-wrap">
          <table class="app-table">
            <thead>
              <tr>
                <th scope="col">Dostawca</th>
                <th scope="col">Przetwarzanie danych</th>
                <th scope="col">Adres API</th>
                <th scope="col">Uwagi</th>
              </tr>
            </thead>
            <tbody>
              @for (provider of config.providers(); track provider.code) {
                <tr>
                  <td>{{ provider.name }}</td>
                  <td>{{ provider.dataLocation ?? '—' }}</td>
                  <td class="mono">{{ provider.baseUrl }}</td>
                  <td class="muted">{{ provider.note }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
      <p class="muted">
        Metadane dostawców i modeli: <span class="mono">config/seed/llm_providers.yaml</span>. Porównanie modeli i opis
        użycia: <span class="mono">docs/llm.md</span>.
      </p>
    </div>
  `,
  styles: `
    .section-title {
      padding: 16px 24px;
      border-bottom: 1px solid var(--app-border);
    }
    .model {
      font-family: var(--app-mono);
      font-size: 0.875rem;
      white-space: nowrap;
    }
    .small {
      font-size: 0.875rem;
    }
    .chip {
      margin-left: 6px;
      padding: 0 8px;
      border-radius: 999px;
      border: 1px solid var(--app-accent);
      color: var(--app-accent);
      font-family: inherit;
      font-size: 0.75rem;
    }
  `,
})
export class LlmPage {
  protected readonly config = inject(ConfigStore);

  protected readonly profiles = computed(() =>
    this.config.llmProfiles().map((p) => ({
      ...p,
      info: this.config.models().find((m) => m.model === p.model),
      provider: this.config.providers().find((pr) => p.baseUrl && pr.baseUrl.replace(/\/$/, '') === p.baseUrl.replace(/\/$/, '')),
    })),
  );

  protected num(value: number | null): string {
    return formatNumber(value);
  }
}
