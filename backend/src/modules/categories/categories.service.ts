import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/apiError';
import { CreateCategoryInput, UpdateCategoryInput } from './categories.schema';

// Lista plana — o frontend monta a árvore a partir de parentId.
export async function listCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

export async function createCategory(input: CreateCategoryInput) {
  const existing = await prisma.category.findFirst({ where: { OR: [{ name: input.name }, { slug: input.slug }] } });
  if (existing) throw ApiError.conflict('Já existe uma categoria com este nome ou slug');

  if (input.parentId) {
    const parent = await prisma.category.findUnique({ where: { id: input.parentId } });
    if (!parent) throw ApiError.badRequest('Categoria mãe não encontrada');
  }

  return prisma.category.create({ data: input });
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw ApiError.notFound('Categoria não encontrada');

  if (input.parentId) {
    if (input.parentId === id) throw ApiError.badRequest('Uma categoria não pode ser mãe de si própria');
    const parent = await prisma.category.findUnique({ where: { id: input.parentId } });
    if (!parent) throw ApiError.badRequest('Categoria mãe não encontrada');
  }

  return prisma.category.update({ where: { id }, data: input });
}

export async function deleteCategory(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { children: true, products: { take: 1 } },
  });
  if (!category) throw ApiError.notFound('Categoria não encontrada');
  if (category.children.length > 0) throw ApiError.conflict('Remova primeiro as subcategorias');
  if (category.products.length > 0) throw ApiError.conflict('Existem produtos associados a esta categoria');

  await prisma.category.delete({ where: { id } });
}
