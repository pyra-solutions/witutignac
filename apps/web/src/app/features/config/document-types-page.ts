import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '../../core/api/errors';
import { ConfigStore } from '../../core/config/config.store';
import { formatNumber } from '../../core/format';
import { Notice } from '../../shared/ui/notice';
import { PageHeader } from '../../shared/ui/page-header';

// Limit jak w backendzie (MAX_TYPE_SOURCE_CHARS w backend/o2j_backend/releases.py).
const MAX_SOURCE_CHARS = 256_000;

interface SavedTypeDto {
  code: string;
  name: string;
  file: string;
  created: boolean;
}

interface DraftTypeDto {
  code: string;
  name: string;
}

@Component({
  selector: 'app-document-types-page',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    PageHeader,
    Notice,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header
        heading="Typy dokumentów"
        description="Każdy typ to plik YAML: reguły klasyfikacji, sekcje, pola, grupy ekstrakcji LLM i profil konwersji. Nowy typ nie wymaga zmian w kodzie."
      />
      <app-notice>
        Tabela pokazuje typy z wydania <span class="mono">{{ config.version() }}</span>, którego używa silnik
        (<span class="mono">{{ config.source() }}</span>). Nowy typ dodasz poniżej albo jako plik w
        <span class="mono">config/seed/document_types/</span>. Silnik zacznie go używać po publikacji wydania na ekranie
        <a routerLink="/konfiguracja/wydania">Wydania</a> (opis formatu: docs/silnik.md).
      </app-notice>
      @if (config.loading()) {
        <mat-progress-bar mode="indeterminate" aria-label="Wczytywanie konfiguracji" />
      } @else if (config.error()) {
        <app-notice tone="warning">{{ config.error() }}</app-notice>
      }
      @if (pending().length) {
        <app-notice>
          Konfiguracja robocza ma typy, których nie ma jeszcze w aktywnym wydaniu:
          @for (t of pending(); track t.code; let last = $last) {
            <strong>{{ t.name }}</strong> (<span class="mono">{{ t.code }}</span>){{ last ? '.' : ',' }}
          }
          <a routerLink="/konfiguracja/wydania">Opublikuj wydanie</a>, żeby silnik zaczął ich używać.
        </app-notice>
      }
      <section class="card card--flush" aria-label="Lista typów dokumentów">
        <div class="table-wrap">
          <table class="app-table">
            <thead>
              <tr>
                <th scope="col">Nazwa</th>
                <th scope="col">Kod</th>
                <th scope="col" class="num">Pola</th>
                <th scope="col" class="num">Grupy LLM</th>
                <th scope="col" class="num">Wzorce klasyfikacji</th>
                <th scope="col" class="num">Próg</th>
                <th scope="col">Profil konwersji</th>
              </tr>
            </thead>
            <tbody>
              @for (type of config.documentTypes(); track type.code) {
                <tr>
                  <td><a [routerLink]="['/konfiguracja/typy-dokumentow', type.code]">{{ type.name }}</a></td>
                  <td class="mono">{{ type.code }}</td>
                  <td class="num">{{ type.fields.length }}</td>
                  <td class="num">{{ type.groups.length }}</td>
                  <td class="num">{{ type.classifier.length }}</td>
                  <td class="num">{{ num(type.minScore) }}</td>
                  <td class="mono">{{ type.conversionProfile }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section class="card stack" aria-labelledby="add-type-heading">
        <h2 id="add-type-heading">Dodaj albo zastąp typ dokumentu</h2>
        <p class="muted">
          Wgraj plik YAML albo wklej jego treść. Przed zapisem serwer sprawdza go tak jak
          <span class="mono">validate-config</span>, razem z resztą konfiguracji: model, nazwy normalizatorów i
          walidatorów, regexy, sekcje, słowniki, grupy. Plik trafia do <span class="mono">config/seed/document_types/</span>
          (konfiguracja robocza). Aktywne wydanie się nie zmienia.
        </p>
        <div class="row">
          <input
            #fileInput
            type="file"
            class="visually-hidden"
            tabindex="-1"
            accept=".yaml,.yml,application/x-yaml,text/yaml"
            (change)="onFile($event)"
          />
          <button mat-stroked-button type="button" [disabled]="saving()" (click)="fileInput.click()">
            <mat-icon svgIcon="upload_file" aria-hidden="true" />Wybierz plik YAML
          </button>
          @if (fileName()) {
            <span class="mono">{{ fileName() }}</span>
          }
        </div>
        <mat-form-field class="source">
          <mat-label>Treść YAML</mat-label>
          <textarea
            matInput
            class="mono"
            rows="16"
            spellcheck="false"
            autocomplete="off"
            [value]="source()"
            (input)="source.set($any($event.target).value)"
          ></textarea>
          <mat-hint>Format jak w config/seed/document_types/*.yaml; przykład: config/examples/document_types/przystapienie.yaml</mat-hint>
        </mat-form-field>
        <mat-checkbox [checked]="replace()" (change)="replace.set($event.checked)">
          Zastąp istniejący typ o tym samym kodzie
        </mat-checkbox>
        <div class="row">
          <button mat-flat-button type="button" [disabled]="!canSave()" (click)="save()">
            <mat-icon svgIcon="save" aria-hidden="true" />Zapisz w konfiguracji roboczej
          </button>
        </div>
        @if (saving()) {
          <mat-progress-bar mode="indeterminate" aria-label="Zapisywanie typu dokumentu" />
        }
        @if (saveError()) {
          <app-notice tone="warning"><p class="pre">{{ saveError() }}</p></app-notice>
        }
        @if (saved(); as s) {
          <app-notice>
            <p>
              {{ s.created ? 'Dodano' : 'Zastąpiono' }} typ <strong>{{ s.name }}</strong> (<span class="mono">{{ s.code }}</span>)
              w pliku <span class="mono">config/seed/document_types/{{ s.file }}</span>. Silnik zacznie go używać po
              <a routerLink="/konfiguracja/wydania">publikacji wydania</a>.
            </p>
          </app-notice>
        }
      </section>
    </div>
  `,
  styles: `
    .source {
      width: 100%;
    }
    textarea {
      font-size: 0.8125rem;
      line-height: 1.45;
    }
    .pre {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
  `,
})
export class DocumentTypesPage {
  protected readonly config = inject(ConfigStore);
  private readonly http = inject(HttpClient);
  protected readonly num = (value: number) => formatNumber(value);

  protected readonly source = signal('');
  protected readonly fileName = signal<string | null>(null);
  protected readonly replace = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveError = signal<string | null>(null);
  protected readonly saved = signal<SavedTypeDto | null>(null);
  private readonly draftTypes = signal<DraftTypeDto[]>([]);

  protected readonly canSave = computed(() => !this.saving() && this.source().trim().length > 0);
  /** Typy z config/seed, których nie ma w aktywnym wydaniu (czekają na publikację). */
  protected readonly pending = computed(() => {
    const active = new Set(this.config.documentTypes().map((t) => t.code));
    return this.draftTypes().filter((t) => !active.has(t.code));
  });

  constructor() {
    void this.loadDraft();
  }

  protected async onFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.saved.set(null);
    if (file.size > MAX_SOURCE_CHARS) {
      this.saveError.set(`Plik ${file.name} jest za duży (limit ${formatNumber(MAX_SOURCE_CHARS / 1000)} kB).`);
      return;
    }
    this.saveError.set(null);
    this.source.set(await file.text());
    this.fileName.set(file.name);
  }

  protected async save(): Promise<void> {
    this.saving.set(true);
    this.saveError.set(null);
    this.saved.set(null);
    try {
      const r = await firstValueFrom(
        this.http.post<SavedTypeDto>('/api/document-types', { source: this.source(), replace: this.replace() }),
      );
      this.saved.set(r);
      await this.loadDraft();
    } catch (e) {
      this.saveError.set(apiErrorMessage(e, 'Nie udało się zapisać typu dokumentu.'));
    } finally {
      this.saving.set(false);
    }
  }

  private async loadDraft(): Promise<void> {
    try {
      const draft = await firstValueFrom(this.http.get<{ document_types: DraftTypeDto[] }>('/api/config/draft'));
      this.draftTypes.set(draft.document_types.map((t) => ({ code: t.code, name: t.name })));
    } catch {
      this.draftTypes.set([]); // konfiguracja robocza z błędem: komunikat pokaże zapis albo publikacja
    }
  }
}
