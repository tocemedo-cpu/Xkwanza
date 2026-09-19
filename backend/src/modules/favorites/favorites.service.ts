import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/apiError';

const productSelect = {
  include: { photos: true, category: true, owner: { select: { id: true, name: true, isVerifiedBadge: true } } },
} as const;

export async function listMyFavorites(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { product: productSelect },
  });
  return favorites.map((f) => f.product);
}

export async function addFavorite(userId: string, productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw ApiError.notFound('Produto não encontrado');

  await prisma.favorite.upsert({
    where: { userId_productId: { userId, productId } },
    update: {},
    create: { userId, productId },
  });
}

export async function removeFavorite(userId: string, productId: string) {
  await prisma.favorite.deleteMany({ where: { userId, productId } });
}
