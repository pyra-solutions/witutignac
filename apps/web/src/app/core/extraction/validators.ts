/**
 * Walidatory pól. Zwracają komunikat ostrzeżenia albo null.
 * Ostrzeżenie nie usuwa wartości: w danych treningowych część numerów ma niezgodne
 * sumy kontrolne, a wzorzec i tak je zawiera.
 */

const digitsOnly = (v: string) => /^\d+$/.test(v);

function weightedSum(value: string, weights: number[]): number {
  return weights.reduce((sum, w, i) => sum + w * Number(value[i]), 0);
}

export function isValidNip(value: string): boolean {
  if (value.length !== 10 || !digitsOnly(value)) return false;
  const check = weightedSum(value, [6, 5, 7, 2, 3, 4, 5, 6, 7]) % 11;
  return check !== 10 && check === Number(value[9]);
}

export function isValidRegon(value: string): boolean {
  if (!digitsOnly(value)) return false;
  if (value.length === 9) {
    return (weightedSum(value, [8, 9, 2, 3, 4, 5, 6, 7]) % 11) % 10 === Number(value[8]);
  }
  if (value.length === 14) {
    return (weightedSum(value, [2, 4, 8, 5, 0, 9, 7, 3, 6, 1, 2, 4, 8]) % 11) % 10 === Number(value[13]);
  }
  return false;
}

export function isValidPesel(value: string): boolean {
  if (value.length !== 11 || !digitsOnly(value)) return false;
  const check = (10 - (weightedSum(value, [1, 3, 7, 9, 1, 3, 7, 9, 1, 3]) % 10)) % 10;
  return check === Number(value[10]);
}

/** Polski numer rachunku: 26 cyfr bez prefiksu „PL”, kontrola mod 97 jak dla IBAN. */
export function isValidPolishAccount(value: string): boolean {
  if (value.length !== 26 || !digitsOnly(value)) return false;
  // Przeniesienie „PL” + 2 cyfr kontrolnych na koniec; P = 25, L = 21.
  const rearranged = value.slice(2) + '2521' + value.slice(0, 2);
  let remainder = 0;
  for (const ch of rearranged) {
    remainder = (remainder * 10 + Number(ch)) % 97;
  }
  return remainder === 1;
}

export function isValidIsoDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

export type AllowedValues = readonly (string | number)[];

export function validate(
  validator: string,
  value: string | number,
  allowed: AllowedValues = [],
): string | null {
  const text = String(value);
  switch (validator) {
    case 'nip_checksum':
      return isValidNip(text) ? null : 'Suma kontrolna NIP się nie zgadza';
    case 'regon_checksum':
      return isValidRegon(text) ? null : 'Suma kontrolna REGON się nie zgadza';
    case 'pesel_checksum':
      return isValidPesel(text) ? null : 'Suma kontrolna PESEL się nie zgadza';
    case 'iban_checksum':
      return isValidPolishAccount(text) ? null : 'Suma kontrolna numeru rachunku się nie zgadza';
    case 'krs_format':
      return /^\d{10}$/.test(text) ? null : 'KRS powinien mieć 10 cyfr';
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) ? null : 'Niepoprawny format adresu e-mail';
    case 'bzp_format':
      return /^\d{4}\/BZP\d{8}(\/\d{2})?$/.test(text) ? null : 'Numer BZP ma inny format niż RRRR/BZP########';
    case 'ted_format':
      return /^\d{5,6}-\d{4}$/.test(text) ? null : 'Numer TED ma inny format niż NNNNNN-RRRR';
    case 'date_valid':
      return isValidIsoDate(text) ? null : 'Niepoprawna data';
    case 'enum':
      return allowed.length === 0 || allowed.some((a) => String(a) === text) ? null : 'Wartości nie ma w słowniku';
    default:
      return null;
  }
}
