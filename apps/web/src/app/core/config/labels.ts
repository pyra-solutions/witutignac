/**
 * Etykiety pól i sekcji na ekranach. Konfiguracja silnika ma tylko ścieżki pól, więc znane ścieżki
 * mają tu polskie nazwy, a pola nowych typów dokumentów dostają nazwę z ostatniego członu ścieżki
 * (np. `numer_umowy` → „Numer umowy”). Nowy typ dokumentu nie wymaga więc zmian w GUI.
 */

const PATH_LABELS: Record<string, string> = {
  'OdwolanieKIO.data': 'Data pisma',
  'OdwolanieKIO.miejscowosc': 'Miejscowość',
  'OdwolanieKIO.czynnosc_dzien': 'Data zaskarżonej czynności',
  'OdwolanieKIO.czynnosc_powod_id': 'Powód odwołania',
  'OdwolanieKIO.czynnosc_opis': 'Opis czynności',
  'Odwolujacy[].przez-pelnomocnika': 'Działa przez pełnomocnika',
  'Odwolujacy[].pelnomocnik.imie_nazwisko': 'Pełnomocnik: imię i nazwisko',
  'Odwolujacy[].pelnomocnik.nazwa': 'Pełnomocnik: kancelaria',
  'Odwolujacy[].pelnomocnik.mail': 'Pełnomocnik: e-mail',
  'Zamawiajacy[].prowadzacy_postepowanie': 'Prowadzi postępowanie',
  'ZamowieniePubliczne.tytul': 'Tytuł zamówienia',
  'ZamowieniePubliczne.numer_postepowania': 'Numer postępowania',
  'ZamowieniePubliczne.numer_bzp': 'Numer ogłoszenia BZP',
  'ZamowieniePubliczne.numer_ted': 'Numer ogłoszenia TED',
  'mocodawca[].data.typ': 'Typ mocodawcy',
  'mocodawca[].data.imie_nazwisko': 'Imię i nazwisko (osoba fizyczna)',
  'mocodawca[].podpisujacy[].imie_nazwisko': 'Podpisujący',
  'przelew_bankowy.data_operacji': 'Data operacji',
  'przelew_bankowy.z_rachunku': 'Z rachunku',
  'przelew_bankowy.na_rachunek': 'Na rachunek',
  'przelew_bankowy.numer_transakcji': 'Numer transakcji',
  'przelew_bankowy.tytul': 'Tytuł przelewu',
};

/** Ostatni człon ścieżki: nazwy używane w wielu typach dokumentów. */
const KEY_LABELS: Record<string, string> = {
  nazwa: 'Nazwa',
  nip: 'NIP',
  krs: 'KRS',
  regon: 'REGON',
  pesel: 'PESEL',
  imie_nazwisko: 'Imię i nazwisko',
  mail: 'E-mail',
  email: 'E-mail',
  kwota: 'Kwota',
  data: 'Data',
  tytul: 'Tytuł',
  miejscowosc: 'Miejscowość',
};

const SECTION_LABELS: Record<string, string> = {
  OdwolanieKIO: 'Odwołanie',
  Odwolujacy: 'Odwołujący',
  Zamawiajacy: 'Zamawiający',
  ZamowieniePubliczne: 'Zamówienie publiczne',
  mocodawca: 'Mocodawca',
  podpisujacy: 'Podpisujący',
  pelnomocnicy: 'Pełnomocnik',
  przelew_bankowy: 'Przelew',
};

const GROUP_LABELS: Record<string, string> = {
  odwolanie: 'Odwołanie',
  pelnomocnictwo: 'Pełnomocnictwo',
  przelew: 'Przelew',
};

const ACRONYMS = new Set(['nip', 'krs', 'regon', 'pesel', 'bzp', 'ted', 'kio', 'swz', 'opz', 'iban', 'id']);

/** `numer_umowy` → „Numer umowy”, `przez-pelnomocnika` → „Przez pelnomocnika”, `NazwaFirmy` → „Nazwa firmy”. */
export function humanize(name: string): string {
  const words = name
    .replace(/([a-ząćęłńóśźż])([A-ZĄĆĘŁŃÓŚŹŻ])/g, '$1 $2')
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .map((w) => (ACRONYMS.has(w.toLowerCase()) ? w.toUpperCase() : w.toLowerCase()));
  if (!words.length) return name;
  const [first, ...rest] = words;
  return [first.charAt(0).toUpperCase() + first.slice(1), ...rest].join(' ');
}

export function fieldLabel(path: string): string {
  if (PATH_LABELS[path]) return PATH_LABELS[path];
  const last = path.split('.').pop()?.replace(/\[\]$/, '') ?? path;
  return KEY_LABELS[last] ?? humanize(last);
}

export function sectionLabel(name: string): string {
  return SECTION_LABELS[name] ?? humanize(name);
}

export function groupLabel(name: string): string {
  return GROUP_LABELS[name] ?? humanize(name);
}
