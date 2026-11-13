import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { fetchMyProducts, updateProduct } from '../services/productsService';
import { Product } from '../types/marketplace';

const LOW_STOCK_THRESHOLD = 5;

export function Stock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  function reload() {
    setIsLoading(true);
    fetchMyProducts()
      .then((all) => setProducts(all.filter((p) => p.listingType === 'PRODUCT')))
      .finally(() => setIsLoading(false));
  }

  useEffect(reload, []);

  async function handleAdjust(product: Product, delta: number) {
    const current = product.stock ?? 0;
    const next = Math.max(0, current + delta);
    if (next === current) return;
    setError(null);
    setPendingId(product.id);
    try {
      const updated = await updateProduct(product.id, { stock: next });
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível actualizar o stock.';
      setError(message);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Stock</h1>
        <p className="text-neutral-500">
          Quantidade disponível de cada produto — registe entradas e saídas à medida que repõe ou vende fora da
          plataforma. Anúncios com {LOW_STOCK_THRESHOLD} unidades ou menos aparecem marcados como stock baixo.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && products.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Ainda não tem produtos com stock (os serviços não têm quantidade).
        </p>
      )}

      {!isLoading && products.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-neutral-50 text-left text-neutral-500">
              <tr>
                <th className="px-4 py-2 font-medium">Produto</th>
                <th className="px-4 py-2 font-medium">Unidade</th>
                <th className="px-4 py-2 font-medium">Quantidade</th>
                <th className="px-4 py-2 font-medium">Alerta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {products.map((product) => {
                const quantity = product.stock ?? 0;
                const isLow = quantity <= LOW_STOCK_THRESHOLD;
                const isPending = pendingId === product.id;
                return (
                  <tr key={product.id}>
                    <td className="px-4 py-2 font-medium text-neutral-900">{product.name}</td>
                    <td className="px-4 py-2 text-neutral-700">{product.unit}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAdjust(product, -1)}
                          disabled={isPending || quantity === 0}
                          className="rounded-md border border-neutral-300 p-1 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
                          aria-label="Registar saída"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center font-medium text-neutral-900">{quantity}</span>
                        <button
                          onClick={() => handleAdjust(product, 1)}
                          disabled={isPending}
                          className="rounded-md border border-neutral-300 p-1 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
                          aria-label="Registar entrada"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      {isLow && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                          Stock baixo
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
