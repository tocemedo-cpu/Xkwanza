import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/apiError';
import { CreateCategoryInput, UpdateCategoryInput } from './categories.schema';

// Lista plana — o frontend monta a árvore a partir de parentId.
export async function listCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

// Não há seed automático (uma base de dados nova ou de produção começa sempre sem categorias
// — só um ADMIN as cria, em /admin/categorias). Esta lista dá um ponto de partida razoável
// para um marketplace de produtos e serviços em Angola, sem impedir que sejam editadas ou
// removidas depois. Nomes/slugs existentes são ignorados (idempotente — pode ser chamado
// mais que uma vez sem duplicar nada).
const DEFAULT_CATEGORIES: { name: string; slug: string }[] = [
  { name: 'Hortícolas', slug: 'horticolas' },
  { name: 'Frutas', slug: 'frutas' },
  { name: 'Cereais e Tubérculos', slug: 'cereais-e-tuberculos' },
  { name: 'Leguminosas', slug: 'leguminosas' },
  { name: 'Pecuária e Carnes', slug: 'pecuaria-e-carnes' },
  { name: 'Pesca e Aquacultura', slug: 'pesca-e-aquacultura' },
  { name: 'Lacticínios e Ovos', slug: 'lacticinios-e-ovos' },
  { name: 'Bebidas', slug: 'bebidas' },
  { name: 'Artesanato', slug: 'artesanato' },
  { name: 'Vestuário e Têxteis', slug: 'vestuario-e-texteis' },
  { name: 'Materiais de Construção', slug: 'materiais-de-construcao' },
  { name: 'Combustíveis e Energia', slug: 'combustiveis-e-energia' },
  { name: 'Transporte e Logística', slug: 'transporte-e-logistica' },
  { name: 'Reparações e Manutenção', slug: 'reparacoes-e-manutencao' },
  { name: 'Construção e Obras', slug: 'construcao-e-obras' },
  { name: 'Beleza e Bem-estar', slug: 'beleza-e-bem-estar' },
  { name: 'Educação e Formação', slug: 'educacao-e-formacao' },
  { name: 'Serviços Domésticos', slug: 'servicos-domesticos' },
  { name: 'Serviços Agrícolas', slug: 'servicos-agricolas' },
  { name: 'Consultoria e Serviços Profissionais', slug: 'consultoria-e-servicos-profissionais' },
];

export async function seedDefaultCategories() {
  const result = await prisma.category.createMany({ data: DEFAULT_CATEGORIES, skipDuplicates: true });
  return { created: result.count, total: DEFAULT_CATEGORIES.length };
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
