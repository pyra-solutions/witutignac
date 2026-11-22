import {
  DictionaryDto,
  DocumentTypeDto,
  FieldDefDto,
  LlmProfileDto,
  ModelDto,
  ProviderDto,
  ReleaseSnapshotDto,
} from '../api/api.models';
import {
  ConversionProfile,
  ConversionSetting,
  Dictionary,
  DocumentTypeDefinition,
  FieldDefinition,
  FieldType,
  LlmModelInfo,
  LlmProfile,
  LlmProvider,
} from '../models/config.model';
import { fieldLabel, groupLabel, sectionLabel } from './labels';

/** Tłumaczy wydanie konfiguracji silnika (release.json) na model ekranów. */

function isFlag(values: unknown[]): boolean {
  return values.length === 2 && values.includes(0) && values.includes(1);
}

function fieldType(f: FieldDefDto): FieldType {
  const d = f.derive;
  if (d?.kind === 'present' || d?.kind === 'count_at_least') return isFlag([d.if_true, d.if_false]) ? 'flaga' : 'enum';
  if (d?.kind === 'map_regex') return 'enum';
  if (f.enum) return isFlag(f.enum) ? 'flaga' : 'enum';
  if (f.dictionary && !d) return 'enum';
  switch (f.type) {
    case 'date':
      return 'data';
    case 'number':
      return /kwota|amount/i.test(f.path) ? 'kwota' : 'liczba';
    case 'integer':
      return 'liczba';
    default:
      return 'tekst';
  }
}

function allowedValues(f: FieldDefDto): (string | number)[] | undefined {
  const d = f.derive;
  const scalar = (v: unknown): v is string | number => typeof v === 'string' || typeof v === 'number';
  if (f.enum) return f.enum;
  if (d?.kind === 'present' || d?.kind === 'count_at_least') return [d.if_true, d.if_false].filter(scalar);
  if (d?.kind === 'map_regex') return [...new Set(d.cases.map((c) => c.value).filter(scalar))];
  return undefined;
}

export function mapField(f: FieldDefDto): FieldDefinition {
  const dictionary = f.dictionary ?? f.derive?.dictionary ?? f.rules.find((r) => r.dictionary)?.dictionary ?? undefined;
  return {
    path: f.path,
    label: fieldLabel(f.path),
    type: fieldType(f),
    engineType: f.type,
    group: f.group,
    strategy: f.derive ? 'derived' : f.strategy,
    ruleCount: f.rules.length,
    derive: f.derive?.kind ?? null,
    normalizers: f.normalizers.map((n) => n.name),
    validators: f.validators.map((v) => (v.severity === 'error' ? `${v.name} (odrzuca)` : v.name)),
    dictionary: dictionary ?? undefined,
    allowed: allowedValues(f),
    grounding: f.grounding,
    instruction: f.instruction,
  };
}

export function mapDocumentType(dt: DocumentTypeDto, defaultLlm: string): DocumentTypeDefinition {
  const sectionLabels: Record<string, string> = {};
  for (const f of dt.fields) {
    for (const segment of f.path.split('.')) {
      const name = segment.replace(/\[\]$/, '');
      sectionLabels[name] ??= sectionLabel(name);
    }
  }
  return {
    code: dt.code,
    name: dt.name,
    description: dt.classification.description,
    conversionProfile: dt.conversion_profile,
    minScore: dt.classification.min_score,
    classifier: dt.classification.patterns.map((p) => ({ pattern: p.pattern, weight: p.weight, firstChars: p.first_chars })),
    sections: dt.sections.map((s) => ({ name: s.name, start: s.start, end: s.end, within: s.within, maxChars: s.max_chars })),
    sectionLabels,
    groups: dt.groups.map((g) => ({
      code: g.name,
      label: groupLabel(g.name),
      instruction: g.instruction,
      sections: g.sections,
      maxChars: g.max_chars,
      llmProfile: g.llm_profile ?? defaultLlm,
    })),
    fields: dt.fields.map(mapField),
  };
}

export function mapDictionary(d: DictionaryDto): Dictionary {
  return {
    code: d.code,
    name: d.name || d.code,
    entries: d.entries.map((e) => ({
      id: e.id,
      label: String(e['opis'] ?? e['label'] ?? e['nazwa'] ?? e.id),
      keywords: e.keywords ?? [],
    })),
  };
}

export function mapLlmProfile(p: LlmProfileDto, defaultLlm: string): LlmProfile {
  return {
    code: p.id,
    model: p.model,
    baseUrl: p.base_url,
    apiKeyEnv: p.api_key_env,
    temperature: p.temperature,
    maxTokens: p.max_tokens,
    timeoutS: p.timeout_s,
    structuredOutput: p.structured_output,
    isDefault: p.id === defaultLlm,
  };
}

