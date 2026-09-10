import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from './app';
import { prisma } from './database/prisma';

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

describe('Suporte — /api/support/tickets', () => {
  it('cria um ticket, lista os próprios, e o agente responde e muda o estado', async () => {
    const buyer = await createUser('BUYER');
    const agent = await createUser('SUPPORT');

    const createRes = await request(app)
      .post('/api/support/tickets')
      .set('Authorization', `Bearer ${buyer.accessToken}`)
      .send({ subject: 'Não recebi a encomenda', description: 'O pedido está atrasado há uma semana.' });
    expect(createRes.status).toBe(201);
    expect(createRes.body.status).toBe('OPEN');
    const ticketId = createRes.body.id;

    const mineRes = await request(app)
      .get('/api/support/tickets/mine')
      .set('Authorization', `Bearer ${buyer.accessToken}`);
    expect(mineRes.status).toBe(200);
    expect(mineRes.body.some((t: { id: string }) => t.id === ticketId)).toBe(true);

    const strangerRes = await request(app)
      .get(`/api/support/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${(await createUser('BUYER')).accessToken}`);
    expect(strangerRes.status).toBe(403);

    const replyRes = await request(app)
      .post(`/api/support/tickets/${ticketId}/messages`)
      .set('Authorization', `Bearer ${agent.accessToken}`)
      .send({ body: 'Vamos verificar com o transportador.' });
    expect(replyRes.status).toBe(200);
    expect(replyRes.body.agentId).toBe(agent.userId);
    expect(replyRes.body.status).toBe('WAITING_ON_USER');
    expect(replyRes.body.messages).toHaveLength(1);

    const statusRes = await request(app)
      .patch(`/api/support/tickets/${ticketId}/status`)
      .set('Authorization', `Bearer ${agent.accessToken}`)
      .send({ status: 'RESOLVED' });
    expect(statusRes.status).toBe(200);
    expect(statusRes.body.status).toBe('RESOLVED');

    const buyerStatusAttempt = await request(app)
      .patch(`/api/support/tickets/${ticketId}/status`)
      .set('Authorization', `Bearer ${buyer.accessToken}`)
      .send({ status: 'CLOSED' });
    expect(buyerStatusAttempt.status).toBe(403);
  });
});

describe('Administração — bloqueio/desbloqueio e validação de contas', () => {
  it('bloqueia e desbloqueia uma conta, e impede o admin de se desactivar a si próprio', async () => {
    const admin = await createUser('ADMIN');
    const target = await createUser('BUYER');

    const block = await request(app)
      .patch(`/api/users/${target.userId}/status`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ isActive: false });
    expect(block.status).toBe(200);
    expect(block.body.isActive).toBe(false);

    const blockedLogin = await request(app)
      .post('/api/auth/login')
      .send({ identifier: target.phone, password: 'Password123' });
    expect(blockedLogin.status).toBe(403);

    const verify = await request(app)
      .patch(`/api/users/${target.userId}/status`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ isActive: true, isVerifiedBadge: true });
    expect(verify.status).toBe(200);
    expect(verify.body.isActive).toBe(true);
    expect(verify.body.isVerifiedBadge).toBe(true);

    const selfBlock = await request(app)
      .patch(`/api/users/${admin.userId}/status`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ isActive: false });
    expect(selfBlock.status).toBe(400);
  });
});

