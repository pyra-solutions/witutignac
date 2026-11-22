"""Kolejność tekstu w nagłówkach z kolumną etykiet (skany).

Nagłówek odwołania często jest tabelą bez linii: w lewej kolumnie etykiety („Odwołujący:”,
„Zamawiający:”, „Dotyczy:”), w prawej ich wartości. Docling rozpoznaje to jako dwa bloki i na
skanach wypisuje najpierw wszystkie etykiety, potem wszystkie wartości. Reguły szukające tekstu
między „Odwołujący:” a „Zamawiający:” nie znajdują wtedy nic.

`reorder_label_columns` układa takie fragmenty na nowo z położenia elementów na stronie: każdą
wartość z prawej kolumny przypisuje do etykiety, w której pasie wysokości się zaczyna, i zmienia
kolejność elementów w drzewie dokumentu na „etykieta, jej wartości, następna etykieta, …”.
Tekst elementów zostaje bez zmian, zmienia się tylko ich kolejność.
"""

import re
from dataclasses import dataclass
from typing import Any

# Etykieta: krótki tekst zakończony dwukropkiem, bez wartości po nim („Nazwa firmy:”, „Dotyczy:”).
LABEL_RE = re.compile(r"^\W{0,3}[^\W\d_][^:\n]{0,38}:\s*$")
LABEL_MAX_WORDS = 4


@dataclass
class _Box:
    ref: Any  # RefItem z listy dzieci rodzica
    item: Any
    page: int
    l: float
    t: float
    r: float
    b: float
    label: bool


def _boxes(doc: Any, node: Any) -> tuple[int, float, float, float, float] | None:
    """Strona i ramka (początek układu w lewym górnym rogu) elementu albo grupy: suma ramek jej
    elementów z pierwszej strony, na której się pojawia."""
    rects = []
    stack = [node]
    while stack:
        n = stack.pop()
        for p in getattr(n, "prov", None) or []:
            h = doc.pages[p.page_no].size.height
            bb = p.bbox.to_top_left_origin(h)
            rects.append((p.page_no, bb.l, bb.t, bb.r, bb.b))
        stack.extend(c.resolve(doc) for c in getattr(n, "children", []) or [])
    if not rects:
        return None
    page = min(r[0] for r in rects)
    on = [r for r in rects if r[0] == page]
    return page, min(r[1] for r in on), min(r[2] for r in on), max(r[3] for r in on), max(r[4] for r in on)


def _is_label(item: Any) -> bool:
    text = (getattr(item, "text", None) or "").strip()
    return bool(LABEL_RE.match(text)) and len(text.split()) <= LABEL_MAX_WORDS


def _is_short_text(item: Any) -> bool:
    text = (getattr(item, "text", None) or "").strip()
    return 0 < len(text) <= 40 and len(text.split()) <= LABEL_MAX_WORDS


def _is_kv_key(item: Any) -> bool:
    """Krótki napis bez długich liczb/dat/kwot mogący być etykietą w układzie formularzowym bez dwukropka."""
    text = (getattr(item, "text", None) or "").strip()
    if not _is_short_text(item) or re.search(r"\d{4}", text) or text.startswith(("-", "•", "–")):
        return False
    return bool(re.search(r"[A-Za-ząćęłńóśźżĄĆĘŁŃÓŚŹŻ]{3}", text))


def _overlap(a: _Box, b: _Box) -> bool:
    """Czy elementy nachodzą na siebie w pionie."""
    return a.t < b.b and a.b > b.t


def _stacked(label: _Box, others: list[_Box]) -> bool:
    """Czy tuż pod etykietą (odstęp mniejszy niż jej wysokość) zaczyna się tekst, który nachodzi
    na nią w poziomie: wartość pod etykietą, czyli układ jednokolumnowy."""
    h = label.b - label.t
    return any(b.l < label.r and b.r > label.l and -0.25 * h <= b.t - label.b < h for b in others)


