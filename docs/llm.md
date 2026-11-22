# Wykorzystany model językowy (LLM)

Silnik używa małego, otwartego modelu językowego przez API dostawcy z serwerami w UE. Model nie widzi plików PDF: dostaje fragment tekstu w formacie Markdown (wynik Docling uruchomionego lokalnie na CPU) i schemat JSON, do którego musi dopasować odpowiedź.

## Dostawca i model do oceny

| | |
| --- | --- |
| Bramka API | Eden AI SAS (Francja), endpoint UE zgodny z API OpenAI: `https://api.eu.edenai.run/v3` |
| Dostawca modelu | FlexAI, region `eu`; Eden AI potwierdza dostawcę i region w metadanych każdej odpowiedzi, a silnik zapisuje je w śladzie ekstrakcji |
| Model | `flexai/Qwen3.5-9B`, czyli Qwen3.5-9B (9,7 mld parametrów, otwarte wagi, licencja Apache 2.0) |
| Klucz | zmienna `EDEN_AI_API_KEY` (plik `.env` poza repozytorium) |
| Parametry | temperatura 0, `seed` 42, `max_tokens` 2048, odpowiedź wymuszona schematem (`response_format: json_schema`) |
| Cena (katalog Eden AI) | 0,10 USD za 1 mln tokenów wejścia, 0,15 USD za 1 mln tokenów wyjścia; 15 spraw kontrolnych kosztowało około 0,01 USD |

Profil `eden-qwen3.5-9b` jest zapisany w konfiguracji (`config/seed/release.yaml`) i ustawiony jako domyślny. Zmianę modelu albo dostawcy wykonuje się w konfiguracji albo zmiennymi `LLM_BASE_URL`, `LLM_MODEL` i `LLM_API_KEY`, bez zmian w kodzie. Konfiguracja zawiera też profile porównawcze Ministral 3B i 8B z tabeli poniżej.

## Przetwarzanie danych

README organizatora wymaga, aby API świadczyła firma, która w polityce prywatności określa zakres i miejsce przetwarzania danych, z serwerów w UE/EOG.

