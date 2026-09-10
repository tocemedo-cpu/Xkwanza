import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from './app';

// Testes de integração contra uma base de dados Postgres real (local em dev,
// serviço do GitHub Actions em CI) — sem mocks, exercitam o fluxo HTTP completo:
// validação, Prisma, hashing, JWT e RBAC.
const app = createApp();

function randomPhone(): string {
  const digits = Math.floor(100_000_000 + Math.random() * 800_000_000);
  return `+244${digits}`;
}

function randomEmail(): string {
  return `user${Date.now()}${Math.floor(Math.random() * 100_000)}@example.com`;
}

function randomNif(): string {
  return `NIF${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 900 + 100)}`;
}

describe('GET /health', () => {
  it('responde 200 com status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /api/auth/register', () => {
  it('rejeita dados inválidos com 400', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'X' });
    expect(res.status).toBe(400);
  });

  it('regista com sucesso e devolve tokens', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Integration Test',
        phone: randomPhone(),
        email: randomEmail(),
        password: 'Password123',
        province: 'Luanda',
        municipality: 'Luanda',
        locality: 'Maianga',
        role: 'BUYER',
        nif: randomNif(),
      });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('BUYER');
    expect(typeof res.body.accessToken).toBe('string');
    expect(typeof res.body.refreshToken).toBe('string');
  });

  it('rejeita um segundo registo com o mesmo telefone (409)', async () => {
    const payload = {
      name: 'Duplicado',
      phone: randomPhone(),
      email: randomEmail(),
      password: 'Password123',
      province: 'Luanda',
      municipality: 'Luanda',
      locality: 'Maianga',
      role: 'BUYER',
      nif: randomNif(),
    };
    const first = await request(app).post('/api/auth/register').send(payload);
    expect(first.status).toBe(201);

    const second = await request(app)
      .post('/api/auth/register')
      .send({ ...payload, email: randomEmail(), nif: randomNif() });
    expect(second.status).toBe(409);
  });

  it('bloqueia auto-registo como ADMIN (403) mesmo com dados válidos', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Tentativa Admin',
        phone: randomPhone(),
        email: randomEmail(),
        password: 'Password123',
        province: 'Luanda',
        municipality: 'Luanda',
        role: 'ADMIN',
        nif: randomNif(),
      });
    expect(res.status).toBe(403);
  });

  it('rejeita registo de comprador sem endereço/localidade (400)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Comprador Sem Localidade',
        phone: randomPhone(),
        email: randomEmail(),
        password: 'Password123',
        province: 'Luanda',
        municipality: 'Luanda',
        role: 'BUYER',
        nif: randomNif(),
      });
    expect(res.status).toBe(400);
  });

  it('rejeita registo de produtor sem localização da produção (400)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Produtor Sem Localização',
        phone: randomPhone(),
        email: randomEmail(),
        password: 'Password123',
        province: 'Huambo',
        municipality: 'Huambo',
        role: 'PRODUCER',
        nif: randomNif(),
      });
    expect(res.status).toBe(400);
  });

  it('regista um produtor com localização da produção e dados da actividade', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Produtora Teste',
        phone: randomPhone(),
        email: randomEmail(),
        password: 'Password123',
        province: 'Huambo',
        municipality: 'Huambo',
        role: 'PRODUCER',
        nif: randomNif(),
        activityType: 'AGRICULTOR',
        productionLocation: 'Quinta do Kero',
        businessName: 'Horta da Ana',
        productCategories: ['Hortícolas'],
        productsProduced: ['Tomate', 'Cebola'],
        productionCapacity: '200 kg/semana',
        productionUnit: 'kg',
        referencePrice: '500 Kz/kg',
        availability: 'Todo o ano',
      });
    expect(res.status).toBe(201);
    expect(res.body.user.activityType).toBe('AGRICULTOR');

    const profile = await request(app)
      .get('/api/producers/me')
      .set('Authorization', `Bearer ${res.body.accessToken}`);
    expect(profile.status).toBe(200);
    expect(profile.body.productionLocation).toBe('Quinta do Kero');
    expect(profile.body.productsProduced).toEqual(['Tomate', 'Cebola']);
  });

  it('rejeita um segundo registo com o mesmo NIF (409)', async () => {
    const nif = randomNif();
    const first = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Comerciante A',
        phone: randomPhone(),
        email: randomEmail(),
        password: 'Password123',
        province: 'Luanda',
        municipality: 'Luanda',
        role: 'MERCHANT',
        nif,
      });
    expect(first.status).toBe(201);

    const second = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Comerciante B',
        phone: randomPhone(),
        email: randomEmail(),
        password: 'Password123',
        province: 'Luanda',
        municipality: 'Luanda',
        role: 'MERCHANT',
        nif,
      });
    expect(second.status).toBe(409);
  });

  it('regista um comerciante só com os dados pessoais (dados do negócio ficam para depois)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Comerciante Teste',
        phone: randomPhone(),
        email: randomEmail(),
        password: 'Password123',
        province: 'Luanda',
        municipality: 'Luanda',
        role: 'MERCHANT',
        nif: randomNif(),
      });
    expect(res.status).toBe(201);

    const profile = await request(app)
      .get('/api/merchants/me')
      .set('Authorization', `Bearer ${res.body.accessToken}`);
    expect(profile.status).toBe(200);
    expect(profile.body.businessName).toBeNull();
    expect(profile.body.formalizationState).toBe('INFORMAL');
  });

  it('regista um transportador com dados do transporte e cria logo o perfil de transportador', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Transportador Teste',
        phone: randomPhone(),
        email: randomEmail(),
        password: 'Password123',
        province: 'Luanda',
        municipality: 'Luanda',
        role: 'TRANSPORTER',
        nif: randomNif(),
        transporterCategory: 'INDIVIDUAL',
        vehicleType: 'Carrinha',
        vehiclePlate: 'LD-12-34-AB',
        cargoCapacity: '500 kg',
        cargoType: 'Produtos agrícolas',
        serviceAreas: ['Luanda', 'Belas'],
        servicePrice: '5000 Kz por viagem',
      });
    expect(res.status).toBe(201);

    const profile = await request(app)
      .get('/api/transporters/me')
      .set('Authorization', `Bearer ${res.body.accessToken}`);
    expect(profile.status).toBe(200);
    expect(profile.body.transporterCategory).toBe('INDIVIDUAL');
    expect(profile.body.vehicleType).toBe('Carrinha');
    expect(profile.body.cargoCapacity).toBe('500 kg');
    expect(profile.body.serviceAreas).toEqual(['Luanda', 'Belas']);
  });

  it('regista um transportador sem nenhum dado do transporte (fica para completar depois)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Transportador Sem Dados',
        phone: randomPhone(),
        email: randomEmail(),
        password: 'Password123',
        province: 'Huíla',
        municipality: 'Lubango',
        role: 'TRANSPORTER',
        nif: randomNif(),
      });
    expect(res.status).toBe(201);

    const profile = await request(app)
      .get('/api/transporters/me')
      .set('Authorization', `Bearer ${res.body.accessToken}`);
    expect(profile.status).toBe(200);
    expect(profile.body.vehicleType).toBeNull();
    expect(profile.body.serviceAreas).toEqual([]);
  });
});

