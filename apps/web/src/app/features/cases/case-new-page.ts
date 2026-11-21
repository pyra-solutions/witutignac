import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Notice } from '../../shared/ui/notice';
import { PageHeader } from '../../shared/ui/page-header';

const STAGES = ['W kolejce', 'Konwersja Docling', 'Klasyfikacja', 'Ekstrakcja LLM', 'Walidacja', 'Gotowe'] as const;
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const ACCEPTED = /\.(pdf|zip)$/i;

interface QueuedFile {
  id: number;
  name: string;
  size: number;
  stage: number;
  error: string | null;
}

@Component({
  selector: 'app-case-new-page',
  imports: [MatButtonModule, MatIconModule, MatProgressBarModule, PageHeader, Notice],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header
        heading="Nowa sprawa"
        description="Dodaj dokumenty sprawy: odwołanie, pełnomocnictwa i potwierdzenia przelewów (PDF lub archiwum ZIP)."
        [breadcrumbs]="[{ label: 'Sprawy', link: '/sprawy' }, { label: 'Nowa sprawa' }]"
      />

      <app-notice tone="warning">
        Makieta: pliki nie są wysyłane na serwer. Postęp przetwarzania jest symulowany, żeby pokazać etapy potoku.
      </app-notice>

      <section class="card stack" aria-labelledby="upload-heading">
        <h2 id="upload-heading">Pliki</h2>
        <div
          class="dropzone"
          [class.dragging]="dragging()"
          (dragover)="onDragOver($event)"
          (dragleave)="dragging.set(false)"
          (drop)="onDrop($event)"
        >
          <mat-icon svgIcon="upload" aria-hidden="true" />
          <p>Przeciągnij pliki tutaj albo</p>
          <label class="file-button">
            <input #picker type="file" multiple accept=".pdf,.zip,application/pdf,application/zip" (change)="onPick(picker)" />
            <span>Wybierz pliki</span>
          </label>
          <p class="muted hint">PDF lub ZIP, do 20 MB na plik.</p>
        </div>

        @if (files().length) {
          <ul class="file-list" aria-label="Wybrane pliki">
            @for (file of files(); track file.id) {
              <li>
                <div class="file-row">
                  <mat-icon svgIcon="picture_as_pdf" aria-hidden="true" />
                  <span class="file-name">{{ file.name }}</span>
                  <span class="muted">{{ formatSize(file.size) }}</span>
                  <span class="spacer"></span>
                  @if (file.error) {
                    <span class="error">{{ file.error }}</span>
                  } @else {
                    <span class="stage">{{ stages[file.stage] }}</span>
                  }
                  @if (!running()) {
                    <button mat-icon-button type="button" (click)="remove(file.id)" [attr.aria-label]="'Usuń ' + file.name">
                      <mat-icon svgIcon="close" aria-hidden="true" />
                    </button>
                  }
                </div>
                @if (!file.error) {
                  <mat-progress-bar
                    mode="determinate"
                    [value]="(file.stage / (stages.length - 1)) * 100"
                    [attr.aria-label]="'Postęp: ' + file.name"
                  />
                }
              </li>
            }
          </ul>
        }

        <div class="row">
          <button mat-flat-button type="button" [disabled]="!canStart()" (click)="start()">Rozpocznij przetwarzanie</button>
          @if (files().length && !running()) {
            <button mat-button type="button" (click)="clear()">Wyczyść listę</button>
          }
          <span class="muted" aria-live="polite">{{ summary() }}</span>
        </div>
      </section>
    </div>
  `,
  styles: `
    .dropzone {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 32px 16px;
      border: 2px dashed var(--app-border);
      border-radius: var(--app-radius);
      background: var(--mat-sys-surface-container-low);
      text-align: center;
    }
    .dropzone.dragging {
      border-color: var(--app-accent);
      background: var(--app-accent-soft);
    }
    .dropzone mat-icon {
      width: 36px;
      height: 36px;
      color: var(--app-accent);
    }
    .file-button input {
      position: absolute;
      opacity: 0;
      width: 1px;
      height: 1px;
    }
    .file-button span {
      display: inline-block;
      padding: 8px 20px;
      border-radius: 999px;
      border: 1px solid var(--app-accent);
      color: var(--app-accent);
      font-weight: 600;
      cursor: pointer;
    }
    .file-button:focus-within span {
      outline: 3px solid var(--app-focus);
      outline-offset: 2px;
    }
    .hint {
      font-size: 0.875rem;
    }
    .file-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .file-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      min-height: 40px;
    }
    .file-name {
      font-weight: 600;
      overflow-wrap: anywhere;
    }
    .stage {
      font-size: 0.875rem;
      color: var(--app-text-muted);
    }
    .error {
      color: var(--app-error);
      font-size: 0.875rem;
    }
  `,
})
export class CaseNewPage {
  protected readonly stages = STAGES;
  protected readonly files = signal<QueuedFile[]>([]);
  protected readonly dragging = signal(false);
  protected readonly running = signal(false);

  private nextId = 1;
  private timer: ReturnType<typeof setInterval> | null = null;

  protected readonly canStart = computed(
    () => !this.running() && this.files().some((f) => !f.error && f.stage === 0),
  );

  protected readonly summary = computed(() => {
    const valid = this.files().filter((f) => !f.error);
    if (!valid.length) return '';
    const done = valid.filter((f) => f.stage === STAGES.length - 1).length;
    return this.running() || done ? `Przetworzone: ${done} z ${valid.length}` : `Gotowe do przetworzenia: ${valid.length}`;
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    this.add(Array.from(event.dataTransfer?.files ?? []));
  }

  protected onPick(input: HTMLInputElement): void {
    this.add(Array.from(input.files ?? []));
    input.value = '';
  }

  protected remove(id: number): void {
    this.files.update((files) => files.filter((f) => f.id !== id));
  }

  protected clear(): void {
    this.files.set([]);
  }

  protected start(): void {
    this.running.set(true);
    this.timer = setInterval(() => this.tick(), 700);
  }

  protected formatSize(bytes: number): string {
    return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  private add(picked: File[]): void {
    const queued = picked.map((file) => ({
      id: this.nextId++,
      name: file.name,
      size: file.size,
      stage: 0,
      error: !ACCEPTED.test(file.name)
        ? 'Nieobsługiwany format (tylko PDF lub ZIP)'
        : file.size > MAX_FILE_BYTES
          ? 'Plik większy niż 20 MB'
          : null,
    }));
    this.files.update((files) => [...files, ...queued]);
  }

  /** Symulacja: w każdym kroku pierwszy nieukończony plik przechodzi do następnego etapu. */
  private tick(): void {
    const last = STAGES.length - 1;
    const pending = this.files().find((f) => !f.error && f.stage < last);
    if (!pending) {
      this.stop();
      return;
    }
    this.files.update((files) => files.map((f) => (f.id === pending.id ? { ...f, stage: f.stage + 1 } : f)));
  }

  private stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.running.set(false);
  }
}
