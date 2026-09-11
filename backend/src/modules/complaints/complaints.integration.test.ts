import { describe, expect, it } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createApp } from '../../app';
import { prisma } from '../../database/prisma';
import { complaintsRouter } from './complaints.routes';
import { notFoundHandler, errorHandler } from '../../middleware/error.middleware';

// Testes de integração contra uma base de dados Postgres real, sem mocks. `app` (createApp())
// serve só para o fluxo de autenticação (registo/login) — o roteador de reclamações ainda não
// está montado em app.ts (fica a cargo doutra tarefa em curso), por isso usamos um mini-app
// dedicado, com a mesma app.use('/api/complaints', ...) que app.ts virá a ter, para exercitar
// o módulo de ponta a ponta. Os tokens JWT emitidos por `app` são válidos em `complaintsApp`
// porque ambos partilham a mesma configuração e base de dados.
const app = createApp();

const complaintsApp = express();
complaintsApp.use(express.json());
complaintsApp.use('/api/complaints', complaintsRouter);
complaintsApp.use(notFoundHandler);
complaintsApp.use(errorHandler);

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

describe('POST /api/complaints', () => {
  it('um comprador cria uma reclamação e ela aparece em GET /mine', async () => {
    const buyer = await createUser('BUYER');

    const createRes = await request(complaintsApp)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${buyer.accessToken}`)
      .send({ subject: 'Produto não entregue', description: 'Paguei mas o produto nunca chegou ao destino.' });

    expect(createRes.status).toBe(201);
    expect(createRes.body.status).toBe('OPEN');
    expect(createRes.body.complainant.id).toBe(buyer.userId);

    const mineRes = await request(complaintsApp).get('/api/complaints/mine').set('Authorization', `Bearer ${buyer.accessToken}`);

    expect(mineRes.status).toBe(200);
    expect(mineRes.body.some((c: { id: string }) => c.id === createRes.body.id)).toBe(true);
  });
});

describe('GET /api/complaints/:id', () => {
  it('um utilizador que não é dono nem da equipa não pode ver a reclamação de outro (403)', async () => {
    const buyer = await createUser('BUYER');
    const outsider = await createUser('BUYER');

    const createRes = await request(complaintsApp)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${buyer.accessToken}`)
      .send({ subject: 'Problema com a encomenda', description: 'A encomenda chegou danificada e incompleta.' });
    expect(createRes.status).toBe(201);

    const getRes = await request(complaintsApp)
      .get(`/api/complaints/${createRes.body.id}`)
      .set('Authorization', `Bearer ${outsider.accessToken}`);

    expect(getRes.status).toBe(403);
  });
});

describe('GET /api/complaints', () => {
  it('a equipa de suporte pode listar todas as reclamações, mas um comprador recebe 403', async () => {
    const buyer = await createUser('BUYER');
    const support = await createUser('SUPPORT');

    const createRes = await request(complaintsApp)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${buyer.accessToken}`)
      .send({ subject: 'Cobrança indevida', description: 'Fui cobrado duas vezes pela mesma encomenda.' });
    expect(createRes.status).toBe(201);

    const staffListRes = await request(complaintsApp).get('/api/complaints').set('Authorization', `Bearer ${support.accessToken}`);
    expect(staffListRes.status).toBe(200);
    expect(staffListRes.body.items.some((c: { id: string }) => c.id === createRes.body.id)).toBe(true);

    const buyerListRes = await request(complaintsApp).get('/api/complaints').set('Authorization', `Bearer ${buyer.accessToken}`);
    expect(buyerListRes.status).toBe(403);
  });
});

describe('POST /api/complaints/:id/messages', () => {
  it('a resposta da equipa sem agente atribuído fica com o autor como agente e estado UNDER_REVIEW', async () => {
    const buyer = await createUser('BUYER');
    const support = await createUser('SUPPORT');

    const createRes = await request(complaintsApp)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${buyer.accessToken}`)
      .send({ subject: 'Transportador não apareceu', description: 'O transportador não apareceu na hora combinada.' });
    expect(createRes.status).toBe(201);

    const replyRes = await request(complaintsApp)
      .post(`/api/complaints/${createRes.body.id}/messages`)
      .set('Authorization', `Bearer ${support.accessToken}`)
      .send({ body: 'Estamos a investigar o caso.' });

    expect(replyRes.status).toBe(200);
    expect(replyRes.body.agent?.id).toBe(support.userId);
    expect(replyRes.body.status).toBe('UNDER_REVIEW');
    expect(replyRes.body.messages.length).toBe(1);
  });

  it('depois de resolvida, não é possível enviar novas mensagens (400)', async () => {
    const buyer = await createUser('BUYER');
    const admin = await createUser('ADMIN');

    const createRes = await request(complaintsApp)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${buyer.accessToken}`)
      .send({ subject: 'Reembolso não processado', description: 'Pedi reembolso há uma semana e nada aconteceu.' });
    expect(createRes.status).toBe(201);

    const resolveRes = await request(complaintsApp)
      .patch(`/api/complaints/${createRes.body.id}/status`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ status: 'RESOLVED', resolutionNote: 'Reembolso processado manualmente pelo suporte.' });
    expect(resolveRes.status).toBe(200);

    const messageRes = await request(complaintsApp)
      .post(`/api/complaints/${createRes.body.id}/messages`)
      .set('Authorization', `Bearer ${buyer.accessToken}`)
      .send({ body: 'Obrigado.' });

    expect(messageRes.status).toBe(400);
  });
});

describe('PATCH /api/complaints/:id/status', () => {
  it('rejeita RESOLVED sem nota de resolução (400) e aceita com nota (200)', async () => {
    const buyer = await createUser('BUYER');
    const admin = await createUser('ADMIN');

    const createRes = await request(complaintsApp)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${buyer.accessToken}`)
      .send({ subject: 'Produto com defeito', description: 'O produto recebido veio com defeito de fabrico.' });
    expect(createRes.status).toBe(201);

    const missingNoteRes = await request(complaintsApp)
      .patch(`/api/complaints/${createRes.body.id}/status`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ status: 'RESOLVED' });
    expect(missingNoteRes.status).toBe(400);

    const withNoteRes = await request(complaintsApp)
      .patch(`/api/complaints/${createRes.body.id}/status`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ status: 'RESOLVED', resolutionNote: 'Produto substituído sem custos.' });
    expect(withNoteRes.status).toBe(200);
    expect(withNoteRes.body.status).toBe('RESOLVED');
    expect(withNoteRes.body.resolutionNote).toBe('Produto substituído sem custos.');
  });
});
