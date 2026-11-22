"""Diagnostyka środowiska: `odwolania2json doctor` (na Windows `diagnoza.bat`).

Sprawdza po kolei: Pythona i zależności, konfigurację, plik `.env` i klucz API, połączenie z API LLM,
dane wejściowe, zapis wyników i konwersję jednego PDF-a przez Docling. Jeden nieudany test nie przerywa
pozostałych. Wartość klucza nigdy nie jest wypisywana: raport podaje tylko jej źródło, długość, rodzaje
znaków i odcisk SHA-256 (8 znaków), po którym można porównać klucze na dwóch komputerach.
Raport trafia też do pliku, żeby można go było przesłać.
"""

import hashlib
import os
import platform
import re
import sys
import tempfile
import time
from datetime import datetime
from pathlib import Path

OK, WARN, ERR, INFO = "OK", "UWAGA", "BŁĄD", "INFO"

# Pomoc dla najczęstszych problemów na Windows
VC_REDIST = ("Zainstaluj Microsoft Visual C++ Redistributable (x64): "
             "https://aka.ms/vs/17/release/vc_redist.x64.exe, potem uruchom ponownie.")
REMOVE_SYSTEM_VAR = ("Usuń ją: Start -> „Edytuj zmienne środowiskowe dla konta” -> usuń {var}, "
                     "potem otwórz nowe okno terminala. Tylko w bieżącym oknie cmd: set {var}=")


class Report:
    def __init__(self) -> None:
        self.lines: list[str] = []
        self.counts = {OK: 0, WARN: 0, ERR: 0}

    def section(self, title: str) -> None:
        self._out(f"\n== {title} ==")

    def add(self, status: str, msg: str, hint: str = "") -> None:
        if status in self.counts:
            self.counts[status] += 1
        self._out(f"[{status:<5}] {msg}")
        if hint:
            self._out(f"        -> {hint}")

    def _out(self, line: str) -> None:
        self.lines.append(line)
        print(line, flush=True)


