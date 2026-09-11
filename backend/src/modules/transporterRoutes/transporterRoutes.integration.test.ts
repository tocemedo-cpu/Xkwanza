import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { OrderStatus, TransportStatus } from '@prisma/client';
import { createApp } from '../../app';
import { prisma } from '../../database/prisma';

// Testes de integração contra uma base de dados Postgres real, tal como app.integration.test.ts —
// ficheiro autocontido (helpers próprios) para não colidir com edições concorrentes nesse ficheiro.
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

// Completa o perfil de transportador (PUT /api/transporters/me) e devolve o id do perfil
// Transporter (distinto do userId — é a este id que Route.transporterId aponta).
async function completeTransporterProfile(accessToken: string): Promise<string> {
  const res = await request(app)
    .put('/api/transporters/me')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ vehicleType: 'Camião', vehiclePlate: 'LD-01-99-AB' });
  expect(res.status).toBe(200);
  return res.body.id as string;
}

// Cria a cadeia mínima Order -> TransportOrder atribuída a um transportador (via id do perfil
// Transporter, não do userId), com um estado não cancelado, para servir de paragem de rota.
async function createAssignedTransportOrder(buyerUserId: string, transporterId: string): Promise<string> {
  const address = await prisma.address.create({
    data: { userId: buyerUserId, province: 'Luanda', municipality: 'Luanda' },
  });

  const category = await prisma.category.create({
    data: { name: `Categoria Rotas ${Date.now()}-${Math.random()}`, slug: `categoria-rotas-${Date.now()}-${Math.random()}` },
  });

  const product = await prisma.product.create({
    data: {
      ownerId: buyerUserId,
      categoryId: category.id,
      name: 'Produto para transporte',
      description: 'Produto de teste para planeamento de rotas.',
      price: 1000,
    },
  });

  const order = await prisma.order.create({
    data: {
      buyerId: buyerUserId,
      shippingAddressId: address.id,
      status: OrderStatus.READY_FOR_PICKUP,
      subtotal: 1000,
      total: 1000,
    },
  });

  await prisma.orderItem.create({
    data: { orderId: order.id, productId: product.id, quantity: 1, unitPrice: 1000, lineTotal: 1000 },
  });

  const transportOrder = await prisma.transportOrder.create({
    data: { orderId: order.id, transporterId, status: TransportStatus.ASSIGNED },
  });

  return transportOrder.id;
}