def _columns(labels: list[_Box]) -> list[list[_Box]]:
    """Etykiety z tej samej strony, które nachodzą na siebie w poziomie (jedna kolumna)."""
    cols: list[list[_Box]] = []
    for lb in sorted(labels, key=lambda x: (x.page, x.l)):
        for col in cols:
            if col[0].page == lb.page and lb.l < max(c.r for c in col) and lb.r > min(c.l for c in col):
                col.append(lb)
                break
        else:
            cols.append([lb])
    return [sorted(c, key=lambda x: x.t) for c in cols if len(c) >= 2]


def _reorder_children(doc: Any, parent: Any) -> list[str]:
    boxes: list[_Box] = []
    for ref in parent.children:
        item = ref.resolve(doc)
        geo = _boxes(doc, item)
        if geo is not None:
            boxes.append(_Box(ref, item, *geo, label=_is_label(item)))
    notes: list[str] = []
    used: set[str] = set()
    for col in _columns([b for b in boxes if b.label]):
        if any(c.ref.cref in used for c in col):
            continue
        page = col[0].page
        # Krótki tekst bez dwukropka w tej samej kolumnie, między pierwszą a ostatnią etykietą,
        # też jest etykietą (np. „Adres do doręczeń” w prawdziwym odwołaniu z szablonu organizatora).
        x0, x1 = min(c.l for c in col), max(c.r for c in col)
        col = sorted(col + [
            b for b in boxes
            if b.page == page and not b.label and b.ref.cref not in used and _is_short_text(b.item)
            and b.l < x1 and b.r > x0 and col[0].t < b.t < col[-1].t
        ], key=lambda x: x.t)
        _process_column(doc, parent, col, boxes, used, notes, require_colon=True)

    # Drugi przebieg dla formularzy bez dwukropków (np. potwierdzenia przelewów typu Bank Karpacki):
    # kolumna co najmniej 3 krótkich etykiet nieliczbowych po lewej, gdzie etykiety mają po prawej
    # wartości leżące na tej samej wysokości.
    kv_candidates = [
        b for b in boxes
        if b.ref.cref not in used and not b.label and _is_kv_key(b.item)
        and any(o.page == b.page and o.ref.cref != b.ref.cref and o.l > b.r and _overlap(b, o) for o in boxes)
    ]
    for col in _columns(kv_candidates):
        if len(col) < 3 or any(c.ref.cref in used for c in col):
            continue
        _process_column(doc, parent, col, boxes, used, notes, require_colon=False)
    return notes


def _process_column(doc: Any, parent: Any, col: list[_Box], boxes: list[_Box], used: set[str],
                    notes: list[str], require_colon: bool) -> None:
    page = col[0].page
    width = doc.pages[page].size.width
    col_r = max(c.r for c in col)
    tol_x = 0.01 * width
    col_ids = {c.ref.cref for c in col}
    rest = [b for b in boxes if b.page == page and b.ref.cref not in col_ids and b.ref.cref not in used]
    # Elementy, które zaczynają się w kolumnie etykiet albo na lewo od niej (akapit na całą szerokość,
    # „Wpis od odwołania”, „ODWOŁANIE”), przerywają kolumnę: etykiety po obu stronach takiego
    # elementu to osobne odcinki, a etykieta nigdy nie przeskakuje nad nim.
    breaks = sorted(b.t for b in rest if b.l < col_r - tol_x)
    segments: list[list[_Box]] = [[col[0]]]
    for prev, nxt in zip(col, col[1:]):
        if any(prev.t < t < nxt.t for t in breaks):
            segments.append([nxt])
        else:
            segments[-1].append(nxt)
    others = [b for b in boxes if b.page == page and not b.label and b.ref.cref not in col_ids]
    for seg in segments:
        # Układ jednokolumnowy: wartość stoi tuż pod etykietą („Odwołujący:” / „Jan Kowalski”).
        # Docling czyta go we właściwej kolejności, a elementy po prawej to wtedy co innego
        # (adres KIO, pieczęć). Takiego odcinka nie zmieniamy.
        if any(_stacked(c, others) for c in seg if (c.label if require_colon else True)):
            continue
        note = _reorder_segment(parent, seg, rest, breaks, col_r - tol_x, used, require_colon=require_colon)
        if note:
            notes.append(f"strona {page}: {note}")