- **Co wychodzi z komputera.** Tylko fragmenty tekstu dokumentu (Markdown) i schemat JSON. Pliki PDF nie opuszczają komputera.
- **Eden AI** (Eden AI SAS, Villeurbanne, Francja), [polityka prywatności](https://www.edenai.co/privacy-policy):
  - zakres: §2–§4 wymieniają kategorie danych i cele; treść zapytań synchronicznych nie jest domyślnie przechowywana („request and response content from synchronous API calls is not stored by default”);
  - miejsce: §7: „Our main infrastructure is hosted in the European Union (Amazon Web Services, Paris)” oraz „When you use our EU endpoint, request and response content is not routed to AI inference infrastructure outside the European Union”;
  - [DPA](https://www.edenai.co/dpa), §12.2: dla treści wysłanych przez endpoint UE Eden AI nie kieruje ich do infrastruktury poza UE; jeśli żaden dostawca z UE nie obsługuje modelu, wywołanie kończy się błędem ([dokumentacja endpointu UE](https://www.edenai.co/docs/v3/data-governance/eu-endpoint)).
- **FlexAI**: [DPA](https://flex.ai/dpa) opisuje EU Workspace (FlexAI SAS, Paryż), którego zapytania nie są kierowane poza UE; według [polityki prywatności](https://flex.ai/privacy-policy) prompty i odpowiedzi są przetwarzane w pamięci i nie są przechowywane.
- **Dowód dla każdego wywołania.** Profil wysyła nagłówek `x-edenai-metadata: enabled`, a ślad ekstrakcji zapisuje w `llm[].provider` i `llm[].region` wartości zwrócone przez Eden AI (`flexai`, `eu`).

**Czego nie udało się potwierdzić.** Administratorem danych w polityce prywatności FlexAI jest FlexAI Systems Inc (USA), z przedstawicielem w UE (FlexAI SAS), a polityka mówi o przechowywaniu danych konta w USA. Strony nie mówią też wprost, z której ścieżki FlexAI (globalnej czy UE) korzysta Eden AI. Gwarancję przetwarzania w UE daje więc umowa z Eden AI (endpoint UE), a nie polityka FlexAI. Stan stron: 21.11.2026.

## Porównanie modeli

Pomiar z 21.11.2026 na 15 sprawach kontrolnych (04, 08, …, 60): 47 plików PDF, w tym 2 dokumenty negatywne. Wszystkie modele mają otwarte wagi, licencję Apache 2.0 i przetwarzanie w UE. Konwersja Docling była w cache, więc czas to głównie wywołania LLM (4 równolegle).

| Profil | Model i dostawca | Parametry (mld) | F1 | Błędy wywołań | Czas | Koszt |
| --- | --- | --- | --- | --- | --- | --- |
| `eden-qwen3.5-9b` (domyślny) | Qwen3.5-9B, FlexAI | 9,7 | **0,993** | 0 z 45 | 31 s | 0,010 USD |
| `eden-qwen3.5-9b-ovh` (usunięty od wydania 2026.11.21-dev.8) | Qwen3.5-9B, OVHcloud | 9,7 | 0,986 | 17 z 45 | 672 s | 0,033 USD |
| `eden-ministral-3b` | Ministral 3 3B, Mistral AI | 3 | 0,966 | 0 z 45 | 26 s | 0,011 USD |
| `eden-ministral-8b` | Ministral 3 8B, Mistral AI | 8 | 0,939 | 0 z 45 | 46 s | 0,017 USD |
| bez LLM (`--no-llm`) | same reguły | — | 0,971 | — | 25 s | 0 |

- **Qwen3.5-9B przez OVHcloud zawsze rozumuje przed odpowiedzią.** Parametry wyłączające rozumowanie nie działają, a `reasoning_effort: low` tylko je skraca. Mediana odpowiedzi to 5 345 tokenów i 48 s. W 17 dokumentach model przekroczył limit 8 192 tokenów, więc silnik użył samych reguł. Ten sam model u FlexAI odpowiada od razu, w medianie w 2 s.
- **Ministral 3B i 8B obniżają F1 poniżej samych reguł.** Wpisują wartości tam, gdzie wzorzec ma null: 23 i 36 fałszywych trafień wobec 5 przy samych regułach. Mniejszy model daje więcej punktów w etapie 2, ale nie rekompensuje to spadku F1.
- **Na pełnym zbiorze organizatora** (60 spraw, 16 dokumentów negatywnych, 30 skanów) wydanie 2026.11.21-dev.6 daje F1 0,999 dla spraw i 0,935 dla skanów. Ten sam model bez reguł (każde pole tylko z LLM) daje 0,975 dla spraw, a większa Gemma 4 26B bez reguł 0,972 ([raport jakości](raport-jakosci.md)).
- **Pozostałe błędy profilu domyślnego (6 wartości) to znane problemy reguł**, a nie modelu: osoby podpisujące pełnomocnictwo, KRS wskazany bez wzorca, przestawiony nagłówek dwukolumnowy i jeden nieodczytany rachunek ([raport jakości](raport-jakosci.md)).

## Jak LLM jest używany

- **Jedno wywołanie na dokument** (jedna grupa pól na typ dokumentu). Odwołanie zużywa około 5 000 tokenów wejścia, pełnomocnictwo i przelew po około 1 000–1 500.
- **Schemat JSON** budowany automatycznie z definicji pól w konfiguracji. Każde pole ma instrukcję w języku polskim, a pola słownikowe (np. powód odwołania 1–12) dostają listę dozwolonych wartości.
- **Weryfikacja źródła.** Wartość podana przez model, której nie da się odnaleźć w tekście dokumentu, jest odrzucana i zastępowana wynikiem reguły albo wartością null.
- **Reguły mają pierwszeństwo tam, gdzie są pewniejsze:** identyfikatory (NIP, REGON, KRS, rachunki, numery ogłoszeń) i powód czynności wskazany wprost w zdaniu „Zamawiający w dniu…”. LLM rozstrzyga pola opisowe i układy, których reguły nie obejmują.
- **Tryb awaryjny.** Gdy API jest niedostępne albo odpowiedź jest niepoprawna, silnik zapisuje wynik z samych reguł.
- **Bezpieczeństwo.** Treść dokumentu jest w znacznikach `<dokument>` i traktowana jako dane. Klucz API nie trafia do logów, cache ani śladu ekstrakcji.
- **Limity dostawcy.** Klient pilnuje limitu tokenów na minutę, respektuje czas oczekiwania podany przez API (błąd 429) i ponawia zapytania po błędach serwera.
- **Powtarzalność i koszt.** Odpowiedzi są zapisywane w cache po skrócie treści zapytania, więc ponowne przetworzenie tych samych dokumentów nie wywołuje modelu. Temperatura 0 nie gwarantuje identycznej odpowiedzi. Na serwerze oceny, w 150 dokumentach będących kopiami 30 skanów, jedno pole różniło się między kopiami tego samego skanu. Komenda oceny (`run.sh`) działa bez cache, więc każde uruchomienie wywołuje model od nowa.