describe('Planeamento de rotas do transportador', () => {
  it('rejeita criar rota sem perfil de transportador (400)', async () => {
    const transporter = await createUser('TRANSPORTER');
    // O registo cria sempre um perfil Transporter (mesmo que vazio) — para exercitar a
    // validação defensiva do módulo (mesma usada por transport.service.ts), removemo-lo aqui.
    await prisma.transporter.delete({ where: { userId: transporter.userId } });

    const res = await request(app)
      .post('/api/transporter-routes')
      .set('Authorization', `Bearer ${transporter.accessToken}`)
      .send({ name: 'Rota Luanda-Benguela' });

    expect(res.status).toBe(400);
  });

  it('permite criar uma rota depois de completar o perfil de transportador (201)', async () => {
    const transporter = await createUser('TRANSPORTER');
    await completeTransporterProfile(transporter.accessToken);

    const res = await request(app)
      .post('/api/transporter-routes')
      .set('Authorization', `Bearer ${transporter.accessToken}`)
      .send({ name: 'Rota Luanda-Benguela' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Rota Luanda-Benguela');
    expect(res.body.status).toBe('PLANNED');
    expect(res.body.stops).toEqual([]);
  });

  it('adiciona uma paragem para um frete atribuído a este transportador, começando a sequência em 1', async () => {
    const transporter = await createUser('TRANSPORTER');
    const transporterId = await completeTransporterProfile(transporter.accessToken);
    const buyer = await createUser('BUYER');

    const routeRes = await request(app)
      .post('/api/transporter-routes')
      .set('Authorization', `Bearer ${transporter.accessToken}`)
      .send({ name: 'Rota com paragens' });
    const routeId = routeRes.body.id as string;

    const transportOrderId = await createAssignedTransportOrder(buyer.userId, transporterId);

    const stopRes = await request(app)
      .post(`/api/transporter-routes/${routeId}/stops`)
      .set('Authorization', `Bearer ${transporter.accessToken}`)
      .send({ transportOrderId });

    expect(stopRes.status).toBe(201);
    expect(stopRes.body.sequence).toBe(1);
    expect(stopRes.body.status).toBe('PENDING');
  });

  it('rejeita adicionar o mesmo frete duas vezes à mesma rota (409)', async () => {
    const transporter = await createUser('TRANSPORTER');
    const transporterId = await completeTransporterProfile(transporter.accessToken);
    const buyer = await createUser('BUYER');

    const routeRes = await request(app)
      .post('/api/transporter-routes')
      .set('Authorization', `Bearer ${transporter.accessToken}`)
      .send({ name: 'Rota duplicada' });
    const routeId = routeRes.body.id as string;

    const transportOrderId = await createAssignedTransportOrder(buyer.userId, transporterId);

    const first = await request(app)
      .post(`/api/transporter-routes/${routeId}/stops`)
      .set('Authorization', `Bearer ${transporter.accessToken}`)
      .send({ transportOrderId });
    expect(first.status).toBe(201);

    const second = await request(app)
      .post(`/api/transporter-routes/${routeId}/stops`)
      .set('Authorization', `Bearer ${transporter.accessToken}`)
      .send({ transportOrderId });
    expect(second.status).toBe(409);
  });

  it('rejeita adicionar um frete atribuído a outro transportador (400)', async () => {
    const transporter = await createUser('TRANSPORTER');
    await completeTransporterProfile(transporter.accessToken);

    const otherTransporter = await createUser('TRANSPORTER');
    const otherTransporterId = await completeTransporterProfile(otherTransporter.accessToken);
    const buyer = await createUser('BUYER');

    const routeRes = await request(app)
      .post('/api/transporter-routes')
      .set('Authorization', `Bearer ${transporter.accessToken}`)
      .send({ name: 'Rota de outro' });
    const routeId = routeRes.body.id as string;

    const foreignTransportOrderId = await createAssignedTransportOrder(buyer.userId, otherTransporterId);

    const res = await request(app)
      .post(`/api/transporter-routes/${routeId}/stops`)
      .set('Authorization', `Bearer ${transporter.accessToken}`)
      .send({ transportOrderId: foreignTransportOrderId });

    expect(res.status).toBe(400);
  });

  it('reordena uma paragem através de PATCH e reflecte a nova sequência no GET', async () => {
    const transporter = await createUser('TRANSPORTER');
    const transporterId = await completeTransporterProfile(transporter.accessToken);
    const buyer = await createUser('BUYER');

    const routeRes = await request(app)
      .post('/api/transporter-routes')
      .set('Authorization', `Bearer ${transporter.accessToken}`)
      .send({ name: 'Rota a reordenar' });
    const routeId = routeRes.body.id as string;

    const transportOrderId1 = await createAssignedTransportOrder(buyer.userId, transporterId);
    const transportOrderId2 = await createAssignedTransportOrder(buyer.userId, transporterId);

    const stop1 = await request(app)
      .post(`/api/transporter-routes/${routeId}/stops`)
      .set('Authorization', `Bearer ${transporter.accessToken}`)
      .send({ transportOrderId: transportOrderId1 });
    expect(stop1.body.sequence).toBe(1);

    const stop2 = await request(app)
      .post(`/api/transporter-routes/${routeId}/stops`)
      .set('Authorization', `Bearer ${transporter.accessToken}`)
      .send({ transportOrderId: transportOrderId2 });
    expect(stop2.body.sequence).toBe(2);

    const patchRes = await request(app)
      .patch(`/api/transporter-routes/${routeId}/stops/${stop1.body.id}`)
      .set('Authorization', `Bearer ${transporter.accessToken}`)
      .send({ sequence: 5 });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.sequence).toBe(5);

    const getRes = await request(app)
      .get(`/api/transporter-routes/${routeId}`)
      .set('Authorization', `Bearer ${transporter.accessToken}`);
    expect(getRes.status).toBe(200);
    const updatedStop = getRes.body.stops.find((s: { id: string }) => s.id === stop1.body.id);
    expect(updatedStop.sequence).toBe(5);
    // ordenação por sequência ascendente — a paragem 2 (sequência 2) deve vir antes da 1 (agora 5)
    expect(getRes.body.stops[0].id).toBe(stop2.body.id);
    expect(getRes.body.stops[1].id).toBe(stop1.body.id);
  });

  it('impede outro transportador de ver, editar ou apagar a rota (403/404)', async () => {
    const owner = await createUser('TRANSPORTER');
    await completeTransporterProfile(owner.accessToken);

    const intruder = await createUser('TRANSPORTER');
    await completeTransporterProfile(intruder.accessToken);

    const routeRes = await request(app)
      .post('/api/transporter-routes')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ name: 'Rota privada' });
    const routeId = routeRes.body.id as string;

    const getRes = await request(app)
      .get(`/api/transporter-routes/${routeId}`)
      .set('Authorization', `Bearer ${intruder.accessToken}`);
    expect(getRes.status).toBe(403);

    const patchRes = await request(app)
      .patch(`/api/transporter-routes/${routeId}`)
      .set('Authorization', `Bearer ${intruder.accessToken}`)
      .send({ name: 'Rota roubada' });
    expect(patchRes.status).toBe(403);

    const deleteRes = await request(app)
      .delete(`/api/transporter-routes/${routeId}`)
      .set('Authorization', `Bearer ${intruder.accessToken}`);
    expect(deleteRes.status).toBe(403);

    // a rota continua intacta para o dono
    const ownerGetRes = await request(app)
      .get(`/api/transporter-routes/${routeId}`)
      .set('Authorization', `Bearer ${owner.accessToken}`);
    expect(ownerGetRes.status).toBe(200);
  });
});
