# Odwołania2json: uruchomienie oceny

## Komenda

```bash
cd /opt/solution && sudo bash odwolania2json/run.sh
```

## Modele AI używane podczas przetwarzania

| Etap | Model | Gdzie działa | Wielkość | Licencja |
|---|---|---|---|---|
| Układ strony PDF: akapity, nagłówki, tabele | Docling Layout Heron (`docling-project/docling-layout-heron`) | lokalnie, CPU | 42,9 mln parametrów | Apache 2.0 |
| Struktura tabel | Docling TableFormer, wariant `accurate` (`docling-project/docling-models`) | lokalnie, CPU | 53,2 mln parametrów | CDLA-Permissive-2.0 |
| OCR: wykrywanie linii tekstu | RapidOCR, model PaddleOCR PP-OCRv6 `det` small | lokalnie, CPU | 9,9 MB | Apache 2.0 |
| OCR: rozpoznawanie tekstu (język polski) | RapidOCR, model PaddleOCR PP-OCRv6 `rec` small | lokalnie, CPU | 21,2 MB | Apache 2.0 |
| OCR: kierunek linii tekstu | RapidOCR, model PaddleOCR `ch_ppocr_mobile_v2.0_cls` | lokalnie, CPU | 0,6 MB | Apache 2.0 |
| Odczyt pól do JSON | Qwen3.5-9B (`flexai/Qwen3.5-9B`) | API Eden AI, endpoint UE `https://api.eu.edenai.run/v3`, dostawca FlexAI, przetwarzanie w UE | 9,7 mld parametrów | Apache 2.0 |

- OCR czyta skany oraz obrazy wewnątrz PDF-ów cyfrowych.
- Model językowy nie dostaje pliku PDF, tylko tekst dokumentu w formacie Markdown, wyeksportowany przez Docling.
- Jedyną usługą zewnętrzną jest Eden AI. Klucz API jest w `/opt/solution/.env` (zmienna `EDEN_AI_API_KEY`).
- Modele Docling i RapidOCR są już na dysku serwera, więc w czasie oceny nic nie jest pobierane.
- Bez AI działają klasyfikacja rodzaju dokumentu, reguły (wyrażenia regularne), walidacja i przywracanie
  polskich znaków słownikiem SJP.
