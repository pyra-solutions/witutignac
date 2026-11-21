# Wykorzystany model językowy (LLM)

Silnik używa małego, otwartego modelu językowego przez API dostawcy z serwerami w UE. Model nie widzi plików PDF: dostaje fragment tekstu w formacie Markdown (wynik Docling uruchomionego lokalnie na CPU) i schemat JSON, do którego musi dopasować odpowiedź.

## Dostawca i model do oceny

| | |
| --- | --- |
| Dostawca | OVHcloud AI Endpoints (przetwarzanie we Francji, API zgodne z OpenAI) |
| Adres API | `https://oai.endpoints.kepler.ai.cloud.ovh.net/v1` |
| Model domyślny | `Qwen3.5-9B` (9,7 mld parametrów, licencja Apache 2.0) |
| Klucz | zmienna `OVH_AI_ENDPOINTS_ACCESS_TOKEN` (plik `.env` poza repozytorium) |
| Parametry | temperatura 0, `seed` 42, `max_tokens` 2048, odpowiedź wymuszona schematem (`response_format: json_schema`) |

Profil jest zapisany w konfiguracji (`config/seed/release.yaml`, profil `default`). Zmianę modelu albo dostawcy wykonuje się w konfiguracji albo zmiennymi `LLM_BASE_URL`, `LLM_MODEL` i `LLM_API_KEY`, bez zmian w kodzie.

Kandydaci do porównania, wszyscy z obsługą `json_schema` i licencją Apache 2.0 ([katalog OVHcloud](https://catalog.endpoints.ai.ovh.net/rest/v1/models_v2), stan na 21.11.2026):

| Model | Parametry (mld) | USD za 1 mln tokenów: wejście / wyjście |
| --- | --- | --- |
| Qwen3.5-9B | 9,7 | 0,12 / 0,18 |
| gpt-oss-20b | 21 | 0,05 / 0,18 |
| Mistral-Small-3.2-24B-Instruct-2506 | 24 | 0,10 / 0,31 |
| gemma-4-26b-a4b | 26 | 0,10 / 0,41 |

Organizator przyznaje więcej punktów za mniejszy model, więc domyślnie używamy najmniejszego. Większy model wybierzemy tylko wtedy, gdy wyraźnie podniesie F1.

## Jak LLM jest używany

- **Jedno wywołanie na dokument** (jedna grupa pól na typ dokumentu). Odwołanie zużywa około 5 000 tokenów wejścia, pełnomocnictwo i przelew po około 1 000–1 500.
- **Schemat JSON** budowany automatycznie z definicji pól w konfiguracji. Każde pole ma instrukcję w języku polskim, a pola słownikowe (np. powód odwołania 1–12) dostają listę dozwolonych wartości.
- **Weryfikacja źródła.** Wartość podana przez model, której nie da się odnaleźć w tekście dokumentu, jest odrzucana i zastępowana wynikiem reguły albo wartością null.
- **Reguły mają pierwszeństwo tam, gdzie są pewniejsze:** identyfikatory (NIP, REGON, KRS, rachunki, numery ogłoszeń) i powód czynności wskazany wprost w zdaniu „Zamawiający w dniu…”. LLM rozstrzyga pola opisowe i układy, których reguły nie obejmują.
- **Tryb awaryjny.** Gdy API jest niedostępne albo odpowiedź jest niepoprawna, silnik zapisuje wynik z samych reguł.
- **Bezpieczeństwo.** Treść dokumentu jest w znacznikach `<dokument>` i traktowana jako dane. Klucz API nie trafia do logów, cache ani śladu ekstrakcji.
- **Limity dostawcy.** Klient pilnuje limitu tokenów na minutę, respektuje czas oczekiwania podany przez API (błąd 429) i ponawia zapytania po błędach serwera.
- **Powtarzalność i koszt.** Odpowiedzi są zapisywane w cache po skrócie treści zapytania, więc ponowne przetworzenie tych samych dokumentów nie wywołuje modelu.

## Profil deweloperski

Do prac nad silnikiem na syntetycznych danych treningowych służy profil `gemini-dev`: model `gemma-4-26b-a4b-it` przez API Google. To ten sam otwarty model, który OVHcloud oferuje we Francji. API Google nie gwarantuje jednak przetwarzania w UE, więc ten profil nie jest używany do oceny.
