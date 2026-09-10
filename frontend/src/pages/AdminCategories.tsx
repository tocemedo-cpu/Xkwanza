import { FormEvent, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { createCategory, deleteCategory, fetchCategories, updateCategory } from '../services/categoriesService';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      await createCategory({ name, slug: slugify(name) });
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
    await updateCategory(category.id, { name: newName.trim(), slug: slugify(newName) });
    reload();
  }

  async function handleDelete(category: Category) {
    if (!confirm(`Remover a categoria "${category.name}"?`)) return;
    try {
      await deleteCategory(category.id);
      reload();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível remover a categoria (pode ter produtos associados).';
      setError(message);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Categorias</h1>
        <p className="text-neutral-500">Catálogo de categorias do marketplace.</p>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome da nova categoria"
          className={`${inputClass} flex-1`}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-xkwanza-600 px-4 py-2 text-sm font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
        >
          Adicionar
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && categories.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between gap-3 p-4 text-sm">
              <div>
                <p className="font-medium text-neutral-900">{category.name}</p>
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
          ))}
        </div>
      )}
    </div>
  );
}
