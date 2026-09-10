import { Request } from 'express';
import { NotificationType, Prisma, QuoteStatus, UserRole } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/apiError';
import { recordAudit } from '../audit/audit.service';
import { recordNotification } from '../notifications/notifications.service';
import { CreateProposalInput, CreateQuoteRequestInput, ListQuotesForAdminQuery } from './quotes.schema';

const SELLER_ROLES: UserRole[] = [UserRole.PRODUCER, UserRole.MERCHANT];
const OPEN_STATUSES: QuoteStatus[] = [QuoteStatus.OPEN, QuoteStatus.PROPOSALS_RECEIVED, QuoteStatus.NEGOTIATING];

const quoteInclude = {
  requester: { select: { id: true, name: true, phone: true, email: true } },
  product: { select: { id: true, name: true, ownerId: true } },
  proposals: {
    orderBy: { createdAt: 'asc' as const },
    include: { proposer: { select: { id: true, name: true, phone: true, email: true } } },
  },
};

function assertIsSeller(role: UserRole) {
  if (!SELLER_ROLES.includes(role)) {
    throw ApiError.forbidden('Apenas produtores e comerciantes podem responder a negociações');
  }
}

async function getQuoteOrThrow(id: string) {
  const quote = await prisma.quoteRequest.findUnique({ where: { id }, include: quoteInclude });
  if (!quote) throw ApiError.notFound('Negociação não encontrada');
  return quote;
}

export async function createQuoteRequest(requesterId: string, input: CreateQuoteRequestInput, req: Request) {
  if (input.productId) {
    const product = await prisma.product.findUnique({ where: { id: input.productId } });
    if (!product) throw ApiError.badRequest('Produto inválido');
  }

  const quote = await prisma.quoteRequest.create({
    data: {
      requesterId,
      productId: input.productId,
      description: input.description,
      quantity: input.quantity,
      deadline: input.deadline,
    },
    include: quoteInclude,
  });

  await recordAudit({
    userId: requesterId,
    action: 'QUOTE_REQUEST_CREATED',
    entity: 'QuoteRequest',
    entityId: quote.id,
    result: 'SUCCESS',
    req,
  });

  return quote;
}

export async function listMyQuoteRequests(requesterId: string) {
  return prisma.quoteRequest.findMany({
    where: { requesterId },
    include: quoteInclude,
    orderBy: { createdAt: 'desc' },
  });
}

// Vendedores vêem pedidos abertos a qualquer produtor/comerciante (sem produto associado) e os
// que apontam directamente a um dos seus próprios produtos.
export async function listOpenQuotesForSeller(sellerId: string, role: UserRole) {
  assertIsSeller(role);

  const where: Prisma.QuoteRequestWhereInput = {
    status: { in: OPEN_STATUSES },
    OR: [{ productId: null }, { product: { ownerId: sellerId } }],
  };

  return prisma.quoteRequest.findMany({
    where,
    include: quoteInclude,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getQuoteRequest(id: string, userId: string, role: UserRole) {
  const quote = await getQuoteOrThrow(id);

  const isStaff = role === UserRole.ADMIN || role === UserRole.SUPPORT;
  const isRequester = quote.requesterId === userId;
  const isSeller = SELLER_ROLES.includes(role);

  if (!isStaff && !isRequester && !isSeller) {
    throw ApiError.forbidden('Sem acesso a esta negociação');
  }

  return quote;
}

export async function createProposal(
  quoteRequestId: string,
  proposerId: string,
  role: UserRole,
  input: CreateProposalInput,
  req: Request,
) {
  assertIsSeller(role);
  const quote = await getQuoteOrThrow(quoteRequestId);

  if (!OPEN_STATUSES.includes(quote.status)) {
    throw ApiError.badRequest('Esta negociação já não aceita novas propostas');
  }

  const [proposal] = await prisma.$transaction([
    prisma.quoteProposal.create({
      data: { quoteRequestId, proposerId, price: input.price, message: input.message },
    }),
    prisma.quoteRequest.update({
      where: { id: quoteRequestId },
      data: { status: QuoteStatus.PROPOSALS_RECEIVED },
    }),
  ]);

  await recordAudit({
    userId: proposerId,
    action: 'QUOTE_PROPOSAL_CREATED',
    entity: 'QuoteRequest',
    entityId: quoteRequestId,
    result: 'SUCCESS',
    metadata: { proposalId: proposal.id, price: input.price.toString() },
    req,
  });

  await recordNotification({
    userId: quote.requesterId,
    type: NotificationType.QUOTE,
    title: 'Nova proposta na tua negociação',
    body: quote.description,
    metadata: { quoteRequestId, proposalId: proposal.id },
  });

  return getQuoteOrThrow(quoteRequestId);
}

export async function acceptProposal(quoteRequestId: string, proposalId: string, buyerId: string, req: Request) {
  const quote = await getQuoteOrThrow(quoteRequestId);
  if (quote.requesterId !== buyerId) throw ApiError.forbidden('Só quem pediu a cotação pode aceitar uma proposta');
  if (!OPEN_STATUSES.includes(quote.status)) throw ApiError.badRequest('Esta negociação já foi concluída');

  const proposal = quote.proposals.find((p) => p.id === proposalId);
  if (!proposal) throw ApiError.notFound('Proposta não encontrada');

  await prisma.$transaction([
    prisma.quoteProposal.update({ where: { id: proposalId }, data: { accepted: true } }),
    prisma.quoteRequest.update({ where: { id: quoteRequestId }, data: { status: QuoteStatus.ACCEPTED } }),
  ]);

  await recordAudit({
    userId: buyerId,
    action: 'QUOTE_PROPOSAL_ACCEPTED',
    entity: 'QuoteRequest',
    entityId: quoteRequestId,
    result: 'SUCCESS',
    metadata: { proposalId },
    req,
  });

  await recordNotification({
    userId: proposal.proposerId,
    type: NotificationType.QUOTE,
    title: 'A tua proposta foi aceite',
    body: quote.description,
    metadata: { quoteRequestId, proposalId },
  });

  return getQuoteOrThrow(quoteRequestId);
}

export async function cancelQuoteRequest(quoteRequestId: string, buyerId: string, req: Request) {
  const quote = await getQuoteOrThrow(quoteRequestId);
  if (quote.requesterId !== buyerId) throw ApiError.forbidden('Só quem pediu a cotação a pode cancelar');
  if (!OPEN_STATUSES.includes(quote.status)) throw ApiError.badRequest('Esta negociação já foi concluída');

  await prisma.quoteRequest.update({ where: { id: quoteRequestId }, data: { status: QuoteStatus.CANCELLED } });

  await recordAudit({
    userId: buyerId,
    action: 'QUOTE_REQUEST_CANCELLED',
    entity: 'QuoteRequest',
    entityId: quoteRequestId,
    result: 'SUCCESS',
    req,
  });

  return getQuoteOrThrow(quoteRequestId);
}

// Uso administrativo — supervisão de todas as negociações da plataforma.
export async function listQuotesForAdmin(query: ListQuotesForAdminQuery) {
  const [items, total] = await Promise.all([
    prisma.quoteRequest.findMany({
      include: quoteInclude,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.quoteRequest.count(),
  ]);
  return { items, total, page: query.page, pageSize: query.pageSize };
}
