"""Buduje engine/odwolania2json/data/pl_diacritics.txt.gz ze słownika SJP (hunspell-pl).

Plik zawiera każdą formę wyrazu z polskimi znakami, której wersja bez znaków:
- nie jest poprawnym słowem (np. pomija „sąd”, bo „sad” też jest słowem),
- odpowiada dokładnie jednej formie ze znakami (pomija „złe”/„źle” dla „zle”),
- ma co najmniej 4 litery.
Formy, których wersja bez znaków jest pospolitym słowem angielskim, mają znacznik „*” („*legał”).
Pozostałe formy z polskimi znakami (co najmniej 4 litery) nie są celem poprawki ze słownika, ale mogą potwierdzić
pisownię znalezioną w tym samym dokumencie:
- „+” („+leśna”): wersja bez znaków nie jest poprawnym słowem, więc można ją poprawić zawsze,
- „^” („^łukasz”): nazwa własna (w SJP tylko wielką literą), a wersja bez znaków jest poprawnym słowem
  („lukasz” od „lukać”), więc poprawka tylko dla słowa pisanego wielką literą.
Formy pospolite, których wersja bez znaków też jest słowem („mają”/„maja”, „sąd”/„sad”), są pominięte.

Odtworzenie na Ubuntu/Debianie (bez instalacji pakietów):
    apt-get download hunspell-pl hunspell-tools wamerican wbritish
    for d in *.deb; do dpkg -x "$d" root; done
    LD_LIBRARY_PATH=root/usr/lib/x86_64-linux-gnu root/usr/bin/unmunch \\
        root/usr/share/hunspell/pl_PL.dic root/usr/share/hunspell/pl_PL.aff > formy.txt
    python engine/tools/build_pl_diacritics.py formy.txt \\
        --english root/usr/share/dict/american-english root/usr/share/dict/british-english
"""

import argparse
import gzip
from collections import defaultdict
from pathlib import Path

FOLD = str.maketrans("ąćęłńóśźżĄĆĘŁŃÓŚŹŻ", "acelnoszzACELNOSZZ")
OUT = Path(__file__).resolve().parents[1] / "odwolania2json" / "data" / "pl_diacritics.txt.gz"


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("forms", help="wynik unmunch dla pl_PL (kodowanie ISO-8859-2)")
    ap.add_argument("--english", nargs="*", default=[], help="listy słów angielskich (jedno słowo w linii)")
    ap.add_argument("--out", default=str(OUT))
    a = ap.parse_args()

    forms: set[str] = set()
    lower: set[str] = set()  # formy występujące w SJP małymi literami (nie tylko jako nazwa własna)
    with open(a.forms, encoding="iso-8859-2") as f:
        for line in f:
            w = line.strip().split("/")[0]
            if w.isalpha():
                forms.add(w.lower())
                if w.islower():
                    lower.add(w)

    groups: dict[str, set[str]] = defaultdict(set)
    for w in forms:
        k = w.translate(FOLD)
        if k != w:
            groups[k].add(w)

    english: set[str] = set()
    for p in a.english:
        with open(p, encoding="utf-8", errors="ignore") as f:
            english |= {w for w in (x.strip() for x in f) if w.isalpha() and w.islower()}

    out = []
    for k, ws in groups.items():
        if len(k) < 4:
            continue
        if len(ws) == 1 and k not in forms:
            w = next(iter(ws))
            out.append(("*" if k in english else "") + w)
        elif k not in forms:
            out.extend("+" + w for w in ws)
        else:
            out.extend("^" + w for w in ws if w not in lower)
    out.sort(key=lambda s: s.lstrip("*+^"))

    with open(a.out, "wb") as raw, gzip.GzipFile(fileobj=raw, mode="wb", compresslevel=9, mtime=0) as g:
        g.write(("\n".join(out) + "\n").encode("utf-8"))
    print(f"form: {len(forms)}, w pliku: {len(out)} (angielskich: {sum(s.startswith('*') for s in out)}, z dokumentu: {sum(s[0] in '+^' for s in out)}) -> {a.out}")


if __name__ == "__main__":
    main()
