import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import type { PDFDocumentProxy } from 'pdfjs-dist';

interface TextBox {
  left: number;
  top: number;
  width: number;
  height: number;
  /** Znaki fragmentu (ze spacjami) i krój pisma: do zawężania ramki do dopasowanej części. */
  chars: string[];
  fontFamily: string;
}

interface PageIndex {
  wrapper: HTMLElement;
  layer: HTMLElement;
  boxes: TextBox[];
  /** Znormalizowany tekst strony bez białych znaków. */
  text: string;
  /** Dla każdego znaku `text`: numer fragmentu tekstu i pozycja znaku w oryginalnym fragmencie. */
  owners: number[];
  offsets: number[];
}

interface PdfTextItem {
  str: string;
  transform: number[];
  width: number;
  fontName?: string;
}

let measureContext: CanvasRenderingContext2D | null = null;

/** Szerokość tekstu w kroju dokumentu; służy tylko do proporcji wewnątrz jednego fragmentu. */
function measure(text: string, fontFamily: string): number {
  measureContext ??= document.createElement('canvas').getContext('2d');
  if (!measureContext) return text.length;
  measureContext.font = `100px ${fontFamily}`;
  return measureContext.measureText(text).width;
}

const WORKER_URL = 'pdfjs/pdf.worker.min.mjs';
const MAX_SCALE = 2;

function isTextItem(item: unknown): item is PdfTextItem {
  return typeof item === 'object' && item !== null && 'str' in item && 'transform' in item;
}

function normalizeChar(ch: string): string {
  if ('„”“"«»'.includes(ch)) return '"';
  if ('‘’'.includes(ch)) return "'";
  if ('–—‐'.includes(ch)) return '-';
  return ch.toLowerCase();
}

/** Usuwa białe znaki i ujednolica cudzysłowy, myślniki i wielkość liter. */
export function normalizeForSearch(text: string): string {
  return Array.from(text.replace(/\s+/g, ''), normalizeChar).join('');
}

/**
 * Podgląd PDF (pdf.js) z podświetlaniem źródła wartości.
 * Szuka kolejnych kandydatów w warstwie tekstowej i obrysowuje pasujące fragmenty.
 */
