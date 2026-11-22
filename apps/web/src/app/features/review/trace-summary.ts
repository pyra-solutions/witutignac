import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TraceDto } from '../../core/api/api.models';
import { ConfigStore } from '../../core/config/config.store';
import { formatNumber } from '../../core/format';

const GRADES: Record<string, string> = { poor: 'słaba', fair: 'średnia', good: 'dobra', excellent: 'bardzo dobra' };

/** Przebieg przetwarzania jednego dokumentu ze śladu ekstrakcji silnika. */
@Component({
  selector: 'app-trace-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let t = trace();
    <section class="stack" aria-labelledby="trace-class">
      <h3 id="trace-class">Klasyfikacja</h3>
      <p class="muted">
        Rodzaj dokumentu wynika wyłącznie z treści: suma wag wzorców musi osiągnąć próg typu. Wynik:
        <strong>{{ t.doc_type ? config.typeName(t.doc_type) : 'nieobsługiwany (wynik {})' }}</strong>.
      </p>
      <div class="table-wrap">
        <table class="app-table">
          <thead>
            <tr>
              <th scope="col">Typ dokumentu</th>
              <th scope="col" class="num">Wynik</th>
              <th scope="col" class="num">Próg</th>
            </tr>
          </thead>
          <tbody>
            @for (row of scores(); track row.code) {
              <tr [class.chosen]="row.code === t.doc_type">
                <td>{{ row.name }}</td>
                <td class="num">{{ num(row.score) }}</td>
                <td class="num">{{ row.min === null ? '—' : num(row.min) }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>

    @if (t.conversion; as c) {
      <section class="stack" aria-labelledby="trace-conv">
        <h3 id="trace-conv">Konwersja PDF (Docling)</h3>
        <dl class="definition-list">
          <dt>Strony</dt>
          <dd>{{ c.pages }}</dd>
          <dt>Rodzaj pliku</dt>
          <dd>{{ c.scanned ? 'skan bez warstwy tekstowej: OCR całych stron' : 'PDF z warstwą tekstową' }}</dd>
          <dt>Tryb OCR</dt>
          <dd class="mono">{{ c.ocr_mode }}</dd>
          <dt>Jakość odczytu</dt>
          <dd>najsłabsza strona: {{ grade(c.low_grade) }}, średnio: {{ grade(c.mean_grade) }}</dd>
          <dt>Czas konwersji</dt>
          <dd>{{ num(c.seconds, 1) }} s{{ c.from_cache ? ' (wynik z cache)' : '' }}</dd>
          @if (c.restored_diacritics?.length) {
            <dt>Przywrócone polskie znaki</dt>
            <dd>
              {{ c.restored_diacritics.length }} słów, np. {{ c.restored_diacritics.slice(0, 5).join('; ') }}
            </dd>
          }
        </dl>
      </section>
    }

    <section class="stack" aria-labelledby="trace-llm">
      <h3 id="trace-llm">Wywołania modelu językowego</h3>
      @if (t.llm.length) {
        <div class="table-wrap">
          <table class="app-table">
            <thead>
              <tr>
                <th scope="col">Grupa pól</th>
                <th scope="col">Model</th>
                <th scope="col">Dostawca, region</th>
                <th scope="col" class="num">Tokeny we / wy</th>
                <th scope="col" class="num">Czas</th>
              </tr>
            </thead>
            <tbody>
              @for (call of t.llm; track call.group) {
                <tr>
                  <td class="mono">{{ call.group }}</td>
                  <td class="mono">{{ call.model }}</td>
                  <td>{{ call.provider ?? '—' }}{{ call.region ? ', ' + call.region : '' }}</td>
                  <td class="num">{{ call.prompt_tokens ?? '—' }} / {{ call.completion_tokens ?? '—' }}</td>
                  <td class="num">{{ num(call.seconds, 1) }} s{{ call.from_cache ? ' (cache)' : '' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <p class="muted">
          Brak wywołań. Dokument nieobsługiwanego typu nie trafia do modelu, a bez klucza API silnik działa na samych
          regułach.
        </p>
      }
    </section>

    @if (t.errors.length) {
      <section class="stack" aria-labelledby="trace-errors">
        <h3 id="trace-errors">Błędy</h3>
        <ul class="errors">
          @for (err of t.errors; track err) {
            <li>{{ err }}</li>
          }
        </ul>
      </section>
    }

    <p class="muted small">Wydanie konfiguracji: <span class="mono">{{ t.release }}</span> · plik {{ t.file }}</p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    h3 {
      font-size: 1rem;
    }
    tr.chosen td {
      font-weight: 700;
    }
    .errors {
      margin: 0;
      padding-left: 20px;
      color: var(--app-error);
    }
    .small {
      font-size: 0.8125rem;
    }
  `,
})
export class TraceSummary {
  protected readonly config = inject(ConfigStore);
  readonly trace = input.required<TraceDto>();

  protected readonly scores = computed(() => {
    const scores = this.trace().classification_scores ?? {};
    return Object.entries(scores)
      .map(([code, score]) => ({
        code,
        name: this.config.typeName(code),
        score,
        min: this.config.documentType(code)?.minScore ?? null,
      }))
      .sort((a, b) => b.score - a.score);
  });

  protected num(value: number | null | undefined, digits = 2): string {
    return formatNumber(value, digits);
  }

  protected grade(value: string | null): string {
    return value ? (GRADES[value] ?? value) : '—';
  }
}
