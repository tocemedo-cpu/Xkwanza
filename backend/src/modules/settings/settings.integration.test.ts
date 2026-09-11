import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app';
import { prisma } from '../../database/prisma';

// Testes de integração contra uma base de dados Postgres real, sem mocks — exercitam o fluxo
// HTTP completo (validação, RBAC e Prisma) do módulo de configurações da plataforma.
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

// Regista um utilizador comum e promove-o directamente na base de dados (o registo público
// bloqueia ADMIN/SUPPORT de propósito — o caminho real é /internal/tasks/promote-admin,
// mas os testes acedem à BD directamente para não depender do ADMIN_TASK_SECRET).
async function createUser(role: 'BUYER' | 'PRODUCER' | 'MERCHANT' | 'TRANSPORTER' | 'ADMIN' | 'SUPPORT' = 'BUYER') {
  const phone = randomPhone();
  const password = 'Password123';
  const publicRole = role === 'ADMIN' || role === 'SUPPORT' ? 'BUYER' : role;
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: `Teste ${role}`,
      phone,
      email: randomEmail(),
      password,
      province: 'Luanda',
      municipality: 'Luanda',
      locality: 'Maianga',
      productionLocation: publicRole === 'PRODUCER' ? 'Quinta de Teste' : undefined,
      role: publicRole,
      nif: randomNif(),
    });

  const userId = registerRes.body.user.id as string;
  let accessToken = registerRes.body.accessToken as string;

  if (role !== publicRole) {
    await prisma.user.update({ where: { id: userId }, data: { role } });
    const loginRes = await request(app).post('/api/auth/login').send({ identifier: phone, password });
    accessToken = loginRes.body.accessToken;
  }

  return { userId, phone, accessToken };
}

function randomKey(): string {
  return `test.setting.${Date.now()}.${Math.floor(Math.random() * 100_000)}`;
}

describe('GET /api/settings', () => {
  it('devolve 403 para um utilizador não-admin', async () => {
    const buyer = await createUser('BUYER');
    const res = await request(app).get('/api/settings').set('Authorization', `Bearer ${buyer.accessToken}`);
    expect(res.status).toBe(403);
  });
});

describe('PUT /api/settings/:key', () => {
  it('cria uma nova configuração e devolve o updatedBy preenchido', async () => {
    const admin = await createUser('ADMIN');
    const key = randomKey();

    const res = await request(app)
      .put(`/api/settings/${key}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ value: 'valor-inicial' });

    expect(res.status).toBe(200);
    expect(res.body.key).toBe(key);
    expect(res.body.value).toBe('valor-inicial');
    expect(res.body.updatedBy).toMatchObject({ id: admin.userId });
  });

  it('actualiza a configuração existente em vez de criar uma segunda linha', async () => {
    const admin = await createUser('ADMIN');
    const key = randomKey();

    await request(app)
      .put(`/api/settings/${key}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ value: 'valor-inicial' });

    const updateRes = await request(app)
      .put(`/api/settings/${key}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ value: 'valor-actualizado' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.value).toBe('valor-actualizado');

    const count = await prisma.platformSetting.count({ where: { key } });
    expect(count).toBe(1);

    const getRes = await request(app)
      .get(`/api/settings/${key}`)
      .set('Authorization', `Bearer ${admin.accessToken}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.value).toBe('valor-actualizado');
  });

  it('devolve 400 quando a chave não respeita o formato permitido', async () => {
    const admin = await createUser('ADMIN');
    const res = await request(app)
      .put('/api/settings/Chave Inválida')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ value: 'qualquer' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/settings/:key', () => {
  it('devolve 404 para uma chave nunca definida', async () => {
    const admin = await createUser('ADMIN');
    const res = await request(app)
      .get(`/api/settings/${randomKey()}`)
      .set('Authorization', `Bearer ${admin.accessToken}`);

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/settings/:key', () => {
  it('remove a configuração e a leitura seguinte passa a devolver 404', async () => {
    const admin = await createUser('ADMIN');
    const key = randomKey();

    await request(app)
      .put(`/api/settings/${key}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ value: 'a-remover' });

    const deleteRes = await request(app)
      .delete(`/api/settings/${key}`)
      .set('Authorization', `Bearer ${admin.accessToken}`);
    expect(deleteRes.status).toBe(204);

    const getRes = await request(app)
      .get(`/api/settings/${key}`)
      .set('Authorization', `Bearer ${admin.accessToken}`);
    expect(getRes.status).toBe(404);
  });
});