def _reorder_segment(parent: Any, seg: list[_Box], rest: list[_Box], breaks: list[float], values_l: float,
                     used: set[str], require_colon: bool = True) -> str | None:
    """Jeden odcinek kolumny etykiet: przypisuje wartości z prawej i ustawia kolejność w `parent`."""
    if require_colon and sum(1 for c in seg if c.label) < 2:
        return None
    if not require_colon and len(seg) < 3:
        return None
    label_h = sorted(c.b - c.t for c in seg)[len(seg) // 2]
    # Wartość może zaczynać się trochę wyżej niż jej etykieta („Konsorcjum wykonawców:”).
    tol_up = 0.75 * label_h
    start = seg[0].t - tol_up
    # Blok wartości kończy się na pierwszym elemencie przerywającym kolumnę poniżej początku odcinka.
    stop = next((t for t in breaks if t > start), float("inf"))
    values = [b for b in rest if b.l >= values_l and b.t < stop and b.ref.cref not in used
              and (b.t >= start or any(_overlap(b, c) for c in seg))]
    assigned: dict[str, list[_Box]] = {c.ref.cref: [] for c in seg}
    for v in values:
        # Element na wysokości etykiety należy do niej, także gdy etykieta stoi w połowie
        # bloku danych (prawdziwe odwołanie: „Zamawiający:” na środku nazwy i adresu).
        # Pozostałe: do ostatniej etykiety, której górna krawędź jest nad górną krawędzią elementu.
        hit = [c for c in seg if _overlap(v, c)]
        owner = hit[0] if hit else [c for c in seg if c.t - tol_up <= v.t][-1]
        assigned[owner.ref.cref].append(v)
    if require_colon:
        # Co najmniej dwie etykiety z dwukropkiem muszą mieć wartości po prawej. Krótki tekst bez
        # dwukropka (np. wartość pod etykietą w układzie jednokolumnowym) sam nie uzasadnia zmiany.
        if sum(1 for c in seg if c.label and assigned[c.ref.cref]) < 2:
            return None
    else:
        if sum(1 for c in seg if any(_overlap(v, c) for v in assigned[c.ref.cref])) < 3:
            return None
    # Wartości każdej etykiety zostają w kolejności Doclinga (z góry na dół w swojej kolumnie).
    expected = [x.ref.cref for c in seg for x in [c, *assigned[c.ref.cref]]]
    block = set(expected)
    used.update(block)
    # Wartości już stoją po swoich etykietach: nic do zmiany.
    if [ref.cref for ref in parent.children if ref.cref in block] == expected:
        return None
    pos = min(i for i, ref in enumerate(parent.children) if ref.cref in block)
    by_cref = {ref.cref: ref for ref in parent.children}
    kept = [ref for ref in parent.children if ref.cref not in block]
    parent.children = kept[:pos] + [by_cref[c] for c in expected] + kept[pos:]
    names = ", ".join((c.item.text or "").strip() for c in seg)
    return f"kolumna etykiet {names} ({len(values)} wartości)"


def reorder_label_columns(doc: Any) -> list[str]:
    """Poprawia kolejność par etykieta–wartość w całym dokumencie; zwraca opis zmian."""
    notes: list[str] = []
    stack = [doc.body]
    while stack:
        node = stack.pop()
        children = getattr(node, "children", None) or []
        if len(children) >= 3:
            notes.extend(_reorder_children(doc, node))
        stack.extend(c.resolve(doc) for c in children)
    return notes
