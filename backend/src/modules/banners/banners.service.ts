import { Request } from 'express';
import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/apiError';
import { recordAudit } from '../audit/audit.service';
import { CreateBannerInput, UpdateBannerInput } from './banners.schema';

// Consumida pela homepage pública — apenas banners activos, ordenados por posição.
export async function listActiveBanners() {
  return prisma.banner.findMany({
    where: { isActive: true },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
  });
}

export async function listAllBanners() {
  return prisma.banner.findMany({
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    include: { createdBy: { select: { id: true, name: true } } },
  });
}

export async function getBannerById(id: string) {
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) throw ApiError.notFound('Banner não encontrado');
  return banner;
}

export async function createBanner(adminId: string, input: CreateBannerInput, req?: Request) {
  const banner = await prisma.banner.create({
    data: {
      imageUrl: input.imageUrl,
      title: input.title,
      subtitle: input.subtitle,
      ctaLabel: input.ctaLabel,
      ctaTo: input.ctaTo,
      position: input.position ?? 0,
      isActive: input.isActive ?? true,
      createdById: adminId,
    },
  });

  await recordAudit({
    userId: adminId,
    action: 'BANNER_CREATED',
    entity: 'Banner',
    entityId: banner.id,
    result: 'SUCCESS',
    req,
  });

  return banner;
}

export async function updateBanner(adminId: string, id: string, input: UpdateBannerInput, req?: Request) {
  await getBannerById(id);

  const banner = await prisma.banner.update({
    where: { id },
    data: input,
  });

  await recordAudit({
    userId: adminId,
    action: 'BANNER_UPDATED',
    entity: 'Banner',
    entityId: banner.id,
    result: 'SUCCESS',
    metadata: input,
    req,
  });

  return banner;
}

export async function deleteBanner(adminId: string, id: string, req?: Request) {
  await getBannerById(id);
  await prisma.banner.delete({ where: { id } });

  await recordAudit({
    userId: adminId,
    action: 'BANNER_DELETED',
    entity: 'Banner',
    entityId: id,
    result: 'SUCCESS',
    req,
  });
}
