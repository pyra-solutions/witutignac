/**
 * Model konfiguracji na ekranach. Budowany z aktywnego wydania silnika (engine/config/release.json,
 * API /api/config/active), które powstaje z plików config/seed/*.yaml (core/config/map-release.ts).
 */

export type FieldType = 'tekst' | 'data' | 'liczba' | 'kwota' | 'flaga' | 'enum';

/** Kolejność źródeł pola w silniku; `derived` = wartość wyliczana z innych pól. */
export type FieldStrategy = 'llm_first' | 'rules_first' | 'rules_only' | 'llm_only' | 'derived';

export interface FieldDefinition {
  /** Ścieżka w wyjściowym JSON; `[]` oznacza listę, np. `Odwolujacy[].nip`. */
  path: string;
  label: string;
  type: FieldType;
  /** Typ w konfiguracji silnika: string, integer, number, date. */
  engineType: string;
  /** Grupa ekstrakcji LLM (jedno wywołanie na grupę). */
  group: string | null;
  strategy: FieldStrategy;
  ruleCount: number;
  /** Rodzaj wyliczenia dla pól pochodnych, np. `dictionary_lookup`. */
  derive: string | null;
  normalizers: string[];
  validators: string[];
  dictionary?: string;
  /** Dozwolone wartości (lista `enum` albo wartości pola wyliczanego). */
  allowed?: (string | number)[];
  grounding: string;
  instruction: string;
}

export interface ClassifierRule {
  pattern: string;
  weight: number;
  /** Wzorzec szukany tylko w pierwszych N znakach dokumentu; null = w całym. */
  firstChars: number | null;
}

export interface SectionDefinition {
  name: string;
  start: string[];
  end: string[];
  within: string | null;
  maxChars: number | null;
}

export interface ExtractionGroup {
  code: string;
  label: string;
  instruction: string;
  /** Sekcje dokumentu, które trafiają do LLM; pusta lista = cały dokument. */
  sections: string[];
  maxChars: number;
  llmProfile: string;
}

export interface DocumentTypeDefinition {
  code: string;
  name: string;
  description: string;
  conversionProfile: string;
  minScore: number;
  classifier: ClassifierRule[];
  sections: SectionDefinition[];
  /** Etykiety sekcji i list w wyniku, np. `Odwolujacy` → „Odwołujący”. */
  sectionLabels: Record<string, string>;
  groups: ExtractionGroup[];
  fields: FieldDefinition[];
}

export interface DictionaryEntry {
  id: string | number;
  label: string;
  keywords: string[];
}

export interface Dictionary {
  code: string;
  name: string;
  entries: DictionaryEntry[];
}

export interface LlmProvider {
  code: string;
  name: string;
  baseUrl: string;
  dataLocation: string | null;
  note: string;
}

export interface LlmModelInfo {
  model: string;
  name: string;
  vendor: string;
  paramsBillions: number | null;
  license: string;
  note: string;
}

export interface LlmProfile {
  code: string;
  model: string | null;
  baseUrl: string | null;
  apiKeyEnv: string;
  temperature: number;
  maxTokens: number;
  timeoutS: number;
  structuredOutput: string;
  isDefault: boolean;
}

export interface ConversionSetting {
  key: string;
  name: string;
  value: string;
  reason: string;
}

export interface ConversionProfile {
  code: string;
  settings: ConversionSetting[];
}

export interface ConfigRelease {
  version: string;
  active: boolean;
  author: string;
  createdAt: string;
  summary: string;
  sha256: string;
}
