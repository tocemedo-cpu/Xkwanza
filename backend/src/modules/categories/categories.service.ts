import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/apiError';
import { CreateCategoryInput, UpdateCategoryInput } from './categories.schema';

// Lista plana — o frontend monta a árvore a partir de parentId.
export async function listCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Não há seed automático (uma base de dados nova ou de produção começa sempre sem categorias
// — só um ADMIN as cria, em /admin/categorias). Esta árvore dá um ponto de partida em duas
// camadas (categoria principal → subcategoria) para um marketplace de produtos e serviços em
// Angola: o utilizador escolhe primeiro a principal e só depois a subcategoria, o que mantém a
// publicação simples mesmo havendo muitas categorias no total. Os nomes de subcategoria podem
// repetir-se entre ramos diferentes (ex: "Acessórios" em Moda e em Eletrónica) — só o slug
// precisa de ser globalmente único, por isso o slug de cada subcategoria leva o slug da mãe
// como prefixo. As entradas de Serviços não têm subcategorias — ficam directamente
// seleccionáveis como categoria principal.
const DEFAULT_CATEGORY_TREE: { name: string; children?: string[] }[] = [
  {
    name: 'Agricultura e Produtos do Campo',
    children: ['Frutas', 'Hortaliças', 'Cereais', 'Tubérculos', 'Leguminosas', 'Produtos agrícolas', 'Sementes e mudas'],
  },
  {
    name: 'Pecuária e Produtos Animais',
    children: ['Carne', 'Ovos', 'Leite e derivados', 'Animais vivos', 'Ração'],
  },
  {
    name: 'Pesca e Produtos do Mar',
    children: ['Peixe', 'Marisco', 'Camarão', 'Outros produtos da pesca'],
  },
  {
    name: 'Alimentos e Bebidas',
    children: ['Alimentos processados', 'Bebidas', 'Padaria e pastelaria', 'Produtos caseiros'],
  },
  {
    name: 'Moda e Vestuário',
    children: ['Roupa', 'Calçado', 'Bolsas', 'Acessórios', 'Tecidos'],
  },
  {
    name: 'Casa e Mobiliário',
    children: ['Móveis', 'Decoração', 'Utensílios domésticos', 'Cozinha', 'Eletrodomésticos'],
  },
  {
    name: 'Eletrónica e Tecnologia',
    children: ['Telemóveis', 'Computadores', 'Acessórios', 'Equipamentos eletrónicos'],
  },
  {
    name: 'Construção e Ferramentas',
    children: ['Materiais de construção', 'Ferramentas', 'Equipamentos', 'Tintas', 'Canalização e eletricidade'],
  },
  {
    name: 'Automóvel e Transportes',
    children: ['Peças', 'Pneus', 'Acessórios', 'Motorizadas', 'Bicicletas'],
  },
  {
    name: 'Beleza e Cuidados Pessoais',
    children: ['Cosméticos', 'Cabelo', 'Perfumaria', 'Higiene pessoal'],
  },
  {
    name: 'Artesanato e Produção Local',
    children: ['Artesanato', 'Obras de arte', 'Produtos tradicionais', 'Produtos personalizados'],
  },
  {
    name: 'Material Escolar e Escritório',
    children: ['Material escolar', 'Livros', 'Papelaria', 'Material de escritório'],
  },
  {
    name: 'Saúde e Bem-estar',
    children: ['Produtos de higiene', 'Equipamentos de bem-estar', 'Produtos naturais'],
  },
  // Serviços — sem subcategorias, seleccionáveis directamente.
  { name: 'Construção e Reparação' },
  { name: 'Transporte e Entregas' },
  { name: 'Agricultura e Serviços Rurais' },
  { name: 'Tecnologia e Informática' },
  { name: 'Educação e Formação' },
  { name: 'Consultoria e Serviços Profissionais' },
  { name: 'Limpeza e Manutenção' },
  { name: 'Beleza e Estética' },
  { name: 'Alimentação e Catering' },
  { name: 'Eventos e Entretenimento' },
  { name: 'Fotografia e Vídeo' },
  { name: 'Serviços Automóveis' },
  { name: 'Serviços para Casa' },
  { name: 'Costura e Personalização' },
  { name: 'Outros Serviços' },
];

// Idempotente e "auto-reparador": procura sempre pelo slug (globalmente único e determinístico
// a partir do nome), e se a categoria já existir mas estiver no sítio errado da árvore (ex:
// ficou de um seed anterior sem hierarquia), corrige o parentId em vez de a ignorar.
async function upsertCategory(name: string, slug: string, parentId: string | null): Promise<{ id: string; changed: boolean }> {
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    if (existing.parentId !== parentId) {
      await prisma.category.update({ where: { id: existing.id }, data: { parentId } });
      return { id: existing.id, changed: true };
    }
    return { id: existing.id, changed: false };
  }
  const created = await prisma.category.create({ data: { name, slug, parentId } });
  return { id: created.id, changed: true };
}

export async function seedDefaultCategories() {
  let created = 0;
  let total = 0;

  for (const parent of DEFAULT_CATEGORY_TREE) {
    total += 1;
    const parentSlug = slugify(parent.name);
    const parentResult = await upsertCategory(parent.name, parentSlug, null);
    if (parentResult.changed) created += 1;

    for (const childName of parent.children ?? []) {
      total += 1;
      const childSlug = `${parentSlug}-${slugify(childName)}`;
      const childResult = await upsertCategory(childName, childSlug, parentResult.id);
      if (childResult.changed) created += 1;
    }
  }

  return { created, total };
}

export async function createCategory(input: CreateCategoryInput) {
  const slugConflict = await prisma.category.findUnique({ where: { slug: input.slug } });
  if (slugConflict) throw ApiError.conflict('Já existe uma categoria com este slug');

  const parentId = input.parentId ?? null;
  const siblingConflict = await prisma.category.findFirst({ where: { name: input.name, parentId } });
  if (siblingConflict) throw ApiError.conflict('Já existe uma categoria com este nome no mesmo nível');

  if (parentId) {
    const parent = await prisma.category.findUnique({ where: { id: parentId } });
    if (!parent) throw ApiError.badRequest('Categoria mãe não encontrada');
  }

  return prisma.category.create({ data: input });
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw ApiError.notFound('Categoria não encontrada');

  if (input.slug && input.slug !== category.slug) {
    const slugConflict = await prisma.category.findUnique({ where: { slug: input.slug } });
    if (slugConflict) throw ApiError.conflict('Já existe uma categoria com este slug');
  }

  if (input.parentId) {
    if (input.parentId === id) throw ApiError.badRequest('Uma categoria não pode ser mãe de si própria');
    const parent = await prisma.category.findUnique({ where: { id: input.parentId } });
    if (!parent) throw ApiError.badRequest('Categoria mãe não encontrada');
  }

  const nextName = input.name ?? category.name;
  const nextParentId = input.parentId !== undefined ? input.parentId : category.parentId;
  const siblingConflict = await prisma.category.findFirst({
    where: { name: nextName, parentId: nextParentId, NOT: { id } },
  });
  if (siblingConflict) throw ApiError.conflict('Já existe uma categoria com este nome no mesmo nível');

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
