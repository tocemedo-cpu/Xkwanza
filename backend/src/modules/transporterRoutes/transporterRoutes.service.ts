import { Request } from 'express';
import { Prisma, TransportStatus } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/apiError';
import { recordAudit } from '../audit/audit.service';
import { AddStopInput, CreateRouteInput, UpdateRouteInput, UpdateStopInput } from './transporterRoutes.schema';

export const routeInclude = {
  stops: {
    orderBy: { sequence: 'asc' },
    include: {
      transportOrder: {
        include: {
          order: { select: { id: true, status: true, shippingAddress: true } },
        },
      },
    },
  },
} satisfies Prisma.RouteInclude;

// Perfil de transportador ainda por criar bloqueia toda a gestão de rotas — mesma mensagem
// usada no módulo de transporte (transport.service.ts) para manter consistência na app.
export async function getOwnTransporterOrThrow(userId: string) {
  const transporter = await prisma.transporter.findUnique({ where: { userId } });
  if (!transporter) throw ApiError.badRequest('Precisa de completar o perfil de transportador primeiro');
  return transporter;
}

async function getOwnedRouteOrThrow(transporterId: string, routeId: string) {
  const route = await prisma.route.findUnique({ where: { id: routeId } });
  if (!route) throw ApiError.notFound('Rota não encontrada');
  if (route.transporterId !== transporterId) throw ApiError.forbidden('Sem acesso a esta rota');
  return route;
}

export async function createRoute(userId: string, input: CreateRouteInput, req: Request) {
  const transporter = await getOwnTransporterOrThrow(userId);

  const route = await prisma.route.create({
    data: {
      transporterId: transporter.id,
      name: input.name,
      plannedDate: input.plannedDate,
    },
    include: routeInclude,
  });

  await recordAudit({
    userId,
    action: 'ROUTE_CREATED',
    entity: 'Route',
    entityId: route.id,
    result: 'SUCCESS',
    req,
  });

  return route;
}

export async function listMyRoutes(userId: string) {
  const transporter = await getOwnTransporterOrThrow(userId);

  return prisma.route.findMany({
    where: { transporterId: transporter.id },
    include: routeInclude,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getRoute(userId: string, routeId: string) {
  const transporter = await getOwnTransporterOrThrow(userId);
  await getOwnedRouteOrThrow(transporter.id, routeId);

  return prisma.route.findUniqueOrThrow({ where: { id: routeId }, include: routeInclude });
}

export async function updateRoute(userId: string, routeId: string, input: UpdateRouteInput, req: Request) {
  const transporter = await getOwnTransporterOrThrow(userId);
  await getOwnedRouteOrThrow(transporter.id, routeId);

  const route = await prisma.route.update({
    where: { id: routeId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.plannedDate !== undefined ? { plannedDate: input.plannedDate } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    },
    include: routeInclude,
  });

  await recordAudit({
    userId,
    action: 'ROUTE_UPDATED',
    entity: 'Route',
    entityId: route.id,
    result: 'SUCCESS',
    req,
  });

  return route;
}

export async function deleteRoute(userId: string, routeId: string, req: Request) {
  const transporter = await getOwnTransporterOrThrow(userId);
  await getOwnedRouteOrThrow(transporter.id, routeId);

  await prisma.route.delete({ where: { id: routeId } });

  await recordAudit({
    userId,
    action: 'ROUTE_DELETED',
    entity: 'Route',
    entityId: routeId,
    result: 'SUCCESS',
    req,
  });
}

export async function addStop(userId: string, routeId: string, input: AddStopInput, req: Request) {
  const transporter = await getOwnTransporterOrThrow(userId);
  await getOwnedRouteOrThrow(transporter.id, routeId);

  const transportOrder = await prisma.transportOrder.findUnique({ where: { id: input.transportOrderId } });
  if (!transportOrder) throw ApiError.notFound('Pedido de transporte não encontrado');
  if (transportOrder.transporterId !== transporter.id) {
    throw ApiError.badRequest('Este frete não pertence a este transportador');
  }
  if (transportOrder.status === TransportStatus.CANCELLED) {
    throw ApiError.badRequest('Este frete já foi cancelado');
  }

  const lastStop = await prisma.routeStop.findFirst({
    where: { routeId },
    orderBy: { sequence: 'desc' },
  });
  const nextSequence = (lastStop?.sequence ?? 0) + 1;

  let stop;
  try {
    stop = await prisma.routeStop.create({
      data: {
        routeId,
        transportOrderId: input.transportOrderId,
        sequence: nextSequence,
      },
      include: routeInclude.stops.include,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw ApiError.conflict('Este frete já está nesta rota');
    }
    throw error;
  }

  await recordAudit({
    userId,
    action: 'ROUTE_STOP_ADDED',
    entity: 'RouteStop',
    entityId: stop.id,
    result: 'SUCCESS',
    metadata: { routeId, transportOrderId: input.transportOrderId },
    req,
  });

  return stop;
}

async function getOwnedStopOrThrow(routeId: string, stopId: string) {
  const stop = await prisma.routeStop.findUnique({ where: { id: stopId } });
  if (!stop || stop.routeId !== routeId) throw ApiError.notFound('Paragem não encontrada nesta rota');
  return stop;
}

export async function updateStop(
  userId: string,
  routeId: string,
  stopId: string,
  input: UpdateStopInput,
  req: Request,
) {
  const transporter = await getOwnTransporterOrThrow(userId);
  await getOwnedRouteOrThrow(transporter.id, routeId);
  await getOwnedStopOrThrow(routeId, stopId);

  const stop = await prisma.routeStop.update({
    where: { id: stopId },
    data: {
      ...(input.sequence !== undefined ? { sequence: input.sequence } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    },
    include: routeInclude.stops.include,
  });

  await recordAudit({
    userId,
    action: 'ROUTE_STOP_UPDATED',
    entity: 'RouteStop',
    entityId: stop.id,
    result: 'SUCCESS',
    metadata: { routeId },
    req,
  });

  return stop;
}

export async function removeStop(userId: string, routeId: string, stopId: string, req: Request) {
  const transporter = await getOwnTransporterOrThrow(userId);
  await getOwnedRouteOrThrow(transporter.id, routeId);
  await getOwnedStopOrThrow(routeId, stopId);

  await prisma.routeStop.delete({ where: { id: stopId } });

  await recordAudit({
    userId,
    action: 'ROUTE_STOP_REMOVED',
    entity: 'RouteStop',
    entityId: stopId,
    result: 'SUCCESS',
    metadata: { routeId },
    req,
  });
}
