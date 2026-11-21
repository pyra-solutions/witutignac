import { findDictionary } from '../config/mock-config';
import { ExtractionStrategy, FieldDefinition, DocumentTypeDefinition } from '../models/config.model';
import { FieldResult } from '../models/case.model';
import { AllowedValues, validate } from './validators';

type Json = unknown;

const MOCK_CONFIDENCE: Record<ExtractionStrategy, number> = {
  regex: 0.97,
  llm: 0.9,
  slownik: 1,
  regula: 0.95,
};

const MONTHS_GENITIVE = [
  'stycznia',
  'lutego',
  'marca',
  'kwietnia',
  'maja',
  'czerwca',
  'lipca',
  'sierpnia',
  'września',
  'października',
  'listopada',
  'grudnia',
];

interface Instance {
  key: string;
  section: string;
  label: string;
  value: string | number | null;
}

function asRecord(node: Json): Record<string, Json> | null {
  return node !== null && typeof node === 'object' && !Array.isArray(node) ? (node as Record<string, Json>) : null;
}

function toScalar(value: Json): string | number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' || typeof value === 'string') return value;
  if (typeof value === 'boolean') return value ? 1 : 0;
  return JSON.stringify(value);
}

/** Rozwija ścieżkę definicji (z `[]` dla list) na konkretne wystąpienia w wyniku. */
function expand(root: Json, field: FieldDefinition, sectionLabels: Record<string, string>): Instance[] {
  const segments = field.path.split('.');
  const out: Instance[] = [];

  const walk = (node: Json, index: number, keyParts: string[], section: string, labelSuffix: string) => {
    const segment = segments[index];
    const isList = segment.endsWith('[]');
    const name = isList ? segment.slice(0, -2) : segment;
    const isLast = index === segments.length - 1;
    const child = asRecord(node)?.[name];

    if (isList) {
      if (!Array.isArray(child)) return;
      child.forEach((item, i) => {
        const nestedName = sectionLabels[name] ?? name;
        const nextSection = index === 0 ? `${nestedName} ${i + 1}` : section;
        const nextSuffix = index === 0 || child.length === 1 ? labelSuffix : `${labelSuffix} ${i + 1}`;
        const key = [...keyParts, `${name}[${i}]`];
        if (isLast) {
          out.push({ key: key.join('.'), section: nextSection, label: field.label + nextSuffix, value: toScalar(item) });
        } else {
          walk(item, index + 1, key, nextSection, nextSuffix);
        }
      });
      return;
    }

    const nextSection = index === 0 ? (sectionLabels[name] ?? name) : section;
    const key = [...keyParts, name];
    if (isLast) {
      out.push({ key: key.join('.'), section: nextSection, label: field.label + labelSuffix, value: toScalar(child) });
    } else {
      walk(child ?? null, index + 1, key, nextSection, labelSuffix);
    }
  };

  walk(root, 0, [], '', '');
  return out;
}

export function allowedValuesFor(field: FieldDefinition): AllowedValues {
  if (!field.dictionary) return [];
  const dictionary = findDictionary(field.dictionary);
  if (!dictionary) return [];
  return dictionary.valueKind === 'id' ? dictionary.entries.map((e) => e.id) : dictionary.entries.map((e) => e.label);
}

export function warningsFor(field: FieldDefinition, value: string | number | null): string[] {
  if (value === null || value === '') {
    return field.nullable ? [] : ['Brak wartości w polu wymaganym'];
  }
  const allowed = allowedValuesFor(field);
  return field.validators
    .map((v) => validate(v, value, allowed))
    .filter((w): w is string => w !== null);
}

/** Teksty, których szukamy w PDF, żeby podświetlić źródło wartości. */
export function candidatesFor(field: FieldDefinition, value: string | number | null): string[] {
  if (value === null || value === '') return [];
  if (field.type === 'flaga' || field.type === 'enum' || field.strategies[0] === 'slownik') return [];

  const text = String(value);
  if (field.type === 'data') {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    if (!match) return [text];
    const [, y, m, d] = match;
    return [`${Number(d)} ${MONTHS_GENITIVE[Number(m) - 1]} ${y}`, `${d}.${m}.${y}`, text];
  }
  if (field.type === 'kwota' && typeof value === 'number') {
    const formatted = new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
    return [formatted, value.toFixed(2).replace('.', ','), text];
  }
  if (field.normalizers.includes('ted_number')) {
    const match = /^(\d+)-(\d{4})$/.exec(text);
    return match ? [text, match[1]] : [text];
  }
  return [text];
}

export function flattenResult(definition: DocumentTypeDefinition, result: Json): FieldResult[] {
  return definition.fields.flatMap((field) =>
    expand(result, field, definition.sectionLabels).map((instance) => {
      const method = field.strategies[0];
      return {
        key: instance.key,
        path: field.path,
        section: instance.section,
        label: instance.label,
        type: field.type,
        value: instance.value,
        originalValue: instance.value,
        method,
        confidence: instance.value === null ? null : MOCK_CONFIDENCE[method],
        candidates: candidatesFor(field, instance.value),
        warnings: warningsFor(field, instance.value),
        corrected: false,
      } satisfies FieldResult;
    }),
  );
}

/** Zamienia tekst wpisany przez człowieka na typ wartości z definicji pola. */
export function parseInput(field: FieldDefinition, raw: string): string | number | null {
  const text = raw.trim();
  if (text === '') return null;
  switch (field.type) {
    case 'kwota':
    case 'liczba': {
      const number = Number(text.replace(/\s/g, '').replace(',', '.'));
      return Number.isFinite(number) ? number : text;
    }
    case 'flaga':
      return ['1', 'tak', 'true'].includes(text.toLowerCase()) ? 1 : 0;
    case 'enum': {
      const number = Number(text);
      return Number.isInteger(number) ? number : text;
    }
    default:
      return text;
  }
}

/** Ustawia wartość pod kluczem z indeksami list, np. `Odwolujacy[0].nip`, w kopii obiektu. */
export function setValueAtKey(result: Json, key: string, value: string | number | null): Json {
  const copy = structuredClone(result) as Record<string, Json>;
  const tokens = key.split('.').map((part) => {
    const match = /^(.+)\[(\d+)\]$/.exec(part);
    return match ? { name: match[1], index: Number(match[2]) } : { name: part, index: null };
  });

  let node: Record<string, Json> = copy;
  tokens.forEach((token, i) => {
    const isLast = i === tokens.length - 1;
    if (token.index === null) {
      if (isLast) {
        node[token.name] = value;
        return;
      }
      const next = asRecord(node[token.name]) ?? {};
      node[token.name] = next;
      node = next;
      return;
    }
    const list = Array.isArray(node[token.name]) ? (node[token.name] as Json[]) : [];
    node[token.name] = list;
    if (isLast) {
      list[token.index] = value;
      return;
    }
    const next = asRecord(list[token.index]) ?? {};
    list[token.index] = next;
    node = next;
  });
  return copy;
}
