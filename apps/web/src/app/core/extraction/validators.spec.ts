import { isValidIsoDate, isValidNip, isValidPesel, isValidPolishAccount, isValidRegon, validate } from './validators';

describe('validators', () => {
  it('checks NIP checksums', () => {
    expect(isValidNip('5540240549')).toBe(true); // NIP z wzorca oczekiwane-json/odwolanie.json
    expect(isValidNip('5540240548')).toBe(false);
    expect(isValidNip('554024054')).toBe(false);
  });

  it('checks 9- and 14-digit REGON checksums', () => {
    expect(isValidRegon('000279077')).toBe(true); // REGON z wzorca oczekiwane-json/odwolanie.json
    expect(isValidRegon('000279078')).toBe(false);
    expect(isValidRegon('12345678512347')).toBe(true);
    expect(isValidRegon('12345')).toBe(false);
  });

  it('checks PESEL checksums', () => {
    expect(isValidPesel('44051401359')).toBe(true);
    expect(isValidPesel('44051401358')).toBe(false);
  });

  it('checks Polish account numbers with mod 97', () => {
    expect(isValidPolishAccount('61109010140000071219812874')).toBe(true);
    expect(isValidPolishAccount('61109010140000071219812875')).toBe(false);
    expect(isValidPolishAccount('PL61109010140000071219812874')).toBe(false);
  });

  it('checks ISO dates including calendar validity', () => {
    expect(isValidIsoDate('2026-03-20')).toBe(true);
    expect(isValidIsoDate('2026-02-30')).toBe(false);
    expect(isValidIsoDate('20.03.2026')).toBe(false);
  });

  it('returns Polish warnings and accepts dictionary values', () => {
    expect(validate('nip_checksum', '5540240548')).toBe('Suma kontrolna NIP się nie zgadza');
    expect(validate('ted_format', '999137-2026')).toBeNull();
    expect(validate('ted_format', '2026/S086-999073')).not.toBeNull();
    expect(validate('bzp_format', '2026/BZP00999778')).toBeNull();
    expect(validate('enum', 9, [1, 9, 12])).toBeNull();
    expect(validate('enum', 13, [1, 9, 12])).toBe('Wartości nie ma w słowniku');
  });
});