def fingerprint(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()[:8]


def describe_key(value: str) -> str:
    """Opis klucza bez jego wartości."""
    special = sorted({c for c in value if not c.isalnum()})
    return f"długość {len(value)}, znaki inne niż litery i cyfry: {ascii(special)}, odcisk {fingerprint(value)}"


def key_problems(raw: str) -> list[tuple[str, str]]:
    """Problemy z wartością klucza zapisaną w .env (wartość po znaku '=', przed obróbką)."""
    out: list[tuple[str, str]] = []
    v = raw.strip()
    if v != raw:
        out.append((INFO, "spacje wokół klucza są obcinane, nie przeszkadzają"))
    if v and v[0] in "\"'":
        out.append((INFO, "cudzysłowy wokół klucza są usuwane, nie przeszkadzają"))
    v = v.strip('"').strip("'")
    if not v:
        out.append((ERR, "klucz jest pusty"))
        return out
    if re.search(r"\s", v):
        out.append((ERR, "w środku klucza jest spacja albo tabulator: dopisany komentarz albo sklejone dwa teksty"))
    bad = sorted({c for c in v if ord(c) > 126 or ord(c) < 32})
    if bad:
        out.append((ERR, f"klucz zawiera niewidoczne albo nietypowe znaki {ascii(bad)}: wklej go ponownie "
                         "z oryginalnego źródła (komunikatory potrafią dodać takie znaki)"))
    if "klucz" in v.lower() or v in ("...", "xxx", "TODO"):
        out.append((ERR, "to wygląda na tekst przykładowy, a nie prawdziwy klucz"))
    return out


# --- poszczególne testy --------------------------------------------------------

def check_python(rep: Report) -> None:
    rep.section("Python")
    v = sys.version_info
    status = OK if v >= (3, 13) else ERR
    rep.add(status, f"Python {platform.python_version()} ({sys.executable})",
            "" if status == OK else "Wymagany Python 3.13 lub nowszy.")
    rep.add(INFO, f"System: {platform.platform()}")
    if sys.prefix == sys.base_prefix:
        rep.add(WARN, "Python nie działa w środowisku engine/.venv",
                "Uruchamiaj przez diagnoza.bat / start.bat, które używają engine/.venv.")


def check_packages(rep: Report) -> None:
    from importlib.metadata import PackageNotFoundError, version

    rep.section("Zależności")
    missing = []
    for pkg in ("docling", "torch", "rapidocr", "onnxruntime", "httpx", "pydantic", "PyYAML"):
        try:
            rep.add(OK, f"{pkg} {version(pkg)}")
        except PackageNotFoundError:
            missing.append(pkg)
            rep.add(ERR, f"brak pakietu {pkg}")
    if missing:
        rep.add(INFO, "Niepełna instalacja.",
                "Usuń katalog engine\\.venv i uruchom start.bat ponownie (potrzebny internet).")
    # Biblioteki natywne: na Windows bez Visual C++ Redistributable import kończy się błędem DLL
    for mod in ("torch", "onnxruntime"):
        if mod in missing:
            continue
        try:
            __import__(mod)
            rep.add(OK, f"import {mod}")
        except OSError as e:
            rep.add(ERR, f"import {mod}: {type(e).__name__}: {e}", VC_REDIST)
        except Exception as e:  # noqa: BLE001
            rep.add(ERR, f"import {mod}: {type(e).__name__}: {e}")


def check_config(rep: Report):  # noqa: ANN201
    from odwolania2json.cli import _check, _load

    rep.section("Konfiguracja")
    try:
        release, path = _load(None)
        _check(release)
    except SystemExit as e:
        rep.add(ERR, f"konfiguracja niepoprawna: {e}")
        return None
    except Exception as e:  # noqa: BLE001
        rep.add(ERR, f"nie da się wczytać konfiguracji: {type(e).__name__}: {e}")
        return None
    prof = release.llm_profile(None)
    rep.add(OK, f"wydanie {release.version} ({path})")
    rep.add(INFO, f"profil LLM: {prof.id}, model {prof.model}, klucz w zmiennej {prof.api_key_env}")
    return release


def check_key(rep: Report, release, repo_dir: Path) -> None:  # noqa: ANN001
    from odwolania2json import llm

    rep.section("Plik .env i klucz API")
    var = release.llm_profile(None).api_key_env if release else "EDEN_AI_API_KEY"
    env_path = repo_dir / ".env"
    file_value: str | None = None

    if not env_path.is_file():
        txt = repo_dir / ".env.txt"
        if txt.is_file():
            rep.add(ERR, f"jest plik .env.txt zamiast .env ({txt})",
                    "Notatnik dopisał .txt. Zmień nazwę w cmd: ren .env.txt .env")
        else:
            rep.add(WARN, f"brak pliku {env_path}", "W cmd: copy .env.example .env, potem notepad .env i wpisz klucz.")
    else:
        text, enc = llm.read_env_text(env_path)
        rep.add(OK, f"plik {env_path}, kodowanie {enc}")
        found = []
        for no, line in enumerate(text.splitlines(), 1):
            s = line.strip()
            if not s or s.startswith("#"):
                continue
            if "=" not in s:
                rep.add(WARN, f"linia {no} nie ma znaku '=' i jest pomijana",
                        "Może to dalsza część klucza złamanego na dwie linie.")
                continue
            if s.partition("=")[0].strip().removeprefix("export ").strip() == var:
                found.append((no, line.partition("=")[2]))
        if not found:
            rep.add(ERR, f"w pliku nie ma linii {var}=...", f"Dopisz linię: {var}=twój_klucz")
        else:
            if len(found) > 1:
                rep.add(WARN, f"{var} występuje {len(found)} razy (linie {', '.join(str(n) for n, _ in found)}); "
                              "liczy się pierwsza", "Zostaw jedną linię.")
            no, raw = found[0]
            file_value = raw.strip().strip('"').strip("'")
            problems = key_problems(raw)
            worst = ERR if any(p[0] == ERR for p in problems) else OK
            rep.add(worst, f"{var} w .env (linia {no}): {describe_key(file_value)}")
            for status, msg in problems:
                rep.add(status, msg)

    # Zmienna ustawiona w systemie ma pierwszeństwo przed .env (load_dotenv jej nie nadpisuje).
    system_value = os.environ.get(var) if var not in llm.DOTENV_KEYS else None
    if system_value is not None:
        same = file_value is not None and system_value.strip() == file_value
        if file_value is None:
            rep.add(INFO, f"{var} ustawiona w systemie: {describe_key(system_value.strip())}")
        elif same:
            rep.add(OK, f"{var} jest też ustawiona w systemie, z tą samą wartością co w .env")
        else:
            rep.add(ERR, f"{var} jest ustawiona w systemie i NADPISUJE plik .env: "
                         f"{describe_key(system_value.strip())}", REMOVE_SYSTEM_VAR.format(var=var))
    for other in ("LLM_API_KEY", "LLM_BASE_URL", "LLM_MODEL"):
        if other in os.environ and other not in llm.DOTENV_KEYS:
            rep.add(WARN, f"w systemie jest ustawiona zmienna {other}, która zmienia ustawienia profilu LLM",
                    REMOVE_SYSTEM_VAR.format(var=other))

    if release is not None:
        c = llm.LlmClient(release.llm_profile(None), None)
        if c.enabled:
            rep.add(INFO, f"program użyje klucza {c.key_source()}, odcisk {fingerprint(c._key)}",
                    "Porównaj odcisk z wynikiem diagnozy na komputerze, na którym klucz działa.")
        else:
            rep.add(ERR, "program nie ma klucza: LLM będzie wyłączony, wyniki tylko z reguł")


def check_api(rep: Report, release) -> None:  # noqa: ANN001
    import httpx

    from odwolania2json import llm

    rep.section("Połączenie z API modelu językowego")
    if release is None:
        rep.add(WARN, "pominięte: brak konfiguracji")
        return
    prof = release.llm_profile(None)
    c = llm.LlmClient(prof, None)
    if not c.enabled:
        rep.add(WARN, "pominięte: brak klucza")
        return
    for pv in ("HTTPS_PROXY", "HTTP_PROXY", "ALL_PROXY", "https_proxy", "http_proxy"):
        if os.environ.get(pv):
            rep.add(INFO, f"ustawiony serwer proxy w zmiennej {pv}")
    body = {"model": c.model, "messages": [{"role": "user", "content": "Odpowiedz jednym słowem: OK"}],
            "max_tokens": 16, "temperature": 0}
    headers = {**prof.extra_headers, "Authorization": f"Bearer {c._key}", "Content-Type": "application/json"}
    t0 = time.perf_counter()
    try:
        r = httpx.post(f"{c.base_url}/chat/completions", json=body, headers=headers, timeout=60)
    except httpx.HTTPError as e:
        msg = f"{type(e).__name__}: {e}".replace(c._key, "***")
        hint = "Sprawdź internet, firewall i proxy."
        if "CERTIFICATE_VERIFY_FAILED" in msg or "SSL" in msg:
            hint = "Antywirus albo sieć firmowa podmienia certyfikaty HTTPS. Spróbuj z innej sieci (np. hotspot z telefonu)."
        rep.add(ERR, f"brak połączenia z {c.base_url}: {msg}", hint)
        return
    dt = time.perf_counter() - t0
    text = r.text[:300].replace(c._key, "***")
    if r.status_code == 200:
        data = r.json()
        region = (data.get("edenai_metadata") or {}).get("region")
        extra = ", ".join(x for x in (f"dostawca {data.get('provider')}" if data.get("provider") else "",
                                      f"region {region}" if region else "") if x)
        rep.add(OK, f"API odpowiada: model {c.model}, {dt:.1f} s" + (f", {extra}" if extra else ""))
    elif r.status_code in (401, 403):
        rep.add(ERR, f"API odrzuciło klucz: HTTP {r.status_code} {text}",
                "Klucz jest zły. Porównaj odcisk klucza z komputerem, na którym działa, albo skopiuj cały plik .env.")
    elif r.status_code == 402:
        rep.add(ERR, f"HTTP 402 {text}", "Brak środków na koncie dostawcy API.")
    else:
        rep.add(ERR, f"HTTP {r.status_code} {text}")


def data_dir_for(repo_dir: Path) -> Path:
    """Katalog z input/, output/ i .env: bieżący, jeśli ma input/ i output/ (serwer oceny: /opt/solution,
    kod w podkatalogu), inaczej katalog projektu. Tak samo szukają ich run.sh i silnik (.env z katalogu bieżącego)."""
    cwd = Path.cwd()
    return cwd if (cwd / "input").is_dir() and (cwd / "output").is_dir() else repo_dir


def check_data(rep: Report, repo_dir: Path, data_dir: Path) -> None:
    rep.section("Dane wejściowe")
    for d, empty, hint in (
        (repo_dir / "hacknation-2026" / "dane", WARN,
         "Brak danych organizatora: w katalogu projektu wpisz git submodule update --init "
         "(repozytorium pobrane jako ZIP nie zawiera submodułu, trzeba użyć git clone)."),
        (data_dir / "input", INFO, "Domyślny katalog wejściowy jest pusty; dane organizatora: "
                                   "start.bat --input hacknation-2026\\dane"),
    ):
        n = sum(1 for p in d.rglob("*") if p.is_file() and p.suffix.lower() == ".pdf") if d.is_dir() else 0
        rep.add(OK if n else empty, f"{d}: {n} plików PDF", "" if n else hint)


def check_write(rep: Report, data_dir: Path) -> None:
    from odwolania2json.cli import _cache_dir

    rep.section("Zapis wyników i cache")
    for d in (data_dir / "output", _cache_dir(None)):
        if d is None:
            rep.add(INFO, "cache wyłączony (O2J_CACHE_DIR=none)")
            continue
        try:
            d.mkdir(parents=True, exist_ok=True)
            with tempfile.NamedTemporaryFile(dir=d, prefix=".o2j-test-"):
                pass
            rep.add(OK, f"zapis do {d}")
        except OSError as e:
            rep.add(ERR, f"nie da się zapisać w {d}: {e}",
                    "Przenieś projekt do zwykłego katalogu użytkownika, np. C:\\Users\\<nazwa>\\witutignac.")


def check_conversion(rep: Report, release, repo_dir: Path, data_dir: Path) -> None:  # noqa: ANN001
    from odwolania2json.pipeline import Engine

    rep.section("Konwersja PDF (Docling)")
    if release is None:
        rep.add(WARN, "pominięte: brak konfiguracji")
        return
    sample = repo_dir / "hacknation-2026" / "szablon-aplikacja" / "input" / "case1" / "przyklad odwolanie.pdf"
    if not sample.is_file():
        sample = next((p for d in (data_dir / "input", repo_dir / "hacknation-2026" / "dane") if d.is_dir()
                       for p in sorted(d.rglob("*.pdf"))), None)
    if sample is None:
        rep.add(WARN, "pominięte: nie ma żadnego PDF-a do próby")
        return
    rep.add(INFO, f"próbna konwersja {sample.name} bez cache; pierwsze uruchomienie pobiera modele "
                  "Docling (ok. 0,5 GB), więc może potrwać kilka minut")
    t0 = time.perf_counter()
    try:
        prep = Engine(release, cache_dir=None, use_llm=False).prepare(sample, Path(sample.name))
    except Exception as e:  # noqa: BLE001
        rep.add(ERR, f"{type(e).__name__}: {e}", VC_REDIST if isinstance(e, OSError) else "")
        return
    if prep.errors or prep.conv is None:
        err = "; ".join(prep.errors)
        hint = VC_REDIST if "DLL" in err or "WinError" in err else (
            "Pobieranie modeli wymaga internetu." if "huggingface" in err.lower() or "connect" in err.lower() else "")
        rep.add(ERR, f"konwersja nieudana: {err}", hint)
        return
    rep.add(OK, f"{prep.conv.pages} stron w {time.perf_counter() - t0:.0f} s, "
                f"rozpoznany typ: {prep.doc_type.code if prep.doc_type else 'nieobsługiwany'}")


# --- całość -------------------------------------------------------------------

def run(repo_dir: Path, report_path: Path, *, api: bool = True, convert: bool = True) -> int:
    rep = Report()
    data_dir = data_dir_for(repo_dir)
    where = f"katalog {repo_dir}" + ("" if data_dir == repo_dir else f", dane i .env w {data_dir}")
    rep._out(f"Diagnoza Odwołania2json, {datetime.now():%Y-%m-%d %H:%M}, {where}")
    release = None

    def load_config() -> None:
        nonlocal release
        release = check_config(rep)

    checks = [lambda: check_python(rep), lambda: check_packages(rep), load_config,
              lambda: check_key(rep, release, data_dir)]
    checks.append((lambda: check_api(rep, release)) if api
                  else (lambda: rep.add(INFO, "test API pominięty (--no-api)")))
    checks += [lambda: check_data(rep, repo_dir, data_dir), lambda: check_write(rep, data_dir)]
    checks.append((lambda: check_conversion(rep, release, repo_dir, data_dir)) if convert
                  else (lambda: rep.add(INFO, "test konwersji pominięty (--no-convert)")))
    for check in checks:
        try:
            check()
        except Exception as e:  # noqa: BLE001 — jeden test nie przerywa pozostałych
            rep.add(ERR, f"test przerwany: {type(e).__name__}: {e}")

    c = rep.counts
    rep.section("Podsumowanie")
    rep._out(f"OK: {c[OK]}, uwagi: {c[WARN]}, błędy: {c[ERR]}")
    try:
        report_path.write_text("\n".join(rep.lines) + "\n", encoding="utf-8")
        rep._out(f"Raport (bez wartości klucza) zapisany do {report_path}. Możesz go przesłać.")
    except OSError as e:
        rep._out(f"Nie udało się zapisać raportu do {report_path}: {e}")
    return 1 if c[ERR] else 0
