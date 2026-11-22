import { DocumentTypeDto, FieldDefDto, TraceDto } from '../api/api.models';
import { fieldLabel, humanize } from '../config/labels';
import { mapDocumentType } from '../config/map-release';
import { DocumentTypeDefinition } from '../models/config.model';
import { candidatesFor, flattenResult, parseInput, setValueAtKey } from './flatten';

function fd(path: string, extra: Partial<FieldDefDto> = {}): FieldDefDto {
  return {
    path,
    type: 'string',
    instruction: '',
    group: 'g',
    rules: [],
    strategy: 'llm_first',
    normalizers: [],
    validators: [],
    derive: null,
    enum: null,
    dictionary: null,
    grounding: 'required',
    default: null,
    ...extra,
  };
}

const derive = (kind: 'present' | 'dictionary_lookup', ifTrue: unknown = 1, ifFalse: unknown = 0) => ({
  kind,
  source: 'x',
  dictionary: kind === 'dictionary_lookup' ? 'powody' : null,
  if_true: ifTrue,
  if_false: ifFalse,
  cases: [],
  constant: null,
});

const POA_TYPE: DocumentTypeDto = {
  code: 'pelnomocnictwo',
  name: 'Pełnomocnictwo',
  classification: { patterns: [{ pattern: 'PEŁNOMOCNICTWO', weight: 2, first_chars: 3000 }], min_score: 3, description: '' },
  conversion_profile: 'default',
  sections: [],
  lists: [],
  groups: [{ name: 'pelnomocnictwo', instruction: '', sections: [], max_chars: 24000, llm_profile: null }],
  fields: [
    fd('mocodawca[].data.nazwa'),
    fd('mocodawca[].data.nip', {
      strategy: 'rules_first',
      normalizers: [{ name: 'digits_only', args: {}, severity: 'warning' }],
      validators: [{ name: 'nip', args: {}, severity: 'warning' }],
    }),
    fd('mocodawca[].data.typ', { derive: derive('present', 'osoba_fizyczna', 'osoba_prawna') }),
    fd('mocodawca[].podpisujacy[].imie_nazwisko'),
    fd('pelnomocnicy[].imie_nazwisko'),
  ],
};

const OTHER_TYPE: DocumentTypeDto = {
  ...POA_TYPE,
  code: 'inne',
  fields: [
    fd('OdwolanieKIO.czynnosc_dzien', { type: 'date' }),
    fd('OdwolanieKIO.czynnosc_opis', { derive: derive('dictionary_lookup') }),
    fd('Odwolujacy[].przez-pelnomocnika', { derive: derive('present') }),
    fd('ZamowieniePubliczne.numer_ted', { normalizers: [{ name: 'ted_number', args: {}, severity: 'warning' }] }),
    fd('przelew_bankowy.kwota', { type: 'number' }),
    fd('Zamawiajacy[].prowadzacy_postepowanie', { type: 'integer', enum: [0, 1] }),
    fd('OdwolanieKIO.czynnosc_powod_id', { type: 'integer', enum: [1, 2, 3], dictionary: 'powody' }),
    fd('Umowa.numer_umowy'),
  ],
};

const poa: DocumentTypeDefinition = mapDocumentType(POA_TYPE, 'default');
const other: DocumentTypeDefinition = mapDocumentType(OTHER_TYPE, 'default');

// Fragment wzorca dane/przyklad_01/pelnomocnictwo.json (dwóch pełnomocników).
const POA = {
  mocodawca: [
    {
      data: { imie_nazwisko: null, krs: '9999405188', nazwa: 'Belmoria Rozwiązania S.A.', nip: '9999284065', typ: 'osoba_prawna' },
      podpisujacy: [{ imie_nazwisko: 'Oliwia Kaczmarek' }],
    },
  ],
  pelnomocnicy: [
    { imie_nazwisko: 'Aleksandra Marciniak', pesel: null },
    { imie_nazwisko: 'Jolanta Zajkowski', pesel: null },
  ],
};

const TRACE: TraceDto = {
  file: 'sprawa/pelnomocnictwo.pdf',
  release: 'test',
  doc_type: 'pelnomocnictwo',
  classification_scores: { pelnomocnictwo: 5 },
  errors: [],
  llm: [],
  fields: {
    'mocodawca[0].data.nip': {
      source: 'rules',
      raw: '999-928-40-65',
      rule_value: '999-928-40-65',
      llm_value: '9999284064',
      quote: 'NIP 999-928-40-65',
      page: 1,
      warnings: ['nip: niepoprawna suma kontrolna NIP', 'wartość z LLM nie występuje w tekście dokumentu, odrzucona'],
    },
    'pelnomocnicy[1].imie_nazwisko': { source: 'llm', llm_value: 'Jolanta Zajkowski' },
  },
};

const field = (definition: DocumentTypeDefinition, path: string) => {
  const found = definition.fields.find((f) => f.path === path);
  if (!found) throw new Error(path);
  return found;
};

describe('labels', () => {
  it('uses Polish labels for known paths and readable names for new ones', () => {
    expect(fieldLabel('Odwolujacy[].nip')).toBe('NIP');
    expect(fieldLabel('OdwolanieKIO.czynnosc_dzien')).toBe('Data zaskarżonej czynności');
    expect(fieldLabel('Umowa.numer_umowy')).toBe('Numer umowy');
    expect(humanize('NumerOgloszeniaBzp')).toBe('Numer ogloszenia BZP');
  });
});

