import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LLM_PROFILES, LLM_PROVIDERS } from '../../core/config/mock-config';
import { formatPrice } from '../../core/format';
import { ProviderRole } from '../../core/models/config.model';
import { Notice } from '../../shared/ui/notice';
import { PageHeader } from '../../shared/ui/page-header';

const ROLE_LABELS: Record<ProviderRole, string> = {
  ocena: 'Do oceny',
  zapasowy: 'Zapasowy',
  docelowy: 'Docelowy',
};

@Component({
  selector: 'app-llm-page',
  imports: [PageHeader, Notice],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header
        heading="Modele LLM"
        description="Dostawcy API zgodnego z OpenAI i profile modeli. Wszystkie modele mają otwarte wagi, a dane są przetwarzane w UE."
      />

      <app-notice>
        W etapie 2 mniejszy model daje więcej punktów, więc wybieramy najmniejszy, który utrzyma F1 na zbiorze
        kontrolnym. Wszystkie profile używają temperatury 0 i odpowiedzi wymuszonej schematem JSON. Ceny i parametry
        pochodzą z publicznego katalogu OVHcloud (stan na 21.11.2026).
      </app-notice>

      <section class="card card--flush" aria-labelledby="providers-heading">
        <h2 id="providers-heading" class="section-title">Dostawcy</h2>
        <div class="table-wrap">
          <table class="app-table">
            <thead>
              <tr>
                <th scope="col">Dostawca</th>
                <th scope="col">Rola</th>
                <th scope="col">Przetwarzanie danych</th>
                <th scope="col">Adres API</th>
                <th scope="col">Uwagi</th>
              </tr>
            </thead>
            <tbody>
              @for (provider of providers; track provider.code) {
                <tr>
                  <td>{{ provider.name }}</td>
                  <td>{{ roleLabels[provider.role] }}</td>
                  <td>{{ provider.dataLocation }}</td>
                  <td class="mono">{{ provider.baseUrl }}</td>
                  <td class="muted">{{ provider.note }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section class="card card--flush" aria-labelledby="profiles-heading">
        <h2 id="profiles-heading" class="section-title">Profile modeli</h2>
        <div class="table-wrap">
          <table class="app-table">
            <thead>
              <tr>
                <th scope="col">Model</th>
                <th scope="col" class="num">Parametry (mld)</th>
                <th scope="col">Licencja</th>
                <th scope="col" class="num">USD za 1 mln tokenów: wejście / wyjście</th>
                <th scope="col">Kontekst</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              @for (profile of profiles; track profile.code) {
                <tr>
                  <td class="model">{{ profile.model }}</td>
                  <td class="num">{{ number(profile.paramsBillions) }}</td>
                  <td>{{ profile.license }}</td>
                  <td class="num">{{ price(profile.priceIn) }} / {{ price(profile.priceOut) }}</td>
                  <td>{{ profile.context }}</td>
                  <td>{{ profile.status }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
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
  `,
})
export class LlmPage {
  protected readonly providers = LLM_PROVIDERS;
  protected readonly profiles = LLM_PROFILES;
  protected readonly roleLabels = ROLE_LABELS;
  protected readonly price = formatPrice;
  protected readonly number = (value: number) => new Intl.NumberFormat('pl-PL').format(value);
}