describe('Administração — produtos, pedidos, transportadores e auditoria', () => {
  it('lista produtos de qualquer dono e permite remover/despublicar', async () => {
    const producer = await createUser('PRODUCER');
    const admin = await createUser('ADMIN');

    const category = await prisma.category.create({
      data: { name: `Categoria Moderação ${Date.now()}`, slug: `categoria-moderacao-${Date.now()}` },
    });
    const categoryId = category.id;

    const productRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${producer.accessToken}`)
      .send({
        categoryId,
        name: 'Produto Moderação',
        description: 'Produto de teste para moderação administrativa.',
        price: 1000,
        unit: 'kg',
        stock: 10,
        province: 'Luanda',
        municipality: 'Luanda',
      });
    expect(productRes.status).toBe(201);

    const listRes = await request(app)
      .get('/api/products/admin')
      .set('Authorization', `Bearer ${admin.accessToken}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.items.some((p: { id: string }) => p.id === productRes.body.id)).toBe(true);

    const forbiddenList = await request(app)
      .get('/api/products/admin')
      .set('Authorization', `Bearer ${producer.accessToken}`);
    expect(forbiddenList.status).toBe(403);

    const moderateRes = await request(app)
      .patch(`/api/products/${productRes.body.id}/moderate`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ status: 'REMOVED' });
    expect(moderateRes.status).toBe(200);
    expect(moderateRes.body.status).toBe('REMOVED');
  });

  it('lista todos os pedidos e todos os transportadores para a administração', async () => {
    const admin = await createUser('ADMIN');

    const ordersRes = await request(app)
      .get('/api/orders/admin')
      .set('Authorization', `Bearer ${admin.accessToken}`);
    expect(ordersRes.status).toBe(200);
    expect(ordersRes.body).toHaveProperty('items');

    const transporter = await createUser('TRANSPORTER');
    const transportersRes = await request(app)
      .get('/api/transporters/admin')
      .set('Authorization', `Bearer ${admin.accessToken}`);
    expect(transportersRes.status).toBe(200);
    expect(transportersRes.body.items.some((t: { userId: string }) => t.userId === transporter.userId)).toBe(true);

    const forbiddenOrders = await request(app)
      .get('/api/orders/admin')
      .set('Authorization', `Bearer ${transporter.accessToken}`);
    expect(forbiddenOrders.status).toBe(403);
  });

  it('regista e lista eventos de auditoria só para administração', async () => {
    const admin = await createUser('ADMIN');
    const buyer = await createUser('BUYER');

    await request(app)
      .patch(`/api/users/${buyer.userId}/status`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ isVerifiedBadge: true });

    const auditRes = await request(app)
      .get('/api/audit-logs')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .query({ action: 'USER_VERIFIED', userId: admin.userId });
    expect(auditRes.status).toBe(200);
    expect(auditRes.body.items.some((log: { entityId: string }) => log.entityId === buyer.userId)).toBe(true);

    const forbiddenAudit = await request(app)
      .get('/api/audit-logs')
      .set('Authorization', `Bearer ${buyer.accessToken}`);
    expect(forbiddenAudit.status).toBe(403);
  });
});

describe('Marketplace — filtro por município', () => {
  it('filtra produtos por município', async () => {
    const producer = await createUser('PRODUCER');
    const category = await prisma.category.create({
      data: { name: `Categoria Município ${Date.now()}`, slug: `categoria-municipio-${Date.now()}` },
    });
    const categoryId = category.id;

    const created = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${producer.accessToken}`)
      .send({
        categoryId,
        name: 'Produto Kilamba',
        description: 'Produto de teste para filtro de município.',
        price: 500,
        unit: 'unidade',
        stock: 5,
        province: 'Luanda',
        municipality: 'Kilamba Kiaxi',
      });
    expect(created.status).toBe(201);
    await request(app)
      .post(`/api/products/${created.body.id}/photos`)
      .set('Authorization', `Bearer ${producer.accessToken}`)
      .send({ url: 'https://example.com/foto.jpg' });
    await request(app)
      .post(`/api/products/${created.body.id}/publish`)
      .set('Authorization', `Bearer ${producer.accessToken}`);

    const filtered = await request(app).get('/api/products').query({ municipality: 'Kilamba' });
    expect(filtered.status).toBe(200);
    expect(filtered.body.items.some((p: { id: string }) => p.id === created.body.id)).toBe(true);

    const noMatch = await request(app).get('/api/products').query({ municipality: 'Município Inexistente XYZ' });
    expect(noMatch.body.items.some((p: { id: string }) => p.id === created.body.id)).toBe(false);
  });
});