describe('mapDocumentType', () => {
  it('maps engine field types to screen types', () => {
    expect(field(other, 'OdwolanieKIO.czynnosc_dzien').type).toBe('data');
    expect(field(other, 'przelew_bankowy.kwota').type).toBe('kwota');
    expect(field(other, 'Zamawiajacy[].prowadzacy_postepowanie').type).toBe('flaga');
    expect(field(other, 'Odwolujacy[].przez-pelnomocnika').type).toBe('flaga');
    expect(field(other, 'OdwolanieKIO.czynnosc_powod_id').type).toBe('enum');
    expect(field(other, 'OdwolanieKIO.czynnosc_opis').strategy).toBe('derived');
    expect(field(poa, 'mocodawca[].data.typ').allowed).toEqual(['osoba_fizyczna', 'osoba_prawna']);
    expect(poa.sectionLabels['pelnomocnicy']).toBe('Pełnomocnik');
  });
});

describe('flattenResult', () => {
  it('expands lists into numbered sections with stable keys', () => {
    const fields = flattenResult(poa, POA);
    const keys = fields.map((f) => f.key);

    expect(keys).toContain('mocodawca[0].data.nazwa');
    expect(keys).toContain('mocodawca[0].podpisujacy[0].imie_nazwisko');
    expect(keys).toContain('pelnomocnicy[1].imie_nazwisko');

    const second = fields.find((f) => f.key === 'pelnomocnicy[1].imie_nazwisko');
    expect(second?.section).toBe('Pełnomocnik 2');
    expect(second?.value).toBe('Jolanta Zajkowski');
  });

  it('takes source, page, quote and notes from the engine trace', () => {
    const fields = flattenResult(poa, POA, {
      trace: TRACE,
      validation: { 'mocodawca[0].data.nip': ['niepoprawna suma kontrolna NIP'] },
    });
    const nip = fields.find((f) => f.key === 'mocodawca[0].data.nip');
    expect(nip?.source).toBe('rules');
    expect(nip?.page).toBe(1);
    expect(nip?.quote).toBe('NIP 999-928-40-65');
    expect(nip?.warnings).toEqual(['niepoprawna suma kontrolna NIP']);
    // Komunikat walidatora jest w ostrzeżeniach, więc nie powtarza się w uwagach silnika.
    expect(nip?.notes).toEqual([
      'Odczyty źródeł: reguła: 999-928-40-65; LLM: 9999284064.',
      'wartość z LLM nie występuje w tekście dokumentu, odrzucona',
    ]);
    expect(nip?.candidates).toEqual(['9999284065', '999-928-40-65']);
    expect(fields.find((f) => f.key === 'pelnomocnicy[1].imie_nazwisko')?.source).toBe('llm');
  });

  it('marks human corrections against the engine result', () => {
    const corrected = setValueAtKey(POA, 'mocodawca[0].data.nip', '5260250995');
    const nip = flattenResult(poa, corrected, { trace: TRACE, original: POA }).find(
      (f) => f.key === 'mocodawca[0].data.nip',
    );
    expect(nip?.value).toBe('5260250995');
    expect(nip?.originalValue).toBe('9999284065');
    expect(nip?.corrected).toBe(true);
    expect(nip?.source).toBe('manual');
    expect(nip?.page).toBeNull();
  });

  it('keeps null for missing nested objects', () => {
    const fields = flattenResult(other, { Odwolujacy: [{ 'przez-pelnomocnika': 0 }] });
    expect(fields.find((f) => f.key === 'Odwolujacy[0].przez-pelnomocnika')?.value).toBe(0);
    expect(fields.find((f) => f.key === 'OdwolanieKIO.czynnosc_dzien')?.value).toBeNull();
  });
});

describe('candidatesFor and parseInput', () => {
  it('searches dates in the Polish long form first', () => {
    expect(candidatesFor(field(other, 'OdwolanieKIO.czynnosc_dzien'), '2026-03-20')).toEqual([
      '20 marca 2026',
      '20.03.2026',
      '2026-03-20',
    ]);
  });

  it('searches TED numbers by their digits as well', () => {
    expect(candidatesFor(field(other, 'ZamowieniePubliczne.numer_ted'), '999073-2026')).toEqual([
      '999073-2026',
      '999073',
    ]);
  });

  it('does not search derived values', () => {
    expect(candidatesFor(field(other, 'OdwolanieKIO.czynnosc_opis'), 'Decyzja o odrzuceniu oferty')).toEqual([]);
  });

  it('parses amounts, Polish dates and dictionary ids', () => {
    expect(parseInput(field(other, 'przelew_bankowy.kwota'), '10 000,50')).toBe(10000.5);
    expect(parseInput(field(other, 'przelew_bankowy.kwota'), '')).toBeNull();
    expect(parseInput(field(other, 'OdwolanieKIO.czynnosc_dzien'), '5.3.2026')).toBe('2026-03-05');
    expect(parseInput(field(other, 'OdwolanieKIO.czynnosc_powod_id'), '2')).toBe(2);
    expect(parseInput(field(poa, 'mocodawca[].data.typ'), 'osoba_prawna')).toBe('osoba_prawna');
  });
});

describe('setValueAtKey', () => {
  it('updates a copy at an indexed path', () => {
    const updated = setValueAtKey(POA, 'pelnomocnicy[0].pesel', '44051401359') as typeof POA;
    expect(updated.pelnomocnicy[0].pesel).toBe('44051401359');
    expect(POA.pelnomocnicy[0].pesel).toBeNull();
  });
});
