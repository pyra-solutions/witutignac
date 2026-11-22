from odwolania2json.pipeline import resolve_workers


def test_liczba_procesow() -> None:
    assert resolve_workers(1, 10) == 1
    assert resolve_workers(3, 10) == 3
    assert resolve_workers(3, 2) == 2  # nie więcej procesów niż dokumentów
    assert resolve_workers(4, 0) == 1
