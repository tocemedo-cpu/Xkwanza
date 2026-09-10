import { describe, expect, it } from 'vitest';
import { ANGOLA_PHONE_REGEX, ANGOLA_PROVINCES } from './angola';

describe('ANGOLA_PHONE_REGEX', () => {
  it('aceita números no formato +244 seguido de 9 dígitos', () => {
    expect(ANGOLA_PHONE_REGEX.test('+244923456789')).toBe(true);
    expect(ANGOLA_PHONE_REGEX.test('+244000000000')).toBe(true);
  });

  it('rejeita números sem o prefixo +244, com dígitos a menos/a mais, ou com letras', () => {
    expect(ANGOLA_PHONE_REGEX.test('923456789')).toBe(false); // sem prefixo
    expect(ANGOLA_PHONE_REGEX.test('+24492345678')).toBe(false); // 8 dígitos
    expect(ANGOLA_PHONE_REGEX.test('+2449234567890')).toBe(false); // 10 dígitos
    expect(ANGOLA_PHONE_REGEX.test('+244abc456789')).toBe(false); // letras
    expect(ANGOLA_PHONE_REGEX.test('+2449234567 8')).toBe(false); // espaço
  });
});

describe('ANGOLA_PROVINCES', () => {
  it('tem 18 províncias, sem duplicados', () => {
    expect(ANGOLA_PROVINCES).toHaveLength(18);
    expect(new Set(ANGOLA_PROVINCES).size).toBe(ANGOLA_PROVINCES.length);
  });

  it('inclui Luanda', () => {
    expect(ANGOLA_PROVINCES).toContain('Luanda');
  });
});
