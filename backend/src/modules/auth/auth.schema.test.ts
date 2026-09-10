import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from './auth.schema';

const validRegisterBody = {
  name: 'Ana Teste',
  phone: '+244923456789',
  password: 'Password123',
  province: 'Luanda',
  municipality: 'Luanda',
  role: 'BUYER',
};

describe('registerSchema', () => {
  it('aceita um registo válido', () => {
    const result = registerSchema.safeParse({ body: validRegisterBody });
    expect(result.success).toBe(true);
  });

  it('rejeita telefone em formato inválido', () => {
    const result = registerSchema.safeParse({ body: { ...validRegisterBody, phone: '923456789' } });
    expect(result.success).toBe(false);
  });

  it.each([
    ['sem maiúscula', 'password123'],
    ['sem minúscula', 'PASSWORD123'],
    ['sem número', 'PasswordAbc'],
    ['demasiado curta', 'Pass1'],
  ])('rejeita palavra-passe %s', (_label, password) => {
    const result = registerSchema.safeParse({ body: { ...validRegisterBody, password } });
    expect(result.success).toBe(false);
  });

  it('rejeita província fora da lista', () => {
    const result = registerSchema.safeParse({ body: { ...validRegisterBody, province: 'Lisboa' } });
    expect(result.success).toBe(false);
  });

  it('rejeita perfil ADMIN/SUPPORT ao nível do schema? não — isso é responsabilidade do serviço', () => {
    // O schema só valida a FORMA dos dados; o bloqueio de auto-registo como ADMIN/SUPPORT
    // é feito em auth.service.ts (INTERNAL_ONLY_ROLES), não aqui — por isso isto passa.
    const result = registerSchema.safeParse({ body: { ...validRegisterBody, role: 'ADMIN' } });
    expect(result.success).toBe(true);
  });

  it('rejeita email em formato inválido quando fornecido', () => {
    const result = registerSchema.safeParse({ body: { ...validRegisterBody, email: 'nao-e-email' } });
    expect(result.success).toBe(false);
  });

  it('email é opcional', () => {
    const result = registerSchema.safeParse({ body: validRegisterBody });
    expect(result.success).toBe(true);
  });
});

describe('loginSchema', () => {
  it('aceita telefone e password não vazios', () => {
    const result = loginSchema.safeParse({ body: { phone: '+244923456789', password: 'qualquer' } });
    expect(result.success).toBe(true);
  });

  it('rejeita password vazia', () => {
    const result = loginSchema.safeParse({ body: { phone: '+244923456789', password: '' } });
    expect(result.success).toBe(false);
  });
});
