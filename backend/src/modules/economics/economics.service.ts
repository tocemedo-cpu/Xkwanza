import { OrderStatus, PaymentStatus, QuoteStatus, ReviewTargetType, SupportTicketStatus, TransportStatus, UserRole } from '@prisma/client';
import { prisma } from '../../database/prisma';

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// Últimos 6 meses (incluindo o actual), do mais antigo para o mais recente — para um gráfico simples.
function lastMonthKeys(count: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(monthKey(d));
  }
  return keys;
}

export async function getSellerStats(sellerId: string) {
  const items = await prisma.orderItem.findMany({
    where: { product: { ownerId: sellerId }, order: { status: OrderStatus.COMPLETED } },
    include: { order: { select: { id: true, createdAt: true } } },
  });

  const totalRevenue = items.reduce((sum, item) => sum + Number(item.lineTotal), 0);
  const totalItemsSold = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalOrders = new Set(items.map((item) => item.orderId)).size;

  const monthlyMap = new Map<string, number>();
  for (const item of items) {
    const key = monthKey(item.order.createdAt);
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + Number(item.lineTotal));
  }
  const monthlyRevenue = lastMonthKeys(6).map((month) => ({ month, revenue: monthlyMap.get(month) ?? 0 }));

  const [ratingAgg, publishedProducts] = await Promise.all([
    prisma.review.aggregate({
      where: { targetType: ReviewTargetType.SELLER, targetUserId: sellerId },
      _avg: { rating: true },
      _count: true,
    }),
    prisma.product.count({ where: { ownerId: sellerId, status: 'PUBLISHED' } }),
  ]);

  return {
    totalRevenue,
    totalItemsSold,
    totalOrders,
    publishedProducts,
    averageRating: ratingAgg._avg.rating ?? null,
    ratingCount: ratingAgg._count,
    monthlyRevenue,
  };
}

export async function getTransporterStats(transporterUserId: string) {
  const transporter = await prisma.transporter.findUnique({ where: { userId: transporterUserId } });
  if (!transporter) {
    return {
      totalEarnings: 0,
      totalDeliveries: 0,
      averageRating: null,
      ratingCount: 0,
      monthlyEarnings: lastMonthKeys(6).map((month) => ({ month, earnings: 0 })),
    };
  }

  const jobs = await prisma.transportOrder.findMany({
    where: { transporterId: transporter.id, status: TransportStatus.DELIVERED },
    select: { agreedPrice: true, deliveredAt: true },
  });

  const totalEarnings = jobs.reduce((sum, job) => sum + Number(job.agreedPrice ?? 0), 0);

  const monthlyMap = new Map<string, number>();
  for (const job of jobs) {
    if (!job.deliveredAt) continue;
    const key = monthKey(job.deliveredAt);
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + Number(job.agreedPrice ?? 0));
  }
  const monthlyEarnings = lastMonthKeys(6).map((month) => ({ month, earnings: monthlyMap.get(month) ?? 0 }));

  const ratingAgg = await prisma.review.aggregate({
    where: { targetType: ReviewTargetType.TRANSPORTER, targetUserId: transporterUserId },
    _avg: { rating: true },
    _count: true,
  });

  return {
    totalEarnings,
    totalDeliveries: jobs.length,
    averageRating: ratingAgg._avg.rating ?? null,
    ratingCount: ratingAgg._count,
    monthlyEarnings,
  };
}

// Uso administrativo — indicadores agregados de toda a plataforma, para "/admin/relatorios".
export async function getPlatformReport() {
  const [
    usersByRole,
    ordersByStatus,
    completedRevenue,
    pendingPayments,
    openSupportTickets,
    openQuoteRequests,
    activeProducts,
  ] = await Promise.all([
    prisma.user.groupBy({ by: ['role'], _count: true }),
    prisma.order.groupBy({ by: ['status'], _count: true }),
    prisma.order.aggregate({ where: { status: OrderStatus.COMPLETED }, _sum: { total: true } }),
    prisma.payment.count({ where: { status: PaymentStatus.PENDING } }),
    prisma.supportTicket.count({
      where: { status: { in: [SupportTicketStatus.OPEN, SupportTicketStatus.IN_PROGRESS, SupportTicketStatus.WAITING_ON_USER] } },
    }),
    prisma.quoteRequest.count({ where: { status: { in: [QuoteStatus.OPEN, QuoteStatus.PROPOSALS_RECEIVED, QuoteStatus.NEGOTIATING] } } }),
    prisma.product.count({ where: { status: 'PUBLISHED' } }),
  ]);

  return {
    usersByRole: Object.fromEntries(usersByRole.map((r) => [r.role, r._count])) as Record<UserRole, number>,
    ordersByStatus: Object.fromEntries(ordersByStatus.map((o) => [o.status, o._count])),
    totalRevenue: Number(completedRevenue._sum.total ?? 0),
    pendingPayments,
    openSupportTickets,
    openQuoteRequests,
    activeProducts,
  };
}
