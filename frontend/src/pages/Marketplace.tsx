import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { fetchCategories } from '../services/categoriesService';
import { fetchProducts } from '../services/productsService';
import { Category, PaginatedResult, Product } from '../types/marketplace';
import { ANGOLA_PROVINCES } from '../utils/angola';

export function Marketplace() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [result, setResult] = useState<PaginatedResult<Product> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [province, setProvince] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchProducts({
      search: search || undefined,
      categoryId: categoryId || undefined,
      province: province || undefined,
      page,
      pageSize: 12,
    })
      .then(setResult)
      .catch(() => setResult(null))
      .finally(() => setIsLoading(false));
  }, [search, categoryId, province, page]);

  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Marketplace</h1>
        <p className="text-neutral-500">Produtos de produtores e comerciantes de todo o país.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Pesquisar produtos..."
            className="w-full rounded-md border border-neutral-300 py-2 pl-9 pr-3 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500"
          />
        </div>
        <select
          value={categoryId}
          onChange={(e) => {
            setPage(1);
            setCategoryId(e.target.value);
          }}
          className="rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500"
        >
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={province}
          onChange={(e) => {
            setPage(1);
            setProvince(e.target.value);
          }}
          className="rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500"
        >
          <option value="">Todas as províncias</option>
          {ANGOLA_PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-neutral-500">A carregar produtos...</p>}

      {!isLoading && result && result.items.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Nenhum produto encontrado com estes filtros.
        </p>
      )}

      {!isLoading && result && result.items.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {result.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-sm text-neutral-500">
                Página {page} de {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Seguinte
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
