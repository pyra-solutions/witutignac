import { HttpEventType } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { apiErrorMessage, rejectedFiles } from '../../core/api/errors';
import { CasesStore } from '../../core/data/cases.store';
import { formatSize } from '../../core/format';
import { Notice } from '../../shared/ui/notice';
import { PageHeader } from '../../shared/ui/page-header';

// Limity jak w backendzie (backend/o2j_backend/cases.py).
const MAX_PDF_BYTES = 50 * 1024 * 1024;
const MAX_ZIP_BYTES = 500 * 1024 * 1024;
const ACCEPTED = /\.(pdf|zip)$/i;

interface QueuedFile {
  id: number;
  file: File;
  error: string | null;
}

@Component({
  selector: 'app-case-new-page',
  imports: [MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatProgressBarModule, PageHeader, Notice],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header
        heading="Nowa sprawa"
        description="Dodaj dokumenty sprawy: odwołanie, pełnomocnictwa i potwierdzenia przelewów (PDF lub archiwum ZIP z PDF-ami)."
        [breadcrumbs]="[{ label: 'Sprawy', link: '/sprawy' }, { label: 'Nowa sprawa' }]"
      />

      <app-notice>
        Rodzaj dokumentu silnik rozpoznaje po treści, nazwa pliku nie ma znaczenia. Dokument spoza obsługiwanych rodzajów
        dostaje wynik <span class="mono">{{ '{}' }}</span>, tak jak w CLI. Przetwarzanie działa na tym komputerze (Docling na
        CPU); do modelu językowego trafia tylko tekst dokumentu.
      </app-notice>

      <section class="card stack" aria-labelledby="upload-heading">
        <h2 id="upload-heading">Pliki</h2>

        <mat-form-field class="name">
          <mat-label>Nazwa sprawy (opcjonalnie)</mat-label>
          <input matInput [value]="name()" (input)="name.set($any($event.target).value)" maxlength="200" autocomplete="off" />
          <mat-hint>Np. sygnatura albo nazwa postępowania. Bez nazwy sprawa dostanie datę i godzinę.</mat-hint>
        </mat-form-field>

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
            <input
              #picker
              type="file"
              multiple
              accept=".pdf,.zip,application/pdf,application/zip"
              [disabled]="sending()"
              (change)="onPick(picker)"
            />
            <span>Wybierz pliki</span>
          </label>
          <p class="muted hint">PDF do 50 MB na plik albo ZIP z PDF-ami.</p>
        </div>

        @if (files().length) {
          <ul class="file-list" aria-label="Wybrane pliki">
            @for (item of files(); track item.id) {
              <li class="file-row">
                <mat-icon svgIcon="picture_as_pdf" aria-hidden="true" />
                <span class="file-name">{{ item.file.name }}</span>
                <span class="muted">{{ size(item.file.size) }}</span>
                <span class="spacer"></span>
                @if (item.error) {
                  <span class="error">{{ item.error }}</span>
                }
                @if (!sending()) {
                  <button mat-icon-button type="button" (click)="remove(item.id)" [attr.aria-label]="'Usuń ' + item.file.name">
                    <mat-icon svgIcon="close" aria-hidden="true" />
                  </button>
                }
              </li>
            }
          </ul>
        }

        @if (sending()) {
          <mat-progress-bar
            [mode]="progress() < 100 ? 'determinate' : 'indeterminate'"
            [value]="progress()"
            aria-label="Wysyłanie plików"
          />
        }

        @if (error()) {
          <app-notice tone="warning">
            <p>{{ error() }}</p>
            @if (rejected().length) {
              <ul class="rejected">
                @for (line of rejected(); track line) {
                  <li>{{ line }}</li>
                }
              </ul>
            }
          </app-notice>
        }

        <div class="row">
          <button mat-flat-button type="button" [disabled]="!canStart()" (click)="start()">
            <mat-icon svgIcon="upload_file" aria-hidden="true" />Wyślij i przetwórz
          </button>
          @if (files().length && !sending()) {
            <button mat-button type="button" (click)="clear()">Wyczyść listę</button>
          }
          <span class="muted" aria-live="polite">{{ summary() }}</span>
        </div>
      </section>
    </div>
  `,
  styles: `
    .name {
      max-width: 560px;
    }
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
      gap: 4px;
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
    .error {
      color: var(--app-error);
      font-size: 0.875rem;
    }
    .rejected {
      margin: 4px 0 0;
      padding-left: 20px;
    }
  `,
})
export class CaseNewPage {
  private readonly store = inject(CasesStore);
  private readonly router = inject(Router);

  protected readonly name = signal('');
  protected readonly files = signal<QueuedFile[]>([]);
  protected readonly dragging = signal(false);
  protected readonly sending = signal(false);
  protected readonly progress = signal(0);
  protected readonly error = signal<string | null>(null);
  protected readonly rejected = signal<string[]>([]);
  protected readonly size = formatSize;

  private nextId = 1;
  private upload: Subscription | null = null;

  protected readonly valid = computed(() => this.files().filter((f) => !f.error));
  protected readonly canStart = computed(() => !this.sending() && this.valid().length > 0);
  protected readonly summary = computed(() => {
    const n = this.valid().length;
    if (this.sending()) return this.progress() < 100 ? `Wysyłanie: ${this.progress()}%` : 'Zapisywanie plików…';
    return n ? `Gotowe do wysłania: ${n}` : '';
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.upload?.unsubscribe());
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    if (!this.sending()) this.add(Array.from(event.dataTransfer?.files ?? []));
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
    this.error.set(null);
    this.rejected.set([]);
  }

  protected start(): void {
    this.sending.set(true);
    this.progress.set(0);
    this.error.set(null);
    this.rejected.set([]);
    this.upload = this.store.upload(this.name(), this.valid().map((f) => f.file)).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.progress.set(Math.round((event.loaded / event.total) * 100));
        } else if (event.type === HttpEventType.Response && event.body) {
          const { case: created, rejected } = event.body;
          void this.router.navigate(['/sprawy', created.id], { state: { rejected } });
        }
      },
      error: (e: unknown) => {
        this.sending.set(false);
        this.error.set(apiErrorMessage(e, 'Nie udało się wysłać plików.'));
        this.rejected.set(rejectedFiles(e));
      },
    });
  }

  private add(picked: File[]): void {
    const queued = picked.map((file) => ({
      id: this.nextId++,
      file,
      error: !ACCEPTED.test(file.name)
        ? 'Nieobsługiwany format (tylko PDF lub ZIP)'
        : file.size > (/\.zip$/i.test(file.name) ? MAX_ZIP_BYTES : MAX_PDF_BYTES)
          ? 'Plik jest za duży'
          : null,
    }));
    this.files.update((files) => [...files, ...queued]);
  }
}