@Component({
  selector: 'app-pdf-viewer',
  imports: [MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (state() === 'loading') {
      <mat-progress-bar mode="indeterminate" aria-label="Wczytywanie dokumentu PDF" />
    }
    @if (state() === 'error') {
      <p class="app-pdf-error">
        Nie udało się wyświetlić dokumentu.
        <a [href]="src()" target="_blank" rel="noopener noreferrer">Otwórz plik PDF</a>.
      </p>
    }
    <div #pages class="app-pdf-pages" role="region" aria-label="Podgląd dokumentu PDF"></div>
    <p class="visually-hidden" aria-live="polite">{{ announcement() }}</p>
  `,
  styles: `
    app-pdf-viewer {
      display: block;
      background: var(--mat-sys-surface-container-high);
      border-radius: var(--app-radius);
    }
    .app-pdf-pages {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 16px;
    }
    .app-pdf-page {
      position: relative;
      max-width: 100%;
      background: #fff;
      box-shadow: 0 1px 3px rgba(16, 24, 40, 0.18);
    }
    .app-pdf-page canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
    .app-pdf-highlights {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .app-pdf-hl {
      position: absolute;
      background: var(--app-highlight);
      outline: 2px solid var(--app-highlight-border);
      border-radius: 2px;
    }
    .app-pdf-error {
      padding: 16px;
      color: var(--app-error);
    }
  `,
})
export class PdfViewer {
  readonly src = input.required<string>();
  /** Teksty do podświetlenia, w kolejności prób; pierwszy znaleziony wygrywa. */
  readonly highlight = input<string[]>([]);
  /** true, gdy któryś kandydat został znaleziony; null, gdy nic nie szukano. */
  readonly matched = output<boolean | null>();

  protected readonly state = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');
  protected readonly announcement = signal('');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly pagesEl = viewChild.required<ElementRef<HTMLElement>>('pages');

  private doc: PDFDocumentProxy | null = null;
  private docSrc = '';
  private pages: PageIndex[] = [];
  private renderToken = 0;
  private renderedWidth = 0;
  private resizeTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const observer = new ResizeObserver(() => this.onResize());
      observer.observe(this.host.nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });

    effect(() => {
      this.src();
      untracked(() => void this.render());
    });

    effect(() => {
      const candidates = this.highlight();
      if (this.state() === 'ready') untracked(() => this.applyHighlight(candidates));
    });

    destroyRef.onDestroy(() => {
      this.renderToken++;
      if (this.resizeTimer) clearTimeout(this.resizeTimer);
      void this.doc?.loadingTask.destroy();
    });
  }

  private onResize(): void {
    const width = this.availableWidth();
    if (width <= 0 || Math.abs(width - this.renderedWidth) < 24) return;
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => void this.render(), 200);
  }

  private availableWidth(): number {
    // Szerokość obszaru stron minus wewnętrzne marginesy (2 × 16 px).
    return Math.floor(this.host.nativeElement.clientWidth - 32);
  }

  private async render(): Promise<void> {
    const width = this.availableWidth();
    if (width <= 0) return;
    const token = ++this.renderToken;
    const src = this.src();
    this.state.set('loading');

    try {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(WORKER_URL, document.baseURI).href;

      if (!this.doc || this.docSrc !== src) {
        await this.doc?.loadingTask.destroy();
        this.doc = await pdfjs.getDocument({ url: new URL(src, document.baseURI).href }).promise;
        this.docSrc = src;
      }
      const doc = this.doc;
      const pixelRatio = window.devicePixelRatio || 1;
      const pages: PageIndex[] = [];

      for (let number = 1; number <= doc.numPages; number++) {
        const page = await doc.getPage(number);
        const scale = Math.min(width / page.getViewport({ scale: 1 }).width, MAX_SCALE);
        const viewport = page.getViewport({ scale });

        const wrapper = document.createElement('div');
        wrapper.className = 'app-pdf-page';
        wrapper.style.width = `${viewport.width}px`;
        wrapper.style.height = `${viewport.height}px`;
        wrapper.setAttribute('role', 'img');
        wrapper.setAttribute('aria-label', `Strona ${number} z ${doc.numPages}`);

        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        const layer = document.createElement('div');
        layer.className = 'app-pdf-highlights';
        wrapper.append(canvas, layer);

        await page.render({
          canvas,
          viewport,
          transform: pixelRatio !== 1 ? [pixelRatio, 0, 0, pixelRatio, 0, 0] : undefined,
        }).promise;

        const content = await page.getTextContent();
        if (token !== this.renderToken) return;

        const boxes: TextBox[] = [];
        let text = '';
        const owners: number[] = [];
        const offsets: number[] = [];
        for (const item of content.items) {
          if (!isTextItem(item) || !item.str.trim()) continue;
          const chars = Array.from(item.str);
          const tx = pdfjs.Util.transform(viewport.transform, item.transform) as number[];
          const fontHeight = Math.hypot(tx[2], tx[3]);
          const index = boxes.length;
          boxes.push({
            left: tx[4],
            top: tx[5] - fontHeight,
            width: item.width * scale,
            height: fontHeight * 1.2,
            chars,
            fontFamily: (item.fontName && content.styles[item.fontName]?.fontFamily) || 'sans-serif',
          });
          chars.forEach((ch, rawIndex) => {
            if (/\s/.test(ch)) return;
            for (const normalized of normalizeChar(ch)) {
              text += normalized;
              owners.push(index);
              offsets.push(rawIndex);
            }
          });
        }
        pages.push({ wrapper, layer, boxes, text, owners, offsets });
      }

      if (token !== this.renderToken) return;
      this.pagesEl().nativeElement.replaceChildren(...pages.map((p) => p.wrapper));
      this.pages = pages;
      this.renderedWidth = width;
      this.state.set('ready');
      this.applyHighlight(this.highlight());
    } catch {
      if (token === this.renderToken) this.state.set('error');
    }
  }

  private applyHighlight(candidates: string[]): void {
    for (const page of this.pages) page.layer.replaceChildren();
    if (!candidates.length) {
      this.announcement.set('');
      this.matched.emit(null);
      return;
    }

    for (const candidate of candidates) {
      const needle = normalizeForSearch(candidate);
      if (!needle) continue;
      for (const [pageIndex, page] of this.pages.entries()) {
        const start = page.text.indexOf(needle);
        if (start < 0) continue;
        // Zakres znaków w każdym fragmencie: ramka obejmuje tylko dopasowaną część linii.
        const spans = new Map<number, { from: number; to: number }>();
        for (let pos = start; pos < start + needle.length; pos++) {
          const owner = page.owners[pos];
          const offset = page.offsets[pos];
          const span = spans.get(owner);
          spans.set(owner, span ? { from: span.from, to: offset } : { from: offset, to: offset });
        }
        const marks = [...spans].map(([i, span]) => {
          const box = page.boxes[i];
          const full = measure(box.chars.join(''), box.fontFamily) || 1;
          const before = measure(box.chars.slice(0, span.from).join(''), box.fontFamily);
          const matched = measure(box.chars.slice(span.from, span.to + 1).join(''), box.fontFamily);
          const mark = document.createElement('div');
          mark.className = 'app-pdf-hl';
          mark.style.left = `${box.left + (box.width * before) / full - 2}px`;
          mark.style.top = `${box.top - 1}px`;
          mark.style.width = `${(box.width * matched) / full + 4}px`;
          mark.style.height = `${box.height + 2}px`;
          return mark;
        });
        page.layer.replaceChildren(...marks);
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        marks[0]?.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
        this.announcement.set(`Podświetlono źródło wartości na stronie ${pageIndex + 1}.`);
        this.matched.emit(true);
        return;
      }
    }
    this.announcement.set('Nie znaleziono wartości w tekście dokumentu.');
    this.matched.emit(false);
  }
}
