# Odwołania2json – frontend (Angular)

Interfejs do wgrywania spraw, weryfikacji danych wyekstrahowanych z dokumentów odwołań do KIO i przeglądu
konfiguracji silnika. Działa na danych z backendu (`backend/`, FastAPI), który przetwarza PDF-y tym samym silnikiem
co CLI.

## Uruchomienie dla użytkownika

Z katalogu głównego: `gui.bat` (Windows) albo `./gui.sh`. Skrypt uruchamia backend, który serwuje zbudowany
interfejs z `backend/o2j_backend/static` pod adresem http://127.0.0.1:8000. Node.js nie jest wtedy potrzebny.

## Praca nad kodem

Z katalogu głównego repozytorium:

```bash
npm ci                                   # instalacja zależności z package-lock.json
./gui.sh                                 # backend na porcie 8000 (albo: python backend/manage.py serve --reload)
npm start                                # serwer deweloperski: http://localhost:4200, /api przekierowane na :8000
npm test                                 # testy jednostkowe (Vitest)
npm run lint                             # ESLint
npm run build                            # build produkcyjny do backend/o2j_backend/static
```

Po zmianach w kodzie interfejsu trzeba zbudować go ponownie (`npm run build`) i dodać wynik do repozytorium,
żeby `gui.bat` na komputerze bez Node.js pokazywał aktualną wersję.

Wymagany Node.js 22. `npm ci` działa na npm 10. Nowe pakiety dodawaj przez `npx npm@11 install <pakiet>`, bo npm 10.9
przerywa rozwiązywanie zależności tego workspace błędem `Cannot read properties of null (reading 'edgesOut')`.

## Skąd ekrany biorą dane

| Ekran | Źródło danych (API backendu) |
| --- | --- |
| Sprawy, nowa sprawa | `/api/cases`: wgranie PDF lub ZIP, stan przetwarzania (odświeżany co 2 s), wyniki |
| Weryfikacja dokumentu | wynik i ostrzeżenia walidatorów silnika, ślad ekstrakcji (źródło, strona, cytat, uwagi), PDF i tekst z Docling; poprawki i zatwierdzenie zapisuje `PUT …/review` |
| Typy dokumentów, słowniki, modele LLM, profile Docling | aktywne wydanie konfiguracji (`/api/config/active`), schematy dla LLM, plik YAML, `llm_providers.yaml` |
| Wydania, audyt | `/api/releases`, `/api/audit` |
| Jakość | wyniki z `docs/raport-jakosci.md` (statycznie) |

Konfiguracja silnika ma tylko ścieżki pól, więc etykiety pól są w `core/config/labels.ts`. Pole nowego typu
dokumentu bez wpisu dostaje nazwę z ostatniego członu ścieżki (`numer_umowy` → „Numer umowy”), więc nowy typ
nie wymaga zmian w interfejsie. Ostrzeżenia liczą walidatory silnika po stronie serwera, także po ręcznej poprawce.

## Struktura

```text
src/app/
  core/        typy API, magazyny (konfiguracja, sprawy), mapowanie wydania silnika, spłaszczanie wyniku, formatowanie
  shared/ui/   nagłówek strony, status, komunikat, pusty stan
  features/    pulpit, sprawy, weryfikacja (podgląd PDF z podświetlaniem, przebieg), konfiguracja, jakość, audyt
```

Podgląd PDF (`features/review/pdf-viewer.ts`) używa pdf.js. Wartość pola jest wyszukiwana w warstwie tekstowej
(bez białych znaków, z ujednoliconymi cudzysłowami i myślnikami), także w surowej postaci odczytanej przez regułę,
a ramka obejmuje tylko dopasowany fragment linii. Skany nie mają warstwy tekstowej, więc na nich podświetlenia nie ma;
stronę i cytat podaje lista pól.

## Dostępność i wygląd

Cel to WCAG 2.1 AA: link „Przejdź do treści”, obsługa klawiaturą, widoczny fokus, kontrast co najmniej 4,5:1, statusy
opisane tekstem i ikoną. Fonty (Source Sans 3, OFL) i ikony (Material Symbols, Apache 2.0, pojedyncze pliki SVG
w `public/icons`) są serwowane lokalnie, bez zewnętrznych CDN.
