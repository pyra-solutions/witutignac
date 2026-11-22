import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Notice } from '../../shared/ui/notice';
import { PageHeader } from '../../shared/ui/page-header';

interface ResultRow {
  release: string;
  set: string;
  f1: string;
  note: string;
}

/** Wyniki własnych testów jakości (szczegóły i metoda: docs/raport-jakosci.md). */
@Component({
  selector: 'app-quality-page',
  imports: [PageHeader, Notice],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header
        heading="Jakość"
        description="F1 liczone pole po polu względem plików wzorcowych organizatora (polecenie evaluate silnika)."
      />

      <app-notice>
        Poprawki stroiliśmy na tych samych danych, na których mierzymy, a 60 spraw cyfrowych pochodzi z jednego generatora.
        Wynik 0,999 to górna granica, a nie prognoza dla ukrytego zbioru realnych spraw. Lepiej przewidują go wyniki na
        skanach.
      </app-notice>

      <section class="card card--flush" aria-labelledby="f1-heading">
        <h2 id="f1-heading" class="section-title">Pełny zbiór organizatora</h2>
        <div class="table-wrap">
          <table class="app-table">
            <thead>
              <tr>
                <th scope="col">Wydanie</th>
                <th scope="col">Zbiór</th>
                <th scope="col" class="num">F1</th>
                <th scope="col">Uwagi</th>
              </tr>
            </thead>
            <tbody>
              @for (row of results; track $index) {
                <tr>
                  <td class="mono">{{ row.release }}</td>
                  <td>{{ row.set }}</td>
                  <td class="num">{{ row.f1 }}</td>
                  <td class="muted">{{ row.note }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section class="card card--flush" aria-labelledby="models-heading">
        <h2 id="models-heading" class="section-title">Modele LLM na 15 sprawach kontrolnych (reguły + LLM)</h2>
        <div class="table-wrap">
          <table class="app-table">
            <thead>
              <tr>
                <th scope="col">Model</th>
                <th scope="col" class="num">Parametry (mld)</th>
                <th scope="col" class="num">F1</th>
              </tr>
            </thead>
            <tbody>
              @for (row of models; track row.model) {
                <tr>
                  <td>{{ row.model }}</td>
                  <td class="num">{{ row.params }}</td>
                  <td class="num">{{ row.f1 }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <ul class="notes">
          <li>Same reguły bez LLM: 0,971 na 15 sprawach kontrolnych, ale około 0,45 na skanach, więc skany zależą od LLM.</li>
          <li>Sam LLM bez reguł, pełny zbiór: Qwen3.5-9B 0,966, Gemma 4 26B 0,964. Reguły są potrzebne, a większy model ich nie zastąpi.</li>
        </ul>
      </section>

      <p class="muted">
        Pełny raport z metodą liczenia, listą poprawek i pozostałymi błędami: <span class="mono">docs/raport-jakosci.md</span>.
        Porównanie modeli i dostawców: <span class="mono">docs/llm.md</span>.
      </p>
    </div>
  `,
  styles: `
    .section-title {
      padding: 16px 24px;
      border-bottom: 1px solid var(--app-border);
    }
    .notes {
      margin: 0;
      padding: 16px 24px 20px 44px;
      color: var(--app-text-muted);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
  `,
})
export class QualityPage {
  protected readonly results: ResultRow[] = [
    { release: '2026.11.21-dev.5', set: '60 spraw cyfrowych i 16 dokumentów negatywnych', f1: '0,999', note: 'precyzja i pełność 0,999' },
    { release: '2026.11.21-dev.5', set: 'całość: 226 plików', f1: '0,990', note: 'precyzja 0,991, pełność 0,988' },
    { release: '2026.11.21-dev.6', set: '30 skanów', f1: '0,935', note: 'tolerancyjne porównanie wartości z tekstem OCR' },
    { release: '2026.11.22-dev.1', set: '30 skanów', f1: '0,942', note: 'przywracanie polskich znaków słownikiem SJP' },
  ];

  // docs/llm.md, pomiar z 21.11.2026: 47 plików PDF, w tym 2 dokumenty negatywne.
  protected readonly models = [
    { model: 'Qwen3.5-9B, FlexAI (domyślny)', params: '9,7', f1: '0,993' },
    { model: 'Ministral 3 3B, Mistral AI', params: '3', f1: '0,966' },
    { model: 'Ministral 3 8B, Mistral AI', params: '8', f1: '0,939' },
  ];
}
