import { FieldType } from './config.model';

export type DocumentStatus =
  | 'w-kolejce'
  | 'przetwarzanie'
  | 'gotowy'
  | 'do-weryfikacji'
  | 'zatwierdzony'
  | 'nieobslugiwany'
  | 'blad';

/** Skąd pochodzi wartość pola: ze śladu ekstrakcji silnika albo z poprawki człowieka. */
export type FieldSource = 'rules' | 'llm' | 'derived' | 'default' | 'manual';

export interface FieldResult {
  /** Unikalny klucz z indeksami list, np. `Odwolujacy[0].nip`. */
  key: string;
  /** Ścieżka definicji, np. `Odwolujacy[].nip`. */
  path: string;
  /** Sekcja wyniku do grupowania na ekranie, np. „Odwołujący 1”. */
  section: string;
  label: string;
  type: FieldType;
  value: string | number | null;
  /** Wartość z silnika (przed poprawką człowieka). */
  originalValue: string | number | null;
  source: FieldSource | null;
  /** Strona PDF z dopasowaniem reguły. */
  page: number | null;
  /** Fragment tekstu, z którego reguła odczytała wartość. */
  quote: string | null;
  /** Uwagi silnika z arbitrażu źródeł (np. wartość z LLM odrzucona, bo nie ma jej w tekście). */
  notes: string[];
  /** Teksty do wyszukania w PDF, w kolejności prób. */
  candidates: string[];
  /** Ostrzeżenia walidatorów silnika dla bieżącej wartości. */
  warnings: string[];
  corrected: boolean;
}

export interface CaseDocument {
  id: string;
  caseId: string;
  fileName: string;
  outputFileName: string;
  size: number;
  status: DocumentStatus;
  /** Etap przetwarzania do wyświetlenia, np. „Konwersja i OCR”. */
  stage: string | null;
  typeCode: string | null;
  pages: number | null;
  scanned: boolean | null;
  release: string | null;
  errors: string[];
  seconds: number | null;
  processedAt: string | null;
  approvedAt: string | null;
  pdfUrl: string;
  markdownUrl: string;
  traceUrl: string;
  /** Wynik silnika (null przed przetworzeniem). */
  engineResult: unknown;
  /** Wynik bieżący: po poprawkach człowieka albo z silnika. */
  result: unknown;
  reviewed: boolean;
  validation: Record<string, string[]>;
  warningCount: number;
}

export interface CaseRecord {
  id: string;
  name: string;
  createdAt: string;
  appellant: string | null;
  contractingAuthority: string | null;
  procurementTitle: string | null;
  documents: CaseDocument[];
  /** Czy któryś dokument czeka w kolejce albo jest przetwarzany. */
  processing: boolean;
}
