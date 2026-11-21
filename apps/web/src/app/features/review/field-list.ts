import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { METHOD_LABELS, formatConfidence, formatFieldValue } from '../../core/format';
import { FieldResult } from '../../core/models/case.model';
import { FieldDefinition } from '../../core/models/config.model';

interface FieldGroup {
  id: string;
  section: string;
  fields: FieldResult[];
}

const HINTS: Partial<Record<FieldResult['type'], string>> = {
  data: 'Format RRRR-MM-DD; puste pole oznacza brak wartości.',
  kwota: 'Liczba, np. 10000,00.',
  flaga: '1 = tak, 0 = nie.',
  enum: 'Wartość ze słownika.',
};

@Component({
  selector: 'app-field-list',
  imports: [MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './field-list.html',
  styleUrl: './field-list.scss',
})
export class FieldList {
  readonly fields = input.required<FieldResult[]>();
  readonly definitions = input.required<FieldDefinition[]>();
  readonly selectedKey = input<string | null>(null);
  /** Wynik szukania źródła w PDF dla zaznaczonego pola. */
  readonly sourceFound = input<boolean | null>(null);
  readonly locked = input(false);

  readonly selectField = output<string>();
  readonly saveField = output<{ key: string; raw: string }>();

  protected readonly editingKey = signal<string | null>(null);
  protected readonly draft = signal('');
  private readonly editInput = viewChild<ElementRef<HTMLInputElement>>('editInput');

  protected readonly groups = computed<FieldGroup[]>(() => {
    const groups = new Map<string, FieldGroup>();
    for (const field of this.fields()) {
      let group = groups.get(field.section);
      if (!group) {
        group = { id: `sekcja-${groups.size + 1}`, section: field.section, fields: [] };
        groups.set(field.section, group);
      }
      group.fields.push(field);
    }
    return [...groups.values()];
  });

  private readonly definitionsByPath = computed(() => new Map(this.definitions().map((d) => [d.path, d])));

  constructor() {
    effect(() => this.editInput()?.nativeElement.focus());
  }

  protected display(field: FieldResult): string {
    return formatFieldValue(field, this.definitionsByPath().get(field.path));
  }

  protected method(field: FieldResult): string {
    return METHOD_LABELS[field.method];
  }

  protected confidence(field: FieldResult): string {
    return formatConfidence(field.confidence);
  }

  protected isIdentifier(field: FieldResult): boolean {
    return (this.definitionsByPath().get(field.path)?.normalizers.length ?? 0) > 0;
  }

  protected instruction(field: FieldResult): string {
    return this.definitionsByPath().get(field.path)?.instruction ?? '';
  }

  protected hint(field: FieldResult): string {
    return HINTS[field.type] ?? 'Puste pole oznacza brak wartości (null).';
  }

  protected startEdit(field: FieldResult): void {
    this.draft.set(field.value === null ? '' : String(field.value));
    this.editingKey.set(field.key);
  }

  protected save(event: Event, field: FieldResult): void {
    event.preventDefault();
    this.saveField.emit({ key: field.key, raw: this.draft() });
    this.editingKey.set(null);
  }

  protected cancel(): void {
    this.editingKey.set(null);
  }

  protected onDraft(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
  }
}
