import { Request } from 'express';
import { Prisma, ProductStatus, UserRole } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/apiError';
import { recordAudit } from '../audit/audit.service';
import {
  AdminListProductsQuery,
  CreateProductInput,
  ListProductsQuery,
  ModerateProductInput,
  UpdateProductInput,
} from './products.schema';

const PRODUCT_OWNER_ROLES: UserRole[] = [UserRole.PRODUCER, UserRole.MERCHANT];

const publicInclude = {
  photos: true,
  category: true,
  owner: { select: { id: true, name: true, isVerifiedBadge: true, trustLevel: true } },
} satisfies Prisma.ProductInclude;

export function assertCanOwnProducts(role: UserRole) {
  if (!PRODUCT_OWNER_ROLES.includes(role)) {
    throw ApiError.forbidden('Apenas produtores e comerciantes podem gerir produtos');
  }
}

async function getOwnedProductOrThrow(id: string, ownerId: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw ApiError.notFound('Produto não encontrado');
  if (product.ownerId !== ownerId) throw ApiError.forbidden('Este produto não lhe pertence');
  return product;
}

export async function listProducts(query: ListProductsQuery) {
  const where: Prisma.ProductWhereInput = {
    status: query.ownerId ? undefined : ProductStatus.PUBLISHED,
    ownerId: query.ownerId,
    categoryId: query.categoryId,
    province: query.province,
    municipality: query.municipality ? { contains: query.municipality, mode: 'insensitive' } : undefined,
    ...(query.search
      ? { OR: [{ name: { contains: query.search, mode: 'insensitive' } }, { description: { contains: query.search, mode: 'insensitive' } }] }
      : {}),
    ...(query.minPrice !== undefined || query.maxPrice !== undefined
      ? { price: { gte: query.minPrice, lte: query.maxPrice } }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: publicInclude,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page: query.page, pageSize: query.pageSize };
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({ where: { id }, include: publicInclude });
  if (!product) throw ApiError.notFound('Produto não encontrado');
  return product;
}

// Lista os produtos do próprio dono, incluindo rascunhos e não publicados.
export async function listMyProducts(ownerId: string) {
  return prisma.product.findMany({ where: { ownerId }, include: publicInclude, orderBy: { createdAt: 'desc' } });
}

export async function createProduct(ownerId: string, input: CreateProductInput) {
  const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
  if (!category) throw ApiError.badRequest('Categoria inválida');

  return prisma.product.create({
    data: { ...input, ownerId, status: ProductStatus.DRAFT },
    include: publicInclude,
  });
}

export async function updateProduct(ownerId: string, id: string, input: UpdateProductInput) {
  await getOwnedProductOrThrow(id, ownerId);

  if (input.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!category) throw ApiError.badRequest('Categoria inválida');
  }

  return prisma.product.update({ where: { id }, data: input, include: publicInclude });
}

export async function deleteProduct(ownerId: string, id: string) {
  await getOwnedProductOrThrow(id, ownerId);
  await prisma.product.delete({ where: { id } });
}

export async function setProductPublished(ownerId: string, id: string, publish: boolean, req: Request) {
  const product = await getOwnedProductOrThrow(id, ownerId);

  if (publish) {
    const photoCount = await prisma.productPhoto.count({ where: { productId: id, uploadedComplete: true } });
    if (photoCount === 0) throw ApiError.badRequest('Adicione pelo menos uma fotografia antes de publicar');
    if (product.stock <= 0) throw ApiError.badRequest('Defina stock disponível antes de publicar');
  }

  const updated = await prisma.product.update({
    where: { id },
    data: { status: publish ? ProductStatus.PUBLISHED : ProductStatus.UNPUBLISHED },
    include: publicInclude,
  });

  await recordAudit({
    userId: ownerId,
    action: publish ? 'PRODUCT_PUBLISHED' : 'PRODUCT_UNPUBLISHED',
    entity: 'Product',
    entityId: id,
    result: 'SUCCESS',
    req,
  });

  return updated;
}

export async function addProductPhoto(ownerId: string, id: string, url: string) {
  await getOwnedProductOrThrow(id, ownerId);
  return prisma.productPhoto.create({ data: { productId: id, url, uploadedComplete: true } });
}

export async function removeProductPhoto(ownerId: string, id: string, photoId: string) {
  await getOwnedProductOrThrow(id, ownerId);
  const photo = await prisma.productPhoto.findUnique({ where: { id: photoId } });
  if (!photo || photo.productId !== id) throw ApiError.notFound('Fotografia não encontrada');
  await prisma.productPhoto.delete({ where: { id: photoId } });
}

// Moderação — administração vê anúncios de qualquer dono, em qualquer estado (incluindo
// rascunhos), ao contrário da listagem pública que só mostra PUBLISHED.
export async function listProductsForAdmin(query: AdminListProductsQuery) {
  const where: Prisma.ProductWhereInput = {
    status: query.status,
    ...(query.search
      ? { OR: [{ name: { contains: query.search, mode: 'insensitive' } }, { description: { contains: query.search, mode: 'insensitive' } }] }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: publicInclude,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page: query.page, pageSize: query.pageSize };
}

// Moderação — a administração pode despublicar ou remover qualquer anúncio, independentemente
// do dono (ex: conteúdo impróprio, denúncia). REMOVED nunca é apagado da base de dados —
// fica visível no histórico e na auditoria.
export async function moderateProduct(adminId: string, id: string, input: ModerateProductInput, req: Request) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw ApiError.notFound('Produto não encontrado');

  const updated = await prisma.product.update({
    where: { id },
    data: { status: input.status },
    include: publicInclude,
  });

  await recordAudit({
    userId: adminId,
    action: input.status === ProductStatus.REMOVED ? 'PRODUCT_REMOVED_BY_ADMIN' : 'PRODUCT_UNPUBLISHED_BY_ADMIN',
    entity: 'Product',
    entityId: id,
    result: 'SUCCESS',
    req,
  });

  return updated;
}
