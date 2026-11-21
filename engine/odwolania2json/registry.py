"""Rejestry nazwanych wtyczek (normalizatory, walidatory).

Konfiguracja odwołuje się do wtyczek po nazwie. Nowa wtyczka to jedna funkcja
z dekoratorem, bez zmian w potoku.
"""

from collections.abc import Callable
from typing import Any


class Registry:
    def __init__(self, kind: str) -> None:
        self.kind = kind
        self._items: dict[str, Callable[..., Any]] = {}

    def register(self, name: str) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
        def deco(fn: Callable[..., Any]) -> Callable[..., Any]:
            if name in self._items:
                raise ValueError(f"{self.kind} '{name}' jest już zarejestrowany")
            self._items[name] = fn
            return fn

        return deco

    def get(self, name: str) -> Callable[..., Any]:
        try:
            return self._items[name]
        except KeyError:
            known = ", ".join(sorted(self._items))
            raise KeyError(f"Nieznany {self.kind} '{name}'. Dostępne: {known}") from None

    def names(self) -> list[str]:
        return sorted(self._items)

    def __contains__(self, name: str) -> bool:
        return name in self._items


normalizers = Registry("normalizator")
validators = Registry("walidator")
