import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
  deleteProduct,
  fetchMyProducts,
  publishProduct,
  unpublishProduct,
} from '../services/productsService';
import { LISTING_TYPE_LABELS, Product, ProductStatus } from '../types/marketplace';
import { useAuth } from '../hooks/useAuth';
import { getRolePrefix } from '../types/user';
import { formatKwanza } from '../utils/angola';

const STATUS_LABELS: Record<ProductStatus, string> = {
  DRAFT: 'Rascunho',
  PUBLISHED: 'Publicado',
  UNPUBLISHED: 'Despublicado',
  OUT_OF_STOCK: 'Sem stock',
  REMOVED: 'Removido',
};

export function MyProducts() {
  const { user } = useAuth();
  const prefix = user ? getRolePrefix(user.role) : 'produtor';
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function reload() {
    setIsLoading(true);
    fetchMyProducts()
      .then(setProducts)
      .finally(() => setIsLoading(false));
  }

  useEffect(reload, []);

  async function handleTogglePublish(product: Product) {
    setError(null);
    try {
      if (product.status === 'PUBLISHED') {
        await unpublishProduct(product.id);
      } else {
        await publishProduct(product.id);
      }
      reload();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível actualizar o produto.';
      setError(message);
    }
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Remover "${product.name}"?`)) return;
    await deleteProduct(product.id);
    reload();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Stock</h1>
          <p className="text-neutral-500">Gira o seu catálogo no marketplace XKWANZA.</p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/${prefix}/stock/novo`}
            className="flex items-center gap-2 rounded-md bg-xkwanza-600 px-4 py-2 font-medium text-white hover:bg-xkwanza-700"
          >
            <Plus size={18} />
            Novo produto
          </Link>
          <Link
            to={`/${prefix}/stock/novo?tipo=servico`}
            className="flex items-center gap-2 rounded-md border border-xkwanza-300 px-4 py-2 font-medium text-xkwanza-700 hover:bg-xkwanza-50"
          >
            <Plus size={18} />
            Novo serviço
          </Link>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && products.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Ainda não tem produtos nem serviços. Crie o primeiro.
        </p>
      )}

      {!isLoading && products.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-neutral-500">
              <tr>
                <th className="px-4 py-2 font-medium">Anúncio</th>
                <th className="px-4 py-2 font-medium">Preço</th>
                <th className="px-4 py-2 font-medium">Stock</th>
                <th className="px-4 py-2 font-medium">Estado</th>
                <th className="px-4 py-2 font-medium">Acções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-2 font-medium text-neutral-900">
                    <span className="mr-1.5 rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-neutral-500">
                      {LISTING_TYPE_LABELS[product.listingType]}
                    </span>
                    {product.name}
                  </td>
                  <td className="px-4 py-2 text-neutral-700">
                    {product.isEstimatedPrice && 'A partir de '}
                    {formatKwanza(Number(product.price))}
                  </td>
                  <td className="px-4 py-2 text-neutral-700">
                    {product.listingType === 'SERVICE' ? '—' : `${product.stock} ${product.unit}`}
                  </td>
                  <td className="px-4 py-2">
                    <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
                      {STATUS_LABELS[product.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <Link to={`/${prefix}/stock/${product.id}/editar`} className="text-neutral-500 hover:text-xkwanza-600">
                        <Pencil size={16} />
                      </Link>
                      <button onClick={() => handleDelete(product)} className="text-neutral-500 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                      {product.status !== 'REMOVED' && (
                        <button
                          onClick={() => handleTogglePublish(product)}
                          className="rounded-md border border-neutral-300 px-2 py-1 text-xs font-medium hover:bg-neutral-50"
                        >
                          {product.status === 'PUBLISHED' ? 'Despublicar' : 'Publicar'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
