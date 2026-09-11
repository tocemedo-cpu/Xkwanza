import { z } from 'zod';

export const bannerIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid('Identificador inválido') }),
});

const httpUrl = z.string().trim().url('URL inválido');
const localPath = z.string().trim().regex(/^\/[^\s]*$/, 'Deve ser um URL absoluto ou um caminho começado por "/"');

export const createBannerSchema = z.object({
  body: z.object({
    imageUrl: z.union([httpUrl, localPath]),
    title: z.string().trim().max(120).optional(),
    subtitle: z.string().trim().max(240).optional(),
    ctaLabel: z.string().trim().max(60).optional(),
    ctaTo: z.string().trim().max(200).optional(),
    position: z.number().int().min(0).max(1000).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateBannerSchema = z.object({
  params: z.object({ id: z.string().uuid('Identificador inválido') }),
  body: z.object({
    imageUrl: z.union([httpUrl, localPath]).optional(),
    title: z.string().trim().max(120).nullable().optional(),
    subtitle: z.string().trim().max(240).nullable().optional(),
    ctaLabel: z.string().trim().max(60).nullable().optional(),
    ctaTo: z.string().trim().max(200).nullable().optional(),
    position: z.number().int().min(0).max(1000).optional(),
    isActive: z.boolean().optional(),
  }),
});

export type CreateBannerInput = z.infer<typeof createBannerSchema>['body'];
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>['body'];
