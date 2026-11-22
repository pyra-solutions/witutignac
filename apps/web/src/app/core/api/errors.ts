import { HttpErrorResponse } from '@angular/common/http';

/** Komunikat dla człowieka z błędu HTTP; przy braku serwera podpowiada, jak go uruchomić. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) return fallback;
  if (error.status === 0 || error.status === 502 || error.status === 504) {
    return 'Brak połączenia z serwerem aplikacji. Uruchom gui.bat (Windows) albo ./gui.sh i odśwież stronę.';
  }
  const detail = (error.error as { detail?: unknown } | null)?.detail;
  if (typeof detail === 'string') return detail;
  if (detail && typeof detail === 'object' && 'message' in detail) return String((detail as { message: unknown }).message);
  return `${fallback} (HTTP ${error.status})`;
}

/** Lista odrzuconych plików z odpowiedzi 422 przy wgrywaniu sprawy. */
export function rejectedFiles(error: unknown): string[] {
  if (!(error instanceof HttpErrorResponse)) return [];
  const detail = (error.error as { detail?: { rejected?: unknown } } | null)?.detail;
  return Array.isArray(detail?.rejected) ? detail.rejected.map(String) : [];
}
