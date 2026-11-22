import { DocumentStatus, FieldResult, FieldSource } from './models/case.model';
import { Dictionary, FieldDefinition, FieldStrategy } from './models/config.model';

const AMOUNT = new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const DATE_TIME = new Intl.DateTimeFormat('pl-PL', { dateStyle: 'short', timeStyle: 'short' });

export const SOURCE_LABELS: Record<FieldSource, string> = {
  rules: 'Reguła',
  llm: 'LLM',
  derived: 'Wyliczone',
  default: 'Wartość domyślna',
  manual: 'Poprawione ręcznie',
};

export const STRATEGY_LABELS: Record<FieldStrategy, string> = {
  rules_first: 'Reguła → LLM',
  llm_first: 'LLM → reguła',
  rules_only: 'Tylko reguła',
  llm_only: 'Tylko LLM',
  derived: 'Wyliczane z innych pól',
};

export const STATUS_LABELS: Record<DocumentStatus, string> = {
  'w-kolejce': 'W kolejce',
  przetwarzanie: 'Przetwarzanie',
  gotowy: 'Gotowy',
  'do-weryfikacji': 'Do weryfikacji',
  zatwierdzony: 'Zatwierdzony',
  nieobslugiwany: 'Nieobsługiwany typ',
  blad: 'Błąd',
};

export const FIELD_TYPE_LABELS: Record<FieldResult['type'], string> = {
  tekst: 'tekst',
  data: 'data',
  liczba: 'liczba',
  kwota: 'kwota',
  flaga: 'flaga 0/1',
  enum: 'lista wartości',
};

export function formatFieldValue(field: FieldResult, definition?: FieldDefinition, dictionary?: Dictionary): string {
  const value = field.value;
  if (value === null || value === '') return '';

  switch (field.type) {
    case 'data': {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
      return match ? `${match[3]}.${match[2]}.${match[1]}` : String(value);
    }
    case 'kwota':
      return typeof value === 'number' ? `${AMOUNT.format(value)} zł` : String(value);
    case 'flaga':
      return Number(value) === 1 ? 'tak' : 'nie';
    case 'enum': {
      const entry = definition?.dictionary ? dictionary?.entries.find((e) => String(e.id) === String(value)) : undefined;
      return entry ? `${value} · ${entry.label}` : String(value);
    }
    default:
      return String(value);
  }
}

export function formatSize(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : DATE_TIME.format(date);
}

export function formatNumber(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('pl-PL', { maximumFractionDigits: digits }).format(value);
}
