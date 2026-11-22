"""Potok: PDF -> Docling Markdown -> klasyfikacja -> reguły + LLM -> arbitraż -> JSON."""

import json
import logging
import re
import time
from collections.abc import Callable
from concurrent.futures import Future, ThreadPoolExecutor
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import odwolania2json.validators  # noqa: F401 — rejestracja walidatorów
from odwolania2json import normalizers as norm
from odwolania2json.assemble import _max_index, assemble, build_tree, flatten, generic, json_schema
from odwolania2json.config import ConversionProfile, DocumentType, FieldDef, Release
from odwolania2json.convert import (
    Converted,
    DoclingConverter,
    rapidocr_pages_text,
    rapidocr_transfer_text,
    restore_dashes,
    text_layer,
)
from odwolania2json.diacritics import restore_diacritics
from odwolania2json.llm import DEFAULT_SYSTEM_PROMPT, LlmClient, LlmError
from odwolania2json.registry import validators
from odwolania2json.rules import Candidate, classify, extract_all
from odwolania2json.textutil import alnum, collapse, fix_ocr_pl, grounded, page_of, section_text

log = logging.getLogger(__name__)


@dataclass
class Prepared:
    pdf: Path
    rel: Path
    conv: Converted | None = None
    doc_type: DocumentType | None = None
    scores: dict[str, float] = field(default_factory=dict)
    rules: dict[str, Candidate] = field(default_factory=dict)
    llm: dict[str, Any] = field(default_factory=dict)
    llm_meta: list[dict[str, Any]] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)
    # słowa z przywróconymi polskimi znakami (przed, po)
    diacritics: list[tuple[str, str]] = field(default_factory=list)
    # wstępna klasyfikacja z warstwy tekstowej, gdy odrzuciła dokument bez konwersji
    preclass: dict[str, Any] | None = None


