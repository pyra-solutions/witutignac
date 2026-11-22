/**
 * Kształt odpowiedzi API backendu (FastAPI, backend/o2j_backend/api.py). Klucze jak w Pythonie (snake_case);
 * na model ekranów tłumaczą je magazyny w core/config i core/data.
 */

export type EngineDocStatus = 'queued' | 'converting' | 'extracting' | 'done' | 'unsupported' | 'error';

export interface DocumentDto {
  id: string;
  file_name: string;
  output_file_name: string;
  size: number;
  status: EngineDocStatus;
  doc_type: string | null;
  pages: number | null;
  scanned: boolean | null;
  release: string | null;
  errors: string[];
  seconds: number | null;
  processed_at: string | null;
  reviewed_at: string | null;
  approved_at: string | null;
  /** Wynik silnika (plik output/<plik>.json); null przed przetworzeniem. */
  result: unknown;
  /** Wynik po poprawkach człowieka albo null. */
  review: unknown;
  /** Ostrzeżenia walidatorów silnika dla bieżącego wyniku, po kluczu z indeksami. */
  validation: Record<string, string[]>;
}

export interface CaseDto {
  id: string;
  name: string;
  created_at: string;
  documents: DocumentDto[];
}

export interface CreatedCaseDto {
  case: CaseDto;
  rejected: string[];
}

export interface SystemDto {
  version: string;
  release: string;
  published_release: string | null;
  docling_version: string | null;
  llm: { enabled: boolean; profile: string; model: string | null; base_url: string; key: string };
  pending_documents: number;
  data_dir: string;
}

export interface ReleaseDto {
  version: string;
  status: 'active' | 'inactive';
  sha256: string;
  author: string;
  summary: string;
  created_at: string;
}

export interface ProviderDto {
  code: string;
  name: string;
  base_url: string;
  data_location: string | null;
  note: string;
}

export interface ModelDto {
  model: string;
  name: string;
  vendor: string;
  params_billions: number | null;
  license: string;
  note: string;
}

export interface LlmSchemaDto {
  group: string;
  llm_profile: string;
  fields: string[];
  schema: unknown;
}

export interface AuditEntryDto {
  at: string;
  event: string;
  user: string;
  case_id: string | null;
  document: string | null;
  [key: string]: unknown;
}

// --- wydanie konfiguracji silnika (engine/odwolania2json/config.py) ---------------------------

export interface StepRefDto {
  name: string;
  args: Record<string, unknown>;
  severity: 'warning' | 'error';
}

export interface RuleDto {
  kind: 'regex' | 'dictionary_match';
  pattern: string | null;
  section: string | null;
  dictionary: string | null;
}

export interface DeriveDto {
  kind: 'dictionary_lookup' | 'present' | 'map_regex' | 'constant' | 'count_at_least';
  source: string | null;
  dictionary: string | null;
  if_true: unknown;
  if_false: unknown;
  cases: { pattern: string; value: unknown }[];
  constant: unknown;
}

export interface FieldDefDto {
  path: string;
  type: 'string' | 'integer' | 'number' | 'date';
  instruction: string;
  group: string | null;
  rules: RuleDto[];
  strategy: 'llm_first' | 'rules_first' | 'rules_only' | 'llm_only';
  normalizers: StepRefDto[];
  validators: StepRefDto[];
  derive: DeriveDto | null;
  enum: (string | number)[] | null;
  dictionary: string | null;
  grounding: string;
  default: unknown;
}

export interface SectionDto {
  name: string;
  start: string[];
  end: string[];
  within: string | null;
  max_chars: number | null;
}

export interface GroupDto {
  name: string;
  instruction: string;
  sections: string[];
  max_chars: number;
  llm_profile: string | null;
}

export interface DocumentTypeDto {
  code: string;
  name: string;
  classification: {
    patterns: { pattern: string; weight: number; first_chars: number | null }[];
    min_score: number;
    description: string;
  };
  conversion_profile: string;
  sections: SectionDto[];
  lists: { path: string; min_items: number; max_items: number | null; instruction: string }[];
  groups: GroupDto[];
  fields: FieldDefDto[];
}

export interface DictionaryDto {
  code: string;
  name: string;
  entries: ({ id: string | number; keywords: string[] } & Record<string, unknown>)[];
}

export interface LlmProfileDto {
  id: string;
  base_url: string | null;
  model: string | null;
  api_key_env: string;
  temperature: number;
  max_tokens: number;
  timeout_s: number;
  structured_output: string;
}

export interface ReleaseSnapshotDto {
  version: string;
  settings: Record<string, unknown> & { default_llm_profile: string };
  conversion_profiles: (Record<string, unknown> & { id: string })[];
  llm_profiles: LlmProfileDto[];
  dictionaries: DictionaryDto[];
  document_types: DocumentTypeDto[];
}

export interface ActiveConfigDto {
  source: string;
  published_version: string | null;
  snapshot: ReleaseSnapshotDto;
}

// --- ślad ekstrakcji (pipeline.Engine.finalize) -----------------------------------------------

export interface TraceFieldDto {
  source?: 'rules' | 'llm' | 'derived' | 'default' | null;
  value?: unknown;
  raw?: unknown;
  rule_value?: unknown;
  llm_value?: unknown;
  quote?: string;
  page?: number | null;
  warnings?: string[];
  derive?: string;
  dropped?: string;
}

export interface LlmCallDto {
  group: string;
  model: string;
  seconds: number;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  provider?: string;
  region?: string;
  from_cache?: boolean;
}

export interface TraceDto {
  file: string;
  release: string;
  doc_type: string | null;
  classification_scores: Record<string, number>;
  errors: string[];
  conversion?: {
    pages: number;
    scanned: boolean;
    ocr_mode: string;
    low_grade: string | null;
    mean_grade: string | null;
    seconds: number;
    from_cache: boolean;
    restored_diacritics?: string[];
  };
  llm: LlmCallDto[];
  fields?: Record<string, TraceFieldDto>;
}
