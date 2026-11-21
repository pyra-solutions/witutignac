"""Drzewo schematu z definicji pól: składanie wyniku JSON, schemat JSON dla LLM, spłaszczanie.

Ścieżki pól są ogólne ("Odwolujacy[].nip"), wartości mają ścieżki z indeksami
("Odwolujacy[0].nip"). Kolejność kluczy w wyniku = kolejność pól w konfiguracji.
"""

import re
from dataclasses import dataclass, field
from typing import Any

from odwolania2json.config import FieldDef, ListDef

_IDX = re.compile(r"\[\d+\]")


def generic(path: str) -> str:
    return _IDX.sub("[]", path)


@dataclass
class Node:
    kind: str  # "object" | "list" | "leaf"
    children: dict[str, "Node"] = field(default_factory=dict)
    item: "Node | None" = None
    field: FieldDef | None = None


def build_tree(fields: list[FieldDef]) -> Node:
    root = Node("object")
    for f in fields:
        segs = f.path.split(".")
        node = root
        for i, seg in enumerate(segs):
            is_list = seg.endswith("[]")
            key = seg[:-2] if is_list else seg
            last = i == len(segs) - 1
            if last and not is_list:
                if key in node.children:
                    raise ValueError(f"pole '{f.path}' zdefiniowane dwa razy")
                node.children[key] = Node("leaf", field=f)
                break
            child = node.children.get(key)
            if child is None:
                child = Node("list", item=Node("object")) if is_list else Node("object")
                node.children[key] = child
            if (child.kind == "list") != is_list:
                raise ValueError(f"niespójna ścieżka '{f.path}' przy '{seg}'")
            node = child.item if child.kind == "list" else child
            assert node is not None
    return root


def _join(prefix: str, key: str) -> str:
    return f"{prefix}.{key}" if prefix else key


def _max_index(values: dict[str, Any], list_prefix: str) -> int:
    rx = re.compile(re.escape(list_prefix) + r"\[(\d+)\]")
    best = -1
    for k, v in values.items():
        if v is None:
            continue
        m = rx.match(k)
        if m:
            best = max(best, int(m.group(1)))
    return best


def assemble(root: Node, values: dict[str, Any], lists: list[ListDef]) -> dict[str, Any]:
    min_items = {ld.path: ld.min_items for ld in lists}

    def build(node: Node, prefix: str) -> Any:
        if node.kind == "leaf":
            return values.get(prefix)
        if node.kind == "object":
            return {k: build(c, _join(prefix, k)) for k, c in node.children.items()}
        n = _max_index(values, prefix) + 1
        n = max(n, min_items.get(generic(prefix), 1))
        assert node.item is not None
        return [build(node.item, f"{prefix}[{i}]") for i in range(n)]

    out = build(root, "")
    assert isinstance(out, dict)
    return out


def flatten(root: Node, obj: Any, prefix: str = "") -> dict[str, Any]:
    """Odwrotność assemble: obiekt (np. odpowiedź LLM) -> {ścieżka z indeksami: wartość}."""
    out: dict[str, Any] = {}
    if root.kind == "leaf":
        out[prefix] = obj
    elif root.kind == "object":
        if isinstance(obj, dict):
            for k, c in root.children.items():
                if k in obj:
                    out.update(flatten(c, obj[k], _join(prefix, k)))
    elif isinstance(obj, list):
        assert root.item is not None
        for i, it in enumerate(obj):
            out.update(flatten(root.item, it, f"{prefix}[{i}]"))
    return out


_JSON_TYPES = {"string": "string", "date": "string", "integer": "integer", "number": "number"}


def json_schema(root: Node, lists: list[ListDef], prefix: str = "") -> dict[str, Any]:
    """Schemat JSON (podzbiór zgodny z trybem strict) dla wymuszonej odpowiedzi LLM."""
    list_doc = {ld.path: ld.instruction for ld in lists}
    if root.kind == "leaf":
        f = root.field
        assert f is not None
        t = _JSON_TYPES[f.type]
        s: dict[str, Any] = {"type": [t, "null"]}
        desc = f.instruction
        if f.type == "date":
            desc = (desc + " " if desc else "") + "Format YYYY-MM-DD."
        if f.enum is not None:
            s["enum"] = [*f.enum, None]
        if desc:
            s["description"] = desc
        return s
    if root.kind == "object":
        props = {k: json_schema(c, lists, _join(prefix, k)) for k, c in root.children.items()}
        return {"type": "object", "properties": props, "required": list(props), "additionalProperties": False}
    assert root.item is not None
    s = {"type": "array", "items": json_schema(root.item, lists, f"{prefix}[]")}
    if list_doc.get(generic(prefix)):
        s["description"] = list_doc[generic(prefix)]
    return s