class Engine:
    def __init__(self, release: Release, cache_dir: Path | None, use_llm: bool = True) -> None:
        self.release = release
        self.cache_dir = cache_dir
        self.use_llm = use_llm
        self.converter = DoclingConverter(cache_dir)
        self._clients: dict[str, LlmClient] = {}
        self._trees = {dt.code: build_tree(dt.fields) for dt in release.document_types}

    # --- LLM -----------------------------------------------------------------
    def client(self, profile_id: str | None) -> LlmClient | None:
        if not self.use_llm:
            return None
        prof = self.release.llm_profile(profile_id)
        if prof.id not in self._clients:
            self._clients[prof.id] = LlmClient(prof, self.cache_dir)
        c = self._clients[prof.id]
        return c if c.enabled else None

    def llm_status(self) -> str:
        if not self.use_llm:
            return "wyłączony (--no-llm)"
        prof = self.release.llm_profile(None)
        return LlmClient(prof, None).describe()

    # --- etapy ---------------------------------------------------------------
    def prepare(self, pdf: Path, rel: Path, conv: Converted | None = None,
                profile: ConversionProfile | None = None) -> Prepared:
        """Konwersja (chyba że `conv` przyszedł z procesu konwersji), klasyfikacja i reguły."""
        prep = Prepared(pdf=pdf, rel=rel)
        try:
            # profil konwersji zależy od typu, a typ od treści: konwertujemy profilem domyślnym
            prof = profile or self.release.conversion_profile("default")
            if conv is None and self._reject_digital_early(pdf, prep):
                return prep
            prep.conv = conv if conv is not None else self.converter.convert(pdf, prof)
            if prep.conv.scanned:
                prep.conv.markdown = fix_ocr_pl(prep.conv.markdown)
                if self.release.settings.ocr_restore_diacritics:
                    prep.conv.markdown, prep.diacritics = restore_diacritics(prep.conv.markdown)
            code, prep.scores = classify(prep.conv.markdown, pdf.stem, self.release)
            if code:
                prep.doc_type = next(d for d in self.release.document_types if d.code == code)
                prep.rules = extract_all(prep.doc_type, prep.conv.markdown, self.release)
                if prep.conv.scanned:
                    if code == "przelew":
                        self._maybe_transfer_fallback(pdf, prof, prep)
                    elif prof.scanned_bleed_cutoff and _bleed_garble_count(prep.conv.markdown) >= 12:
                        self._maybe_bleed_fallback(pdf, prof, prep)
        except Exception as e:  # jeden zły plik nie zatrzymuje całej partii
            log.exception("błąd przygotowania %s", pdf)
            prep.errors.append(f"{type(e).__name__}: {e}")
        return prep

    def _reject_digital_early(self, pdf: Path, prep: Prepared) -> bool:
        """Wstępna klasyfikacja PDF-u cyfrowego z warstwy tekstowej pierwszych stron, bez Doclinga.

        True, gdy dokument wyraźnie nie jest żadnym z obsługiwanych rodzajów: każdemu rodzajowi brakuje do progu
        co najmniej `preclassify_margin` punktów. Skany i dokumenty bliższe progu idą pełną ścieżką
        (False), więc ostateczną klasyfikację dokumentów spraw robi się jak dotąd na tekście z Doclinga."""
        s = self.release.settings
        if s.preclassify_pages <= 0:
            return False
        raw, n = text_layer(pdf, s.preclassify_pages)
        per_page = len(raw.strip()) / max(n, 1)
        if per_page < DoclingConverter.SCAN_CHARS_PER_PAGE:
            return False  # skan albo pusta warstwa tekstowa: rozstrzyga OCR w pełnej ścieżce
        _, scores = classify(raw, pdf.stem, self.release)
        for dt in self.release.document_types:
            if scores.get(dt.code, 0.0) > dt.classification.min_score - s.preclassify_margin:
                return False
        prep.scores = scores
        prep.preclass = {"pages": n, "chars_per_page": round(per_page), "margin": s.preclassify_margin,
                         "decision": "nieobsługiwany bez konwersji (warstwa tekstowa)"}
        return True

    def _maybe_transfer_fallback(self, pdf: Path, prof: ConversionProfile, prep: Prepared) -> None:
        """Dla skanów potwierdzeń przelewów o słabym albo zniekształconym tekście uruchamia zapasowy OCR
        (pypdfium2 + RapidOCR) bez segmentacji tabel Doclinga i wybiera wariant czystszy/pełniejszy."""
        assert prep.conv is not None and prep.doc_type is not None
        if not _weak_transfer_ocr(prep.conv, prep.rules):
            return
        fb_raw = rapidocr_transfer_text(pdf, prof)
        fb_md = fix_ocr_pl(fb_raw)
        fb_diac: list[tuple[str, str]] = []
        if self.release.settings.ocr_restore_diacritics:
            fb_md, fb_diac = restore_diacritics(fb_md)
        fb_rules = extract_all(prep.doc_type, fb_md, self.release)
        if _transfer_text_score(fb_rules, fb_md) > _transfer_text_score(prep.rules, prep.conv.markdown):
            prep.conv.markdown = fb_md
            prep.diacritics = fb_diac
            prep.rules = fb_rules
            prep.conv.notes.append("zapasowy OCR: RapidOCR + pypdfium2")

    def _maybe_bleed_fallback(self, pdf: Path, prof: ConversionProfile, prep: Prepared) -> None:
        """Dla skanów z ciężkim prześwitem z odwrotu kartki uruchamia w pamięci RapidOCR z odcięciem
        szarego pasma (bez stratnej rekompresji całego PDF)."""
        assert prep.conv is not None and prep.doc_type is not None
        fb_raw, cleaned = rapidocr_pages_text(pdf, prof, bleed_cutoff=prof.scanned_bleed_cutoff)
        if not cleaned:
            return
        fb_md = fix_ocr_pl(fb_raw)
        fb_diac: list[tuple[str, str]] = []
        if self.release.settings.ocr_restore_diacritics:
            fb_md, fb_diac = restore_diacritics(fb_md)
        fb_rules = extract_all(prep.doc_type, fb_md, self.release)
        if _bleed_garble_count(fb_md) < _bleed_garble_count(prep.conv.markdown) and len(fb_rules) > len(prep.rules):
            prep.conv.markdown = fb_md
            prep.diacritics = fb_diac
            prep.rules = fb_rules
            prep.conv.notes.append(f"odcięto szare pasmo >{prof.scanned_bleed_cutoff} (RapidOCR)")

    def run_llm(self, prep: Prepared) -> None:
        dt, conv = prep.doc_type, prep.conv
        if dt is None or conv is None:
            return
        sections = {s.name: s for s in dt.sections}
        for g in dt.groups:
            gfields = [f for f in dt.fields if f.group == g.name and not f.derive]
            client = self.client(g.llm_profile)
            if not gfields or client is None:
                continue
            tree = build_tree(gfields)
            lists = [ld for ld in dt.lists if any(f.path.startswith(ld.path + "[]") for f in gfields)]
            schema = json_schema(tree, lists)
            context = self._context(conv.markdown, g.sections, sections, g.max_chars)
            user = self._user_prompt(dt, g.instruction, gfields, context, self.release)
            system = client.profile.system_prompt or DEFAULT_SYSTEM_PROMPT
            try:
                obj, meta = client.extract(system, user, schema, name=f"{dt.code}_{g.name}"[:64])
            except (LlmError, ValueError) as e:
                prep.errors.append(f"LLM grupa '{g.name}': {e}")
                continue
            prep.llm_meta.append({"group": g.name, **meta})
            for k, v in flatten(tree, obj).items():
                if v is not None and not (isinstance(v, str) and not v.strip()):
                    prep.llm[k] = v

    @staticmethod
    def _context(text: str, names: list[str], sections: dict[str, Any], max_chars: int) -> str:
        parts = []
        for n in names:
            st = section_text(text, n, sections)
            if st is not None:
                parts.append(st[0])
        ctx = "\n\n[...]\n\n".join(parts) if parts else text
        return ctx[:max_chars]

    @staticmethod
    def _user_prompt(dt: DocumentType, instruction: str, fields: list[FieldDef], context: str,
                     release: Release) -> str:
        lines = [f"Typ dokumentu: {dt.name}."]
        if instruction:
            lines.append(f"Zadanie: {instruction}")
        lines.append("Pola do wypełnienia:")
        for f in fields:
            lines.append(f"- {f.path}: {f.instruction or '(bez dodatkowych wskazówek)'}")
            if f.dictionary:
                for e in release.dictionary(f.dictionary).entries:
                    label = (e.model_extra or {}).get("opis", "")
                    lines.append(f"    {e.id} = {label}")
        lines.append("")
        lines.append("<dokument>")
        lines.append(context)
        lines.append("</dokument>")
        return "\n".join(lines)

    def finalize(self, prep: Prepared) -> tuple[Any, dict[str, Any]]:
        """Zwraca (wynik JSON albo None dla nieobsługiwanego dokumentu, ślad ekstrakcji)."""
        trace: dict[str, Any] = {
            "file": str(prep.rel),
            "release": self.release.version,
            "doc_type": prep.doc_type.code if prep.doc_type else None,
            "classification_scores": prep.scores,
            "errors": prep.errors,
        }
        if prep.conv:
            c = prep.conv
            trace["conversion"] = {"sha256": c.sha256, "pages": c.pages, "scanned": c.scanned,
                                   "ocr_mode": c.ocr_mode, "low_grade": c.low_grade,
                                   "mean_grade": c.mean_grade, "seconds": round(c.seconds, 2),
                                   "from_cache": c.from_cache}
            if c.notes:
                trace["conversion"]["layout"] = c.notes
            if prep.diacritics:
                trace["conversion"]["restored_diacritics"] = [f"{a} -> {b}" for a, b in prep.diacritics]
        if prep.preclass:
            trace["preclassification"] = prep.preclass
        trace["llm"] = prep.llm_meta
        if prep.doc_type is None or prep.conv is None:
            return None, trace

        dt, text = prep.doc_type, prep.conv.markdown
        fdefs = {f.path: f for f in dt.fields}
        values: dict[str, Any] = {}
        ftrace: dict[str, Any] = {}

        for p in sorted(set(prep.rules) | set(prep.llm), key=_path_order(dt)):
            f = fdefs.get(generic(p))
            if f is None or f.derive:
                continue
            tolerant = self.release.settings.ocr_tolerant_grounding and prep.conv.scanned
            rule_cand, moved = prep.rules.get(p), self._rule_in_other_item(p, prep.rules.get(p), prep.llm, dt.lists)
            if moved:
                rule_cand = None
            cands, warn = self._candidates(f, rule_cand, prep.llm.get(p), text, tolerant)
            if moved:
                warn.append(f"wartość z reguły jest według LLM w innym elemencie listy ({moved}), pominięta")
            # Pierwszy kandydat (w kolejności strategii), który przejdzie normalizację i walidację.
            # Wartość odrzucona przez walidator z poziomem 'error' oddaje miejsce następnemu źródłu.
            source, raw, val = None, (cands[0][1] if cands else None), None
            for i, (src, cand_raw) in enumerate(cands):
                v = self._normalize(f, cand_raw, warn)
                if isinstance(v, str):
                    v = restore_dashes(v, prep.conv.raw_text)
                if v is not None and self._validate(f, v, warn):
                    source, raw, val = src, cand_raw, v
                    break
                if i + 1 < len(cands):
                    warn.append(f"wartość ze źródła '{src}' odrzucona, używam następnego źródła")
            entry: dict[str, Any] = {"source": source, "raw": raw, "warnings": warn}
            cand = prep.rules.get(p)
            if cand is not None:
                entry["rule_value"] = cand.value
                entry["rule"] = cand.rule
                entry["quote"] = collapse(cand.quote)[:200]
                entry["page"] = page_of(text, cand.start)
            if p in prep.llm:
                entry["llm_value"] = prep.llm[p]
            entry["value"] = val
            ftrace[p] = entry
            if val is not None:
                values[p] = val

        for f in dt.fields:
            if f.derive:
                for p, v in self._derive(f, dt, values).items():
                    ftrace[p] = {"source": "derived", "value": v, "derive": f.derive.kind}
                    if v is not None:
                        values[p] = v
            elif f.default is not None and "[]" not in f.path and f.path not in values:
                values[f.path] = f.default
                ftrace[f.path] = {"source": "default", "value": f.default}

        self._apply_list_limits(dt, values, ftrace)
        trace["fields"] = ftrace
        return assemble(self._trees[dt.code], values, dt.lists), trace

    @staticmethod
    def _apply_list_limits(dt: DocumentType, values: dict[str, Any], ftrace: dict[str, Any]) -> None:
        """max_items list, only_if_list_size_at_least (tylko listy najwyższego poziomu) i only_if_present pól."""
        for ld in dt.lists:
            if ld.max_items is None or "[]" in ld.path:
                continue
            rx = re.compile(re.escape(ld.path) + r"\[(\d+)\]")
            for k in list(values):
                m = rx.match(k)
                if m and int(m.group(1)) >= ld.max_items:
                    del values[k]
                    ftrace.setdefault(k, {})["dropped"] = f"lista {ld.path} ma limit {ld.max_items}"
        for f in dt.fields:
            if f.only_if_list_size_at_least is None or "[]" not in f.path:
                continue
            top = f.path.split("[]")[0]
            size = _max_index(values, top) + 1
            if size < f.only_if_list_size_at_least:
                for k in [k for k in values if generic(k) == f.path]:
                    del values[k]
                    ftrace.setdefault(k, {})["dropped"] = (
                        f"lista {top} ma {size} el., pole wymaga co najmniej {f.only_if_list_size_at_least}")
        for f in dt.fields:
            if not f.only_if_present:
                continue
            for k in [k for k in values if generic(k) == f.path]:
                # wymagane pole w tym samym elemencie listy: indeksy z k wstawione w kolejne "[]"
                idx = iter(re.findall(r"\[(\d+)\]", k))
                req = re.sub(r"\[\]", lambda _m: f"[{next(idx, '0')}]", f.only_if_present)
                if values.get(req) in (None, ""):
                    del values[k]
                    ftrace.setdefault(k, {})["dropped"] = f"pole wymaga wartości {req}, a ta jest pusta"

    @staticmethod
    def _rule_in_other_item(p: str, cand: Candidate | None, llm: dict[str, Any],
                            lists: list[Any] | None = None) -> str | None:
        """Reguła zwraca jedną wartość dla pierwszego elementu listy (np. REGON z sekcji „Zamawiający”).
        Gdy LLM umieścił tę samą wartość w innym elemencie tej listy (dwóch Zamawiających), wartość
        należy do tamtego elementu: zwraca jego ścieżkę, a reguła nie nadpisuje tego elementu.
        Ignoruje elementy spoza limitu `max_items` listy, które zostaną odrzucone."""
        if cand is None or cand.value is None or "[" not in p:
            return None
        key = alnum(str(cand.value))
        if not key:
            return None
        limits = {ld.path: ld.max_items for ld in (lists or []) if ld.max_items is not None and "[]" not in ld.path}

        def _kept(path: str) -> bool:
            top, _, rest = path.partition("[")
            idx_s, _, _ = rest.partition("]")
            return top not in limits or not idx_s.isdigit() or int(idx_s) < limits[top]

        return next((q for q, v in llm.items() if q != p and v is not None and generic(q) == generic(p)
                     and _kept(q) and alnum(str(v)) == key), None)

    @staticmethod
    def _candidates(f: FieldDef, cand: Candidate | None, llm_val: Any, text: str,
                    ocr_tolerant: bool = False) -> tuple[list[tuple[str, Any]], list[str]]:
        """Niepuste wartości z reguł i LLM w kolejności strategii pola (LLM tylko po weryfikacji źródła)."""
        warn: list[str] = []
        rule_val = cand.value if cand is not None else None
        llm_ok = llm_val is not None and grounded(llm_val, text, f.grounding, ocr_tolerant)
        if llm_val is not None and not llm_ok:
            warn.append("wartość z LLM nie występuje w tekście dokumentu, odrzucona")
        order = {
            "llm_first": [("llm", llm_val if llm_ok else None), ("rules", rule_val)],
            "rules_first": [("rules", rule_val), ("llm", llm_val if llm_ok else None)],
            "rules_only": [("rules", rule_val)],
            "llm_only": [("llm", llm_val if llm_ok else None)],
        }[f.strategy]
        return [(source, v) for source, v in order if v is not None], warn

    @staticmethod
    def _normalize(f: FieldDef, raw: Any, warn: list[str]) -> Any:
        try:
            val = norm.apply_chain(raw, f.normalizers)
            if val is None:
                return None
            if f.type == "integer" and not isinstance(val, int):
                val = norm.to_int(val)
            elif f.type == "number" and not isinstance(val, (int, float)):
                val = norm.amount_decimal(val)
            elif f.type == "date" and not (isinstance(val, str) and re.fullmatch(r"\d{4}-\d{2}-\d{2}", val)):
                val = norm.date_iso(val)
            elif f.type == "string" and not isinstance(val, str):
                val = str(val)
        except Exception as e:  # noqa: BLE001 — błąd normalizatora nie przerywa dokumentu
            warn.append(f"normalizacja nie powiodła się: {e}")
            return None
        if f.enum is not None and val not in f.enum:
            warn.append(f"wartość {val!r} spoza dozwolonej listy")
            return None
        return val

    @staticmethod
    def _validate(f: FieldDef, val: Any, warn: list[str]) -> bool:
        ok = True
        for v in f.validators:
            msg = validators.get(v.name)(val, **v.args)
            if msg:
                warn.append(f"{v.name}: {msg}")
                if v.severity == "error":
                    ok = False
        return ok

    def _derive(self, f: FieldDef, dt: DocumentType, values: dict[str, Any]) -> dict[str, Any]:
        d = f.derive
        assert d is not None
        if "[]" in f.path:
            list_prefix = f.path.split("[]")[0]
            min_items = next((ld.min_items for ld in dt.lists if ld.path == list_prefix), 1)
            n = max(_max_index(values, list_prefix) + 1, min_items)
            targets = [(f.path.replace("[]", f"[{i}]", 1), i) for i in range(n)]
        else:
            targets = [(f.path, None)]
        out: dict[str, Any] = {}
        for target, i in targets:
            src = d.source.replace("[]", f"[{i}]", 1) if (d.source and i is not None) else d.source
            out[target] = self._derive_one(d, src, values)
        return out

    def _derive_one(self, d: Any, src: str | None, values: dict[str, Any]) -> Any:
        if d.kind == "constant":
            return d.constant
        if d.kind == "present":
            assert src
            hit = any(v is not None for k, v in values.items() if k == src or k.startswith(src + ".")
                      or k.startswith(src + "["))
            return d.if_true if hit else d.if_false
        sv = values.get(src) if src else None
        if d.kind == "dictionary_lookup":
            if sv is None:
                return d.default
            for e in self.release.dictionary(d.dictionary).entries:
                ev = getattr(e, d.key, None)
                if ev is None:
                    ev = (e.model_extra or {}).get(d.key)
                if str(ev) == str(sv):
                    return getattr(e, d.value, None) if hasattr(e, d.value) else (e.model_extra or {}).get(d.value)
            return d.default
        if d.kind == "map_regex":
            if sv is None:
                return d.default
            for case in d.cases:
                if re.search(case["pattern"], str(sv), flags=re.IGNORECASE):
                    return case["value"]
            return d.default
        if d.kind == "count_at_least":
            assert src
            n = _max_index(values, src) + 1
            return d.if_true if n >= d.min_count else d.if_false
        raise ValueError(f"nieznany rodzaj pola wyliczanego '{d.kind}'")

    # --- partia ----------------------------------------------------------------
    def run(self, input_dir: Path, output_dir: Path, trace_dir: Path | None = None,
            workers: int | None = None) -> list[dict[str, Any]]:
        pdfs = sorted(p for p in input_dir.rglob("*") if p.is_file() and p.suffix.lower() == ".pdf")
        prof = self.release.conversion_profile("default")
        n_workers = resolve_workers(workers if workers is not None else self.release.settings.convert_workers,
                                    len(pdfs))
        log.info("Dokumentów PDF: %d; konwersja: %d %s × %d wątki; LLM: %s", len(pdfs), n_workers,
                 "proces" if n_workers == 1 else "procesy", prof.num_threads, self.llm_status())
        preps: dict[Path, Prepared] = {}
        llm_pool = ThreadPoolExecutor(max_workers=max(1, self.release.settings.llm_concurrency)) if self.use_llm else None
        llm_jobs: list[Future[None]] = []

        def prepared(prep: Prepared) -> None:
            # LLM rusza od razu, równolegle z konwersją kolejnych dokumentów
            preps[prep.pdf] = prep
            c = prep.conv
            if c is not None:
                how = f" ({c.pages} s., {'cache' if c.from_cache else f'{c.seconds:.1f} s'})"
            elif prep.preclass:
                how = f" (bez konwersji: warstwa tekstowa {prep.preclass['pages']} s.)"
            else:
                how = ""
            log.info("[%d/%d] %s -> %s%s", len(preps), len(pdfs), prep.rel,
                     prep.doc_type.code if prep.doc_type else "nieobsługiwany", how)
            if llm_pool is not None:
                llm_jobs.append(llm_pool.submit(self.run_llm, prep))

        budget_s = self.release.settings.batch_time_budget_s
        t_start = time.monotonic()
        cur_tier = 0

        def next_profile(done: int) -> ConversionProfile:
            nonlocal cur_tier
            elapsed = time.monotonic() - t_start
            p_next, tier = select_budget_profile(prof, budget_s, elapsed, done, len(pdfs))
            if tier != cur_tier:
                msg = (f"Budżet czasu ({budget_s:.0f} s): po {done}/{len(pdfs)} dok. ({elapsed:.0f} s) -> "
                       f"poziom {tier} (scanned_max_pages={p_next.scanned_max_pages}, ocr={p_next.ocr_model_size})")
                if tier > cur_tier:
                    log.warning(msg)
                else:
                    log.info(msg)
                cur_tier = tier
            return p_next

        try:
            if n_workers > 1:
                self._prepare_parallel(pdfs, input_dir, n_workers, prepared, next_profile)
            else:
                for i, pdf in enumerate(pdfs):
                    prepared(self.prepare(pdf, pdf.relative_to(input_dir), profile=next_profile(i)))
            for job in llm_jobs:
                job.result()
        finally:
            if llm_pool is not None:
                llm_pool.shutdown(cancel_futures=True)

        summary = []
        for prep in (preps[p] for p in pdfs):
            out, trace = self.finalize(prep)
            dst = output_dir / prep.rel.with_suffix(".json")
            dst.parent.mkdir(parents=True, exist_ok=True)
            if out is None:
                dst.write_text(self.release.settings.unsupported_output, encoding="utf-8")
            else:
                dst.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            if trace_dir is not None:
                tp = trace_dir / prep.rel.with_suffix(".trace.json")
                tp.parent.mkdir(parents=True, exist_ok=True)
                tp.write_text(json.dumps(trace, ensure_ascii=False, indent=2, default=str) + "\n", encoding="utf-8")
            summary.append({"file": str(prep.rel), "doc_type": trace["doc_type"], "errors": prep.errors})
        return summary

    def _prepare_parallel(self, pdfs: list[Path], input_dir: Path, n_workers: int,
                          prepared: Callable[[Prepared], None],
                          next_profile: Callable[[int], ConversionProfile] | None = None) -> None:
        """Konwersja w `n_workers` procesach; klasyfikacja, reguły i LLM w procesie głównym.

        Najdłuższe dokumenty idą pierwsze, żeby na końcu partii nie czekać na jeden długi skan. Gdy proces
        konwersji padnie (np. brak pamięci), pozostałe dokumenty są konwertowane po kolei w tym procesie.
        """
        import multiprocessing as mp
        from concurrent.futures import FIRST_COMPLETED, ProcessPoolExecutor, wait
        from concurrent.futures.process import BrokenProcessPool

        from odwolania2json.convert import page_count, worker_convert, worker_init

        prof = self.release.conversion_profile("default")
        order = sorted(pdfs, key=lambda p: page_count(p, prof.max_pages), reverse=True)
        left = set(pdfs)
        done = 0
        try:
            # "spawn" także na Linuksie: tak samo jak na Windows i bez kopiowania wątków LLM przez fork()
            with ProcessPoolExecutor(max_workers=n_workers, mp_context=mp.get_context("spawn"),
                                     initializer=worker_init,
                                     initargs=(str(self.cache_dir) if self.cache_dir else None,)) as ex:
                it = iter(order)
                jobs: dict[Future[Converted], tuple[Path, ConversionProfile]] = {}

                def submit_one() -> bool:
                    p = next(it, None)
                    if p is None:
                        return False
                    cp = next_profile(done) if next_profile else prof
                    jobs[ex.submit(worker_convert, str(p), cp.model_dump_json())] = (p, cp)
                    return True

                for _ in range(n_workers):
                    if not submit_one():
                        break
                while jobs:
                    finished, _ = wait(jobs, return_when=FIRST_COMPLETED)
                    for job in finished:
                        pdf, used_prof = jobs.pop(job)
                        done += 1
                        left.discard(pdf)
                        try:
                            conv = job.result()
                        except BrokenProcessPool:
                            raise
                        except Exception as e:  # jeden zły plik nie zatrzymuje całej partii
                            log.error("błąd konwersji %s: %s: %s", pdf, type(e).__name__, e)
                            prepared(Prepared(pdf=pdf, rel=pdf.relative_to(input_dir),
                                              errors=[f"{type(e).__name__}: {e}"]))
                        else:
                            prepared(self.prepare(pdf, pdf.relative_to(input_dir), conv=conv, profile=used_prof))
                        submit_one()
        except BrokenProcessPool:
            log.warning("proces konwersji przerwany (np. brak pamięci); pozostałe %d dokumentów po kolei", len(left))
            for pdf in sorted(left):
                cp = next_profile(done) if next_profile else prof
                done += 1
                prepared(self.prepare(pdf, pdf.relative_to(input_dir), profile=cp))