describe('POST /api/auth/login', () => {
  it('autentica por telefone com a password certa e rejeita a errada', async () => {
    const phone = randomPhone();
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Login Test',
        phone,
        email: randomEmail(),
        password: 'Password123',
        province: 'Luanda',
        municipality: 'Luanda',
        locality: 'Maianga',
        role: 'BUYER',
        nif: randomNif(),
      });

    const ok = await request(app).post('/api/auth/login').send({ identifier: phone, password: 'Password123' });
    expect(ok.status).toBe(200);

    const wrong = await request(app)
      .post('/api/auth/login')
      .send({ identifier: phone, password: 'PasswordErrada1' });
    expect(wrong.status).toBe(401);
  });

  it('autentica também por email, mesmo tendo telefone associado à conta', async () => {
    const email = randomEmail();
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Email Login',
        phone: randomPhone(),
        email,
        password: 'Password123',
        province: 'Luanda',
        municipality: 'Luanda',
        locality: 'Maianga',
        role: 'BUYER',
        nif: randomNif(),
      });
    expect(registerRes.status).toBe(201);

    const ok = await request(app).post('/api/auth/login').send({ identifier: email, password: 'Password123' });
    expect(ok.status).toBe(200);
  });
});

describe('RBAC — GET /api/users (apenas ADMIN/SUPPORT)', () => {
  it('rejeita sem token (401) e um perfil comum (403)', async () => {
    const anon = await request(app).get('/api/users');
    expect(anon.status).toBe(401);

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Comprador Comum',
        phone: randomPhone(),
        email: randomEmail(),
        password: 'Password123',
        province: 'Luanda',
        municipality: 'Luanda',
        locality: 'Maianga',
        role: 'BUYER',
        nif: randomNif(),
      });

    const forbidden = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${registerRes.body.accessToken}`);
    expect(forbidden.status).toBe(403);
  });
});

describe('POST /internal/tasks/promote-admin', () => {
  it('responde 404 (como se não existisse) sem o cabeçalho x-admin-secret correcto', async () => {
    const res = await request(app).post('/internal/tasks/promote-admin').send({ phone: randomPhone() });
    expect(res.status).toBe(404);
  });
});