export function mapProvider(p: ProviderDto): LlmProvider {
  return { code: p.code, name: p.name, baseUrl: p.base_url, dataLocation: p.data_location, note: p.note };
}

export function mapModel(m: ModelDto): LlmModelInfo {
  return {
    model: m.model,
    name: m.name,
    vendor: m.vendor,
    paramsBillions: m.params_billions,
    license: m.license,
    note: m.note,
  };
}

// --- ustawienia konwersji i silnika ----------------------------------------------------------

interface SettingMeta {
  name: string;
  reason: string;
}

const CONVERSION_META: Record<string, SettingMeta> = {
  ocr_engine: {
    name: 'Silnik OCR',
    reason: 'RapidOCR dał najwyższe F1 na skanach; Tesseract i EasyOCR wypadły gorzej (docs/raport-jakosci.md).',
  },
  ocr_lang: { name: 'Język OCR', reason: 'Model rozpoznający polskie znaki.' },
  ocr_model_size: { name: 'Rozmiar modelu PP-OCRv6', reason: 'Model „medium” był około 15 razy wolniejszy bez zysku F1.' },
  ocr_scale: { name: 'Skala obrazu dla OCR', reason: '3,0 = 216 dpi. Skala 4 dała tylko +0,003 F1 przy 1,2 razy dłuższym czasie.' },
  ocr_mode: { name: 'Tryb OCR dla PDF z tekstem', reason: 'OCR tylko obszarów bez warstwy tekstowej: cyfrowe PDF-y nie tracą czasu.' },
  scanned_ocr_mode: { name: 'Tryb OCR dla skanów', reason: 'PDF bez warstwy tekstowej idzie w całości przez OCR.' },
  replace_broken_text_layer: { name: 'Zastępowanie zepsutej warstwy tekstu', reason: 'Nieczytelny tekst PDF trafia do OCR.' },
  table_structure: { name: 'Rozpoznawanie tabel', reason: 'Potwierdzenia przelewów mają układ tabelaryczny.' },
  max_pages: { name: 'Liczba czytanych stron', reason: 'Kluczowe dane są na pierwszych stronach; krótszy czas na skanach.' },
  num_threads: { name: 'Wątki CPU', reason: 'Przewidywalne zużycie procesora na komputerze bez GPU.' },
  document_timeout_s: { name: 'Limit czasu na dokument (s)', reason: 'Uszkodzony plik nie blokuje przetwarzania pozostałych.' },
  scanned_label_columns: {
    name: 'Kolejność nagłówka w dwóch kolumnach (skany)',
    reason: 'Docling wypisuje najpierw etykiety „Odwołujący:”, „Zamawiający:”, potem dane; silnik układa je parami według położenia na stronie.',
  },
};

const SETTINGS_META: Record<string, SettingMeta> = {
  unsupported_output: { name: 'Wynik dla dokumentu nieobsługiwanego typu', reason: 'README organizatora: pusty plik .json.' },
  default_llm_profile: { name: 'Domyślny profil LLM', reason: 'Profil używany przez grupy ekstrakcji bez własnego profilu.' },
  llm_concurrency: { name: 'Równoległe wywołania LLM', reason: 'Konwersja kolejnego dokumentu nie czeka na odpowiedź modelu.' },
  ocr_tolerant_grounding: {
    name: 'Tolerancyjne porównanie z tekstem skanu',
    reason: 'Na skanach wartość z LLM może różnić się od OCR polskimi znakami i pomyłkami 0/o, 1/l.',
  },
  ocr_restore_diacritics: {
    name: 'Przywracanie polskich znaków na skanach',
    reason: 'Słownik SJP przywraca znaki zgubione przez OCR, zanim tekst trafi do reguł i LLM.',
  },
};

export function formatSettingValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'tak' : 'nie';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function settingsList(values: Record<string, unknown>, meta: Record<string, SettingMeta>, skip: string[] = []): ConversionSetting[] {
  return Object.entries(values)
    .filter(([key]) => !skip.includes(key))
    .map(([key, value]) => ({
      key,
      name: meta[key]?.name ?? key,
      value: formatSettingValue(value),
      reason: meta[key]?.reason ?? '',
    }));
}

export function mapConversionProfile(p: Record<string, unknown> & { id: string }): ConversionProfile {
  return { code: p.id, settings: settingsList(p, CONVERSION_META, ['id']) };
}

export function engineSettings(snapshot: ReleaseSnapshotDto): ConversionSetting[] {
  return settingsList(snapshot.settings, SETTINGS_META);
}
