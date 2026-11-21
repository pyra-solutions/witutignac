/**
 * Model konfiguracji: odpowiada tabelom konfiguracyjnym z planu
 * (document_type, field_definition, extraction_group, dictionary, llm_*, conversion_profile, config_release).
 * W makiecie dane pochodzą z core/config/mock-config.ts; docelowo z API NestJS.
 */

export type ExtractionStrategy = 'llm' | 'regex' | 'slownik' | 'regula';

export type FieldType = 'tekst' | 'data' | 'liczba' | 'kwota' | 'flaga' | 'enum';

export interface FieldDefinition {
  /** Ścieżka w wyjściowym JSON; `[]` oznacza listę, np. `Odwolujacy[].nip`. */
  path: string;
  label: string;
  type: FieldType;
  nullable: boolean;
  /** Kod grupy ekstrakcji (jedno wywołanie LLM na grupę). */
  group: string;
  /** Kolejność strategii; pierwsza jest główna. */
  strategies: ExtractionStrategy[];
  normalizers: string[];
  validators: string[];
  dictionary?: string;
  instruction: string;
}

export interface ExtractionGroup {
  code: string;
  label: string;
  /** Jaki fragment Markdown trafia do LLM. */
  context: string;
  llmProfile: string;
}

export interface ClassifierRule {
  term: string;
  weight: number;
}

export interface DocumentTypeDefinition {
  code: string;
  name: string;
  description: string;
  /** Wzorzec nazwy pliku wynikowego; README wymaga nazwy pliku wejściowego. */
  outputFile: string;
  conversionProfile: string;
  classifier: ClassifierRule[];
  /** Etykiety sekcji i list w wyniku, np. `Odwolujacy` → „Odwołujący”. */
  sectionLabels: Record<string, string>;
  groups: ExtractionGroup[];
  fields: FieldDefinition[];
}

export interface DictionaryEntry {
  id: number;
  label: string;
  note?: string;
}

export interface Dictionary {
  code: string;
  name: string;
  description: string;
  /** Co zapisujemy w polu wyniku: identyfikator pozycji czy jej etykietę. */
  valueKind: 'id' | 'label';
  entries: DictionaryEntry[];
}

export type ProviderRole = 'ocena' | 'zapasowy' | 'docelowy';

export interface LlmProvider {
  code: string;
  name: string;
  baseUrl: string;
  dataLocation: string;
  role: ProviderRole;
  note: string;
}

export interface LlmProfile {
  code: string;
  model: string;
  provider: string;
  paramsBillions: number;
  license: string;
  /** USD za 1 mln tokenów wejścia / wyjścia, wg katalogu dostawcy. */
  priceIn: number;
  priceOut: number;
  context: string;
  temperature: number;
  structuredOutput: boolean;
  status: 'kandydat' | 'wybrany';
}

export interface ConversionSetting {
  name: string;
  value: string;
  reason: string;
}

export interface ConversionProfile {
  code: string;
  name: string;
  doclingVersion: string;
  settings: ConversionSetting[];
}

export type ReleaseStatus = 'szkic' | 'aktywne' | 'archiwalne';

export interface ConfigRelease {
  version: string;
  status: ReleaseStatus;
  author: string;
  date: string;
  summary: string;
}
