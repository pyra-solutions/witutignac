import { findDocumentType } from '../config/mock-config';
import { DocumentTypeDefinition } from '../models/config.model';
import { candidatesFor, flattenResult, parseInput, setValueAtKey } from './flatten';
import { buildJsonSchema } from './json-schema';

function type(code: string): DocumentTypeDefinition {
  const definition = findDocumentType(code);
  if (!definition) throw new Error(`Brak typu ${code}`);
  return definition;
}

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

describe('flattenResult', () => {
  it('expands lists into numbered sections with stable keys', () => {
    const fields = flattenResult(type('pelnomocnictwo'), POA);
    const keys = fields.map((f) => f.key);

    expect(keys).toContain('mocodawca[0].data.nazwa');
    expect(keys).toContain('mocodawca[0].podpisujacy[0].imie_nazwisko');
    expect(keys).toContain('pelnomocnicy[1].imie_nazwisko');

    const second = fields.find((f) => f.key === 'pelnomocnicy[1].imie_nazwisko');
    expect(second?.section).toBe('Pełnomocnik 2');
    expect(second?.value).toBe('Jolanta Zajkowski');
  });

  it('flags failed checksums without removing the value', () => {
    const valid = flattenResult(type('pelnomocnictwo'), POA).find((f) => f.key === 'mocodawca[0].data.nip');
    expect(valid?.warnings).toEqual([]);

    const broken = setValueAtKey(POA, 'mocodawca[0].data.nip', '5540240548');
    const nip = flattenResult(type('pelnomocnictwo'), broken).find((f) => f.key === 'mocodawca[0].data.nip');
    expect(nip?.value).toBe('5540240548');
    expect(nip?.warnings).toEqual(['Suma kontrolna NIP się nie zgadza']);
  });

  it('keeps null for missing nested objects', () => {
    const fields = flattenResult(type('odwolanie'), {
      Odwolujacy: [{ nazwa: 'Firma', 'przez-pelnomocnika': 0, pelnomocnik: null }],
    });
    expect(fields.find((f) => f.key === 'Odwolujacy[0].pelnomocnik.mail')?.value).toBeNull();
  });
});

describe('candidatesFor and parseInput', () => {
  const appeal = type('odwolanie');
  const transfer = type('przelew');
  const field = (definition: DocumentTypeDefinition, path: string) => {
    const found = definition.fields.find((f) => f.path === path);
    if (!found) throw new Error(path);
    return found;
  };

  it('searches dates in the Polish long form first', () => {
    expect(candidatesFor(field(appeal, 'OdwolanieKIO.czynnosc_dzien'), '2026-03-20')).toEqual([
      '20 marca 2026',
      '20.03.2026',
      '2026-03-20',
    ]);
  });

  it('searches TED numbers by their digits as well', () => {
    expect(candidatesFor(field(appeal, 'ZamowieniePubliczne.numer_ted'), '999073-2026')).toEqual([
      '999073-2026',
      '999073',
    ]);
  });

  it('does not search dictionary values', () => {
    expect(candidatesFor(field(appeal, 'OdwolanieKIO.czynnosc_opis'), 'Decyzja o unieważnieniu postępowania')).toEqual([]);
  });

  it('parses amounts written with a Polish decimal comma', () => {
    expect(parseInput(field(transfer, 'przelew_bankowy.kwota'), '10 000,50')).toBe(10000.5);
    expect(parseInput(field(transfer, 'przelew_bankowy.kwota'), '')).toBeNull();
  });
});

describe('setValueAtKey', () => {
  it('updates a copy at an indexed path', () => {
    const updated = setValueAtKey(POA, 'pelnomocnicy[0].pesel', '44051401359') as typeof POA;
    expect(updated.pelnomocnicy[0].pesel).toBe('44051401359');
    expect(POA.pelnomocnicy[0].pesel).toBeNull();
  });
});

describe('buildJsonSchema', () => {
  it('builds nested arrays and dictionary enums from field definitions', () => {
    const schema = buildJsonSchema(type('odwolanie')) as {
      properties: Record<string, { type: string; items?: { properties: Record<string, unknown> }; properties?: Record<string, { enum?: unknown[] }> }>;
    };
    expect(schema.properties['Odwolujacy'].type).toBe('array');
    expect(Object.keys(schema.properties['Odwolujacy'].items?.properties ?? {})).toContain('pelnomocnik');
    const reasons = schema.properties['OdwolanieKIO'].properties?.['czynnosc_powod_id'].enum;
    expect(reasons).toContain(12);
    expect(reasons).toContain(null);
  });
});
