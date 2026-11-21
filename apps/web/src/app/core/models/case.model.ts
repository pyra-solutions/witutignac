import { ExtractionStrategy, FieldType } from './config.model';

export type DocumentStatus = 'gotowy' | 'do-weryfikacji' | 'zatwierdzony';

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
  /** Wartość wyekstrahowana pierwotnie (przed poprawką człowieka). */
  originalValue: string | number | null;
  method: ExtractionStrategy;
  /** Przykładowa pewność w makiecie; docelowo z silnika. */
  confidence: number | null;
  /** Teksty do wyszukania w PDF, w kolejności prób. */
  candidates: string[];
  warnings: string[];
  corrected: boolean;
}

export interface CaseDocument {
  id: string;
  caseId: string;
  fileName: string;
  outputFileName: string;
  pdfUrl: string;
  markdownUrl: string;
  typeCode: string;
  status: DocumentStatus;
  /** Wynik w formacie wyjściowym (JSON zgodny ze wzorcem organizatora). */
  result: unknown;
  fields: FieldResult[];
}

export interface CaseRecord {
  id: string;
  source: string;
  appellant: string | null;
  contractingAuthority: string | null;
  procurementTitle: string | null;
  documents: CaseDocument[];
}
