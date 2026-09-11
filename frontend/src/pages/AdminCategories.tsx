import { FormEvent, useEffect, useState } from 'react';
import { Sparkles, Trash2 } from 'lucide-react';
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  seedDefaultCategories,
  updateCategory,
} from '../services/categoriesService';
import { Category } from '../types/marketplace';

const inputClass =
  'rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500';

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  function reload() {
    setIsLoading(true);
    fetchCategories()
      .then(setCategories)
      .finally(() => setIsLoading(false));
  }

  useEffect(reload, []);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await createCategory({ name, slug: slugify(name), parentId: parentId || undefined });
      setName('');
      reload();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível criar a categoria.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRename(category: Category) {
    const newName = prompt('Novo nome da categoria', category.name);
    if (!newName || newName.trim() === category.name) return;
    try {
      await updateCategory(category.id, { name: newName.trim(), slug: slugify(newName) });
      reload();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível renomear a categoria.';
      setError(message);
    }
  }

  async function handleSeedDefaults() {
    setError(null);
    setSeedMessage(null);
    setIsSeeding(true);
    try {
      const result = await seedDefaultCategories();
      setSeedMessage(
        result.created > 0
          ? `${result.created} categoria(s)/subcategoria(s) criada(s) ou reorganizada(s).`
          : 'As categorias padrão já existiam todas, na hierarquia certa — nada foi alterado.',
      );
      reload();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível criar as categorias padrão.';
      setError(message);
    } finally {
      setIsSeeding(false);
    }
  }

  async function handleDelete(category: Category) {
    if (!confirm(`Remover a categoria "${category.name}"?`)) return;
    try {
      await deleteCategory(category.id);
      reload();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível remover a categoria (pode ter subcategorias ou produtos associados).';
      setError(message);
    }
  }

  const mainCategories = categories.filter((c) => !c.parentId);

  function CategoryRow({ category, indented }: { category: Category; indented?: boolean }) {
    return (
      <div className={`flex items-center justify-between gap-3 p-4 text-sm ${indented ? 'pl-10' : ''}`}>
        <div>
          <p className={indented ? 'text-neutral-800' : 'font-medium text-neutral-900'}>{category.name}</p>
          <p className="text-neutral-500">{category.slug}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => handleRename(category)} className="text-xs font-medium text-xkwanza-600 hover:underline">
            Renomear
          </button>
          <button onClick={() => handleDelete(category)} className="text-neutral-400 hover:text-red-600">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Categorias</h1>
          <p className="text-neutral-500">
            Catálogo em duas camadas: categoria principal → subcategoria. Quem publica escolhe primeiro a
            principal e só depois a subcategoria.
          </p>
        </div>
        <button
          onClick={handleSeedDefaults}
          disabled={isSeeding}
          className="flex shrink-0 items-center gap-2 rounded-md border border-xkwanza-300 px-3 py-2 text-sm font-medium text-xkwanza-700 hover:bg-xkwanza-50 disabled:opacity-60"
        >
          <Sparkles size={16} />
          {isSeeding ? 'A criar...' : 'Criar categorias padrão'}
        </button>
      </div>

      <form onSubmit={handleCreate} className="flex flex-wrap gap-2">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome da nova categoria"
          className={`${inputClass} flex-1`}
        />
        <select value={parentId} onChange={(e) => setParentId(e.target.value)} className={inputClass}>
          <option value="">— Categoria principal (sem mãe) —</option>
          {mainCategories.map((c) => (
            <option key={c.id} value={c.id}>
              Subcategoria de: {c.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-xkwanza-600 px-4 py-2 text-sm font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
        >
          Adicionar
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {seedMessage && <p className="text-sm text-xkwanza-600">{seedMessage}</p>}
      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && categories.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Ainda não há nenhuma categoria — produtores e comerciantes não vão conseguir publicar até existir
          pelo menos uma. Use "Criar categorias padrão" acima para começar, ou adicione as suas próprias.
        </p>
      )}

      {!isLoading && categories.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {mainCategories.map((main) => (
            <div key={main.id} className="divide-y divide-neutral-50">
              <CategoryRow category={main} />
              {categories
                .filter((c) => c.parentId === main.id)
                .map((child) => (
                  <CategoryRow key={child.id} category={child} indented />
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
