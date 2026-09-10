import { describe, expect, it } from 'vitest';
import { ANGOLA_PHONE_PREFIX, ANGOLA_PROVINCES, formatKwanza } from './angola';

describe('formatKwanza', () => {
  it('formata um valor com milhares e duas casas decimais, em Kwanza', () => {
    expect(formatKwanza(1500)).toMatch(/1[\s .]500,00/);
    expect(formatKwanza(1500)).toContain('Kz');
  });

  it('formata zero e valores decimais', () => {
    expect(formatKwanza(0)).toContain('0,00');
    expect(formatKwanza(99.9)).toContain('99,90');
  });
});

describe('ANGOLA_PROVINCES / ANGOLA_PHONE_PREFIX', () => {
  it('tem 18 províncias e inclui Luanda', () => {
    expect(ANGOLA_PROVINCES).toHaveLength(18);
    expect(ANGOLA_PROVINCES).toContain('Luanda');
  });

  it('o prefixo telefónico é +244', () => {
    expect(ANGOLA_PHONE_PREFIX).toBe('+244');
  });
});
