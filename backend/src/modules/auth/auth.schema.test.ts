import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from './auth.schema';

// Requisitos de registo (todos os 4 perfis públicos): nome, telefone, email, palavra-passe,
// NIF, província e município são todos obrigatórios. Comprador precisa também de
// "locality" (endereço/localidade); Produtor precisa também de "productionLocation".
const validRegisterBody = {
  name: 'Ana Teste',
  phone: '+244923456789',
  email: 'ana@example.com',
  password: 'Password123',
  province: 'Luanda',
  municipality: 'Luanda',
  locality: 'Maianga',
  role: 'BUYER',
  nif: 'ABC123456',
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

  it('rejeita email em formato inválido', () => {
    const result = registerSchema.safeParse({ body: { ...validRegisterBody, email: 'nao-e-email' } });
    expect(result.success).toBe(false);
  });

  it('rejeita registo sem email', () => {
    const { email: _email, ...withoutEmail } = validRegisterBody;
    const result = registerSchema.safeParse({ body: withoutEmail });
    expect(result.success).toBe(false);
  });

  it('rejeita registo sem telefone', () => {
    const { phone: _phone, ...withoutPhone } = validRegisterBody;
    const result = registerSchema.safeParse({ body: withoutPhone });
    expect(result.success).toBe(false);
  });

  it('rejeita registo sem NIF', () => {
    const { nif: _nif, ...withoutNif } = validRegisterBody;
    const result = registerSchema.safeParse({ body: withoutNif });
    expect(result.success).toBe(false);
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

  it('rejeita registo de comprador sem endereço/localidade', () => {
    const { locality: _locality, ...withoutLocality } = validRegisterBody;
    const result = registerSchema.safeParse({ body: withoutLocality });
    expect(result.success).toBe(false);
  });

  it('rejeita registo de produtor sem localização da produção', () => {
    const { locality: _locality, ...rest } = validRegisterBody;
    const result = registerSchema.safeParse({ body: { ...rest, role: 'PRODUCER' } });
    expect(result.success).toBe(false);
  });

  it('aceita registo de produtor com localização da produção e sem dados da actividade', () => {
    const { locality: _locality, ...rest } = validRegisterBody;
    const result = registerSchema.safeParse({
      body: { ...rest, role: 'PRODUCER', productionLocation: 'Quinta do Kero' },
    });
    expect(result.success).toBe(true);
  });

  it('aceita registo de produtor com dados da actividade completos', () => {
    const { locality: _locality, ...rest } = validRegisterBody;
    const result = registerSchema.safeParse({
      body: {
        ...rest,
        role: 'PRODUCER',
        productionLocation: 'Quinta do Kero',
        businessName: 'Horta da Ana',
        productCategories: ['Hortícolas'],
        productsProduced: ['Tomate', 'Cebola'],
        productionCapacity: '200 kg/semana',
        productionUnit: 'kg',
        referencePrice: '500 Kz/kg',
        availability: 'Todo o ano',
      },
    });
    expect(result.success).toBe(true);
  });

  it('aceita registo de comerciante só com os dados pessoais (dados do negócio são opcionais)', () => {
    const { locality: _locality, ...rest } = validRegisterBody;
    const result = registerSchema.safeParse({ body: { ...rest, role: 'MERCHANT' } });
    expect(result.success).toBe(true);
  });

  it('aceita registo de comerciante com dados do negócio completos', () => {
    const { locality: _locality, ...rest } = validRegisterBody;
    const result = registerSchema.safeParse({
      body: {
        ...rest,
        role: 'MERCHANT',
        businessName: 'Loja da Ana',
        businessLocation: 'Mercado do Kinaxixi',
        productCategories: ['Vestuário'],
        productsSold: ['Camisas', 'Calças'],
      },
    });
    expect(result.success).toBe(true);
  });

  it('aceita registo de transportador só com os dados pessoais (dados do transporte são opcionais)', () => {
    const { locality: _locality, ...rest } = validRegisterBody;
    const result = registerSchema.safeParse({ body: { ...rest, role: 'TRANSPORTER' } });
    expect(result.success).toBe(true);
  });

  it('aceita registo de transportador com dados do transporte completos', () => {
    const { locality: _locality, ...rest } = validRegisterBody;
    const result = registerSchema.safeParse({
      body: {
        ...rest,
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
    const { locality: _locality, ...rest } = validRegisterBody;
    const result = registerSchema.safeParse({
      body: { ...rest, role: 'TRANSPORTER', transporterCategory: 'FROTA' },
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
