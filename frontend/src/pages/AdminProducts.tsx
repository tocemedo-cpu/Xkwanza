import { useEffect, useState } from 'react';
import { fetchProductsForAdmin, moderateProduct } from '../services/productsService';
import { PaginatedResult, Product, ProductStatus } from '../types/marketplace';
import { formatKwanza } from '../utils/angola';

const STATUS_LABELS: Record<ProductStatus, string> = {
  DRAFT: 'Rascunho',
  PUBLISHED: 'Publicado',
  UNPUBLISHED: 'Despublicado',
  OUT_OF_STOCK: 'Sem stock',
  REMOVED: 'Removido',
};

export function AdminProducts() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProductStatus | ''>('');
  const [result, setResult] = useState<PaginatedResult<Product> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function reload() {
    setIsLoading(true);
    fetchProductsForAdmin({ search: search || undefined, status: status || undefined, pageSize: 50 })
      .then(setResult)
      .finally(() => setIsLoading(false));
  }

  useEffect(reload, [search, status]);

  async function handleModerate(product: Product, next: 'UNPUBLISHED' | 'REMOVED') {
    setError(null);
    if (next === 'REMOVED' && !confirm(`Remover o anúncio "${product.name}"? Deixa de aparecer no marketplace.`)) {
      return;
    }
    try {
      await moderateProduct(product.id, next);
      reload();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível moderar o anúncio.';
      setError(message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Produtos</h1>
        <p className="text-neutral-500">Modera anúncios de qualquer vendedor — despublica ou remove conteúdo impróprio.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por nome ou descrição..."
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ProductStatus | '')}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500"
        >
          <option value="">Todos os estados</option>
          {(Object.keys(STATUS_LABELS) as ProductStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && result && result.items.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Nenhum produto encontrado.
        </p>
      )}

      {!isLoading && result && result.items.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {result.items.map((product) => (
            <div key={product.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
              <div>
                <p className="font-medium text-neutral-900">{product.name}</p>
                <p className="text-neutral-500">
                  {product.owner.name} · {formatKwanza(Number(product.price))}/{product.unit} ·{' '}
                  {STATUS_LABELS[product.status]}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {product.status !== 'UNPUBLISHED' && product.status !== 'REMOVED' && (
                  <button
                    onClick={() => handleModerate(product, 'UNPUBLISHED')}
                    className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100"
                  >
                    Despublicar
                  </button>
                )}
                {product.status !== 'REMOVED' && (
                  <button
                    onClick={() => handleModerate(product, 'REMOVED')}
                    className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Remover
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
