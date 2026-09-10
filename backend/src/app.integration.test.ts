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
        password: 'Password123',
        province: 'Luanda',
        municipality: 'Luanda',
        role: 'BUYER',
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
      password: 'Password123',
      province: 'Luanda',
      municipality: 'Luanda',
      role: 'BUYER',
    };
    const first = await request(app).post('/api/auth/register').send(payload);
    expect(first.status).toBe(201);

    const second = await request(app).post('/api/auth/register').send(payload);
    expect(second.status).toBe(409);
  });

  it('bloqueia auto-registo como ADMIN (403) mesmo com dados válidos', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Tentativa Admin',
        phone: randomPhone(),
        password: 'Password123',
        province: 'Luanda',
        municipality: 'Luanda',
        role: 'ADMIN',
      });
    expect(res.status).toBe(403);
  });

  it('regista um produtor sem NIF (utilizador informal) — NIF nunca bloqueia o registo', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Produtor Informal',
        phone: randomPhone(),
        password: 'Password123',
        province: 'Huambo',
        municipality: 'Huambo',
        role: 'PRODUCER',
        activityType: 'AGRICULTOR',
      });
    expect(res.status).toBe(201);
    expect(res.body.user.nif).toBeNull();
    expect(res.body.user.activityType).toBe('AGRICULTOR');
  });

  it('rejeita um segundo registo com o mesmo NIF (409)', async () => {
    const nif = `NIF${Date.now()}`;
    const first = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Comerciante A',
        phone: randomPhone(),
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
        password: 'Password123',
        province: 'Luanda',
        municipality: 'Luanda',
        role: 'MERCHANT',
        nif,
      });
    expect(second.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  it('autentica por telefone com a password certa e rejeita a errada', async () => {
    const phone = randomPhone();
    await request(app).post('/api/auth/register').send({
      name: 'Login Test',
      phone,
      password: 'Password123',
      province: 'Luanda',
      municipality: 'Luanda',
      role: 'BUYER',
    });

    const ok = await request(app).post('/api/auth/login').send({ identifier: phone, password: 'Password123' });
    expect(ok.status).toBe(200);

    const wrong = await request(app)
      .post('/api/auth/login')
      .send({ identifier: phone, password: 'PasswordErrada1' });
    expect(wrong.status).toBe(401);
  });

  it('regista e autentica apenas com email (sem telefone)', async () => {
    const email = `${randomPhone().slice(-9)}@example.com`;
    const registerRes = await request(app).post('/api/auth/register').send({
      name: 'Email Only',
      email,
      password: 'Password123',
      province: 'Luanda',
      municipality: 'Luanda',
      role: 'BUYER',
    });
    expect(registerRes.status).toBe(201);
    expect(registerRes.body.user.phone).toBeNull();

    const ok = await request(app).post('/api/auth/login').send({ identifier: email, password: 'Password123' });
    expect(ok.status).toBe(200);
  });
});

describe('RBAC — GET /api/users (apenas ADMIN/SUPPORT)', () => {
  it('rejeita sem token (401) e um perfil comum (403)', async () => {
    const anon = await request(app).get('/api/users');
    expect(anon.status).toBe(401);

    const phone = randomPhone();
    const registerRes = await request(app).post('/api/auth/register').send({
      name: 'Comprador Comum',
      phone,
      password: 'Password123',
      province: 'Luanda',
      municipality: 'Luanda',
      role: 'BUYER',
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
