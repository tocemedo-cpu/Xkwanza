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

  it('email é opcional quando o telefone está presente', () => {
    const result = registerSchema.safeParse({ body: validRegisterBody });
    expect(result.success).toBe(true);
  });

  it('aceita registo apenas com email (sem telefone)', () => {
    const { phone: _phone, ...withoutPhone } = validRegisterBody;
    const result = registerSchema.safeParse({ body: { ...withoutPhone, email: 'ana@example.com' } });
    expect(result.success).toBe(true);
  });

  it('rejeita registo sem telefone nem email', () => {
    const { phone: _phone, ...withoutPhone } = validRegisterBody;
    const result = registerSchema.safeParse({ body: withoutPhone });
    expect(result.success).toBe(false);
  });

  it('NIF é opcional — regista sem NIF (utilizador informal)', () => {
    const result = registerSchema.safeParse({ body: validRegisterBody });
    expect(result.success).toBe(true);
  });

  it('aceita NIF alfanumérico válido', () => {
    const result = registerSchema.safeParse({ body: { ...validRegisterBody, nif: 'ABC123456' } });
    expect(result.success).toBe(true);
  });

  it('rejeita NIF demasiado curto ou com caracteres inválidos', () => {
    expect(registerSchema.safeParse({ body: { ...validRegisterBody, nif: 'AB' } }).success).toBe(false);
    expect(registerSchema.safeParse({ body: { ...validRegisterBody, nif: 'ABC-123' } }).success).toBe(false);
  });

  it('aceita um tipo de actividade válido do enum', () => {
    const result = registerSchema.safeParse({ body: { ...validRegisterBody, activityType: 'AGRICULTOR' } });
    expect(result.success).toBe(true);
  });

  it('rejeita um tipo de actividade fora do enum', () => {
    const result = registerSchema.safeParse({ body: { ...validRegisterBody, activityType: 'EMPRESARIO' } });
    expect(result.success).toBe(false);
  });

  it('aceita registo de transportador só com os dados pessoais (dados do transporte são opcionais)', () => {
    const result = registerSchema.safeParse({ body: { ...validRegisterBody, role: 'TRANSPORTER' } });
    expect(result.success).toBe(true);
  });

  it('aceita registo de transportador com dados do transporte completos', () => {
    const result = registerSchema.safeParse({
      body: {
        ...validRegisterBody,
        role: 'TRANSPORTER',
        transporterCategory: 'INDIVIDUAL',
        vehicleType: 'Carrinha',
        vehiclePlate: 'LD-12-34-AB',
        cargoCapacity: '500 kg',
        cargoType: 'Produtos agrícolas',
        serviceAreas: ['Luanda', 'Belas'],
        servicePrice: '5000 Kz por viagem',
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejeita tipo de transportador fora do enum', () => {
    const result = registerSchema.safeParse({
      body: { ...validRegisterBody, role: 'TRANSPORTER', transporterCategory: 'FROTA' },
    });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('aceita telefone como identifier', () => {
    const result = loginSchema.safeParse({ body: { identifier: '+244923456789', password: 'qualquer' } });
    expect(result.success).toBe(true);
  });

  it('aceita email como identifier', () => {
    const result = loginSchema.safeParse({ body: { identifier: 'ana@example.com', password: 'qualquer' } });
    expect(result.success).toBe(true);
  });

  it('rejeita password vazia', () => {
    const result = loginSchema.safeParse({ body: { identifier: '+244923456789', password: '' } });
    expect(result.success).toBe(false);
  });

  it('rejeita identifier demasiado curto', () => {
    const result = loginSchema.safeParse({ body: { identifier: 'ab', password: 'qualquer' } });
    expect(result.success).toBe(false);
  });
});