def select_budget_profile(base: ConversionProfile, budget_s: float | None, elapsed_s: float,
                          done: int, total: int) -> tuple[ConversionProfile, int]:
    """Dobiera profil konwersji pod budżet czasu partii (np. 40 min przy limicie 45 min).

    Zwraca (profil, poziom 0..3):
    0 = ustawienia bazowe, 1 = skany max 2 str., 2 = skany max 1 str., 3 = awaryjnie 1 str. + model tiny.
    """
    if budget_s is None or total <= 0:
        return base, 0
    min_done = min(10, max(3, total // 10))
    if done < min_done or elapsed_s < min(30.0, 0.25 * budget_s):
        return base, 0
    rem = total - done
    if rem <= 0:
        return base, 0
    avg_s = elapsed_s / done
    rem_budget = budget_s - elapsed_s
    rem_projected = rem * avg_s
    per_doc_budget = rem_budget / rem
    cur_pages = base.scanned_max_pages or base.max_pages

    if avg_s > max(per_doc_budget, 5.0) and per_doc_budget < 5.0:
        return base.model_copy(update={"scanned_max_pages": 1, "ocr_model_size": "tiny"}), 3
    if rem_projected > rem_budget:
        return base.model_copy(update={"scanned_max_pages": min(cur_pages, 1)}), 2
    if rem_projected > 0.85 * rem_budget:
        return base.model_copy(update={"scanned_max_pages": min(cur_pages, 2)}), 1
    return base, 0


def resolve_workers(value: int, n_docs: int) -> int:
    """Liczba procesów konwersji: nie więcej niż dokumentów i co najmniej 1."""
    return max(1, min(int(value), n_docs))


_GARBLE_RUN = re.compile(r"(?<!\S)[A-Za-z](?:\s+[A-Za-z]){2,}(?!\S)")
_GARBLE_MIX = re.compile(r"\b[a-ząćęłńóśźż]{1,4}\d+[a-ząćęłńóśźż]{1,4}\b")
_BLEED_FRAG = re.compile(r"(?:\b[a-ząćęłńóśźż]{1,2}\b[ \t]+){3,}\b[a-ząćęłńóśźż]{1,2}\b", re.IGNORECASE)
_TRUNC_END = re.compile(r"\b(?:przed|dla|nr|przetargu|postępowaniu|w|z|na|do)\s*$", re.IGNORECASE)


def _transfer_garble_count(text: str) -> int:
    return len(_GARBLE_RUN.findall(text)) + len(_GARBLE_MIX.findall(text))


def _bleed_garble_count(text: str) -> int:
    return len(_BLEED_FRAG.findall(text))


def _weak_transfer_ocr(conv: Converted, rules: dict[str, Candidate]) -> bool:
    if _transfer_garble_count(conv.markdown) > 0:
        return True
    required = ("przelew_bankowy.tytul", "przelew_bankowy.z_rachunku", "przelew_bankowy.na_rachunek",
                "przelew_bankowy.kwota", "przelew_bankowy.data_operacji")
    if any(k not in rules for k in required):
        return True
    tytul = str(rules["przelew_bankowy.tytul"].value).strip()
    return bool(_TRUNC_END.search(tytul))


def _transfer_text_score(rules: dict[str, Candidate], md: str) -> tuple[int, int, int, int]:
    tytul = rules.get("przelew_bankowy.tytul")
    tval = collapse(str(tytul.value)) if tytul is not None else ""
    truncated = 1 if (not tval or _TRUNC_END.search(tval)) else 0
    return len(rules), -_transfer_garble_count(md), -truncated, len(tval)


def _path_order(dt: DocumentType) -> Any:
    order = {f.path: i for i, f in enumerate(dt.fields)}

    def key(p: str) -> tuple[int, str]:
        return order.get(generic(p), 10_000), p

    return key
