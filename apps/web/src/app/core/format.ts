import { findDictionary } from './config/mock-config';
import { DocumentStatus, FieldResult } from './models/case.model';
import { ExtractionStrategy, FieldDefinition } from './models/config.model';

const AMOUNT = new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const METHOD_LABELS: Record<ExtractionStrategy, string> = {
  llm: 'LLM',
  regex: 'Regex',
  slownik: 'Słownik',
  regula: 'Reguła',
};

export const STATUS_LABELS: Record<DocumentStatus, string> = {
  gotowy: 'Gotowy',
  'do-weryfikacji': 'Do weryfikacji',
  zatwierdzony: 'Zatwierdzony',
};

export function formatFieldValue(field: FieldResult, definition?: FieldDefinition): string {
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
      const dictionary = definition?.dictionary ? findDictionary(definition.dictionary) : undefined;
      const entry =
        dictionary?.valueKind === 'id' ? dictionary.entries.find((e) => String(e.id) === String(value)) : undefined;
      return entry ? `${value} · ${entry.label}` : String(value);
    }
    default:
      return String(value);
  }
}

export function formatConfidence(confidence: number | null): string {
  return confidence === null ? '—' : `${Math.round(confidence * 100)}%`;
}

export function formatPrice(usd: number): string {
  return new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(usd);
}
