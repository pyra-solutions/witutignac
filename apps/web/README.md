# Odwołania2json – frontend (Angular)

Interfejs do weryfikacji danych wyekstrahowanych z dokumentów odwołań do KIO i do konfiguracji typów dokumentów.
Na razie to makieta: działa bez backendu, na danych przykładowych.

## Uruchomienie

Z katalogu głównego repozytorium:

```bash
npm ci          # instalacja zależności z package-lock.json
npm start       # serwer deweloperski: http://localhost:4200
npm test        # testy jednostkowe (Vitest)
npm run lint    # ESLint
npm run build   # build produkcyjny do dist/apps/web
```

Wymagany Node.js 22. `npm ci` działa na npm 10. Nowe pakiety dodawaj przez `npx npm@11 install <pakiet>`, bo npm 10.9
przerywa rozwiązywanie zależności tego workspace błędem `Cannot read properties of null (reading 'edgesOut')`.

## Co jest w makiecie

| Ekran | Źródło danych |
| --- | --- |
| Sprawy, weryfikacja dokumentu | PDF-y i wzorcowe JSON-y ze spraw `przyklad_01`–`03` z repozytorium organizatora (`public/mock/`) |
| Zakładka Markdown | Rzeczywisty wynik Docling 2.151.1 dla tych PDF-ów (próba z 21.11.2026) |
| Ostrzeżenia pól | Prawdziwe walidatory: sumy kontrolne NIP, REGON, PESEL, numeru rachunku i formaty |
| Metoda i pewność pól | Przykładowe wartości, do zastąpienia wynikiem silnika |
| Konfiguracja | `src/app/core/config/mock-config.ts`; dane modeli LLM z katalogu OVHcloud |
| Schemat JSON typu dokumentu | Generowany z definicji pól (`core/extraction/json-schema.ts`) |

Zmiany wprowadzone na ekranie weryfikacji (poprawki, zatwierdzenie) istnieją tylko w pamięci przeglądarki.

## Struktura

```text
src/app/
  core/        modele, konfiguracja przykładowa, magazyn spraw, walidatory, formatowanie, ikony
  shared/ui/   nagłówek strony, status, komunikat, pusty stan
  features/    pulpit, sprawy, weryfikacja (podgląd PDF z podświetlaniem), konfiguracja, jakość, audyt
```

Podgląd PDF (`features/review/pdf-viewer.ts`) używa pdf.js. Wartość pola jest wyszukiwana w warstwie tekstowej
(bez białych znaków, z ujednoliconymi cudzysłowami i myślnikami), a ramka obejmuje tylko dopasowany fragment linii.

## Do zrobienia przy podłączaniu API

- Zastąpić `CasesStore` i `mock-config.ts` wywołaniami API NestJS.
- Dopasować model konfiguracji do definicji w `config/seed/` (sekcje dokumentu, wzorce klasyfikacji jako regexy).
- Metodę, fragment źródłowy i stronę pola brać ze śladu ekstrakcji silnika zamiast z wartości przykładowych.
  Silnik zapisuje go poleceniem `run --trace-dir KATALOG` do `<sprawa>/<plik>.trace.json`: dla każdego pola wartość,
  źródło (`rules`, `llm`, `derived`, `default`), cytat z reguły, numer strony, wartość z LLM i ostrzeżenia, a także
  dane konwersji (strony, czy skan, tryb OCR, oceny jakości).

## Dostępność i wygląd

Cel to WCAG 2.1 AA: link „Przejdź do treści”, obsługa klawiaturą, widoczny fokus, kontrast co najmniej 4,5:1, statusy
opisane tekstem i ikoną. Fonty (Source Sans 3, OFL) i ikony (Material Symbols, Apache 2.0, pojedyncze pliki SVG
w `public/icons`) są serwowane lokalnie, bez zewnętrznych CDN.
