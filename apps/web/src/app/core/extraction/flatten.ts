import { TraceDto } from '../api/api.models';
import { DocumentTypeDefinition, FieldDefinition } from '../models/config.model';
import { FieldResult, FieldSource } from '../models/case.model';

type Json = unknown;

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

/** Normalizatory identyfikatorów: takie wartości pokazujemy czcionką o stałej szerokości. */
const IDENTIFIER_NORMALIZERS = ['digits_only', 'iban_digits', 'ted_number', 'bzp_number'];

interface Instance {
  key: string;
  section: string;
  label: string;
  value: string | number | null;
}

export interface FlattenContext {
  /** Ślad ekstrakcji silnika: źródło, cytat i strona każdej wartości. */
  trace?: TraceDto | null;
  /** Wynik silnika przed poprawkami człowieka. */
  original?: Json;
  /** Ostrzeżenia walidatorów silnika po kluczu z indeksami. */
  validation?: Record<string, string[]>;
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

export function isIdentifier(field: FieldDefinition): boolean {
  return field.normalizers.some((n) => IDENTIFIER_NORMALIZERS.includes(n));
}

/** Teksty, których szukamy w PDF, żeby podświetlić źródło wartości. */
export function candidatesFor(field: FieldDefinition, value: string | number | null, extra: Json[] = []): string[] {
  if (value === null || value === '') return [];
  if (field.type === 'flaga' || field.type === 'enum' || field.strategy === 'derived') return [];

  const out: string[] = [];
  const text = String(value);
  const date = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (field.type === 'data' && date) {
    const [, y, m, d] = date;
    out.push(`${Number(d)} ${MONTHS_GENITIVE[Number(m) - 1]} ${y}`, `${d}.${m}.${y}`, text);
  } else if (field.type === 'kwota' && typeof value === 'number') {
    const formatted = new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
    out.push(formatted, value.toFixed(2).replace('.', ','), text);
  } else if (field.normalizers.includes('ted_number')) {
    const match = /^(\d+)-(\d{4})$/.exec(text);
    out.push(...(match ? [text, match[1]] : [text]));
  } else {
    out.push(text);
  }
  // Surowy tekst sprzed normalizacji (np. „200,00 PLN”, numer rachunku ze spacjami).
  for (const raw of extra) {
    if (typeof raw === 'string' && raw.trim()) out.push(raw.trim());
  }
  return [...new Set(out)];
}

function sourceOf(value: unknown): FieldSource | null {
  return value === 'rules' || value === 'llm' || value === 'derived' || value === 'default' ? value : null;
}

function comparable(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
}

function display(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;
  return typeof value === 'string' ? value : JSON.stringify(value);
}

export function flattenResult(definition: DocumentTypeDefinition, result: Json, ctx: FlattenContext = {}): FieldResult[] {
  const traceFields = ctx.trace?.fields ?? {};
  return definition.fields.flatMap((field) => {
    const originals = new Map(
      expand(ctx.original ?? result, field, definition.sectionLabels).map((i) => [i.key, i.value] as const),
    );
    return expand(result, field, definition.sectionLabels).map((instance) => {
      const entry = traceFields[instance.key] ?? {};
      const originalValue = originals.has(instance.key) ? (originals.get(instance.key) ?? null) : null;
      const corrected = ctx.original !== undefined && instance.value !== originalValue;
      const ownValidators = field.validators.map((v) => v.split(' ')[0]);
      const notes = (entry.warnings ?? []).filter((w) => !ownValidators.some((v) => w.startsWith(`${v}:`)));
      if (entry.dropped) notes.push(`Wartość pominięta: ${entry.dropped}.`);
      // Odczyty reguły i LLM pokazujemy, gdy się różnią (pomijając spacje, interpunkcję i wielkość liter).
      const ruleValue = display(entry.rule_value);
      const llmValue = display(entry.llm_value);
      const differ = ruleValue !== null && llmValue !== null && comparable(ruleValue) !== comparable(llmValue);
      const alternatives = differ ? [`reguła: ${ruleValue}`, `LLM: ${llmValue}`] : [];
      return {
        key: instance.key,
        path: field.path,
        section: instance.section,
        label: instance.label,
        type: field.type,
        value: instance.value,
        originalValue,
        source: corrected ? 'manual' : sourceOf(entry.source),
        page: corrected ? null : (entry.page ?? null),
        quote: corrected ? null : (entry.quote ?? null),
        notes: alternatives.length > 1 ? [`Odczyty źródeł: ${alternatives.join('; ')}.`, ...notes] : notes,
        candidates: candidatesFor(field, instance.value, corrected ? [] : [entry.raw, entry.rule_value]),
        warnings: ctx.validation?.[instance.key] ?? [],
        corrected,
      } satisfies FieldResult;
    });
  });
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
      const numeric = field.allowed?.some((a) => typeof a === 'number') ?? field.engineType === 'integer';
      const number = Number(text);
      return numeric && Number.isInteger(number) ? number : text;
    }
    case 'data': {
      const pl = /^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})$/.exec(text);
      return pl ? `${pl[3]}-${pl[2].padStart(2, '0')}-${pl[1].padStart(2, '0')}` : text;
    }
    default:
      return text;
  }
}

/** Ustawia wartość pod kluczem z indeksami list, np. `Odwolujacy[0].nip`, w kopii obiektu. */
export function setValueAtKey(result: Json, key: string, value: string | number | null): Json {
  const copy = (asRecord(result) ? structuredClone(result) : {}) as Record<string, Json>;
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
