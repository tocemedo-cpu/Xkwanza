import { useEffect, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { useAuth } from '../hooks/useAuth';
import { fetchMyFavorites } from '../services/favoritesService';
import { Product } from '../types/marketplace';
import { getRolePrefix } from '../types/user';

export function Favoritos() {
  const { user } = useAuth();
  const prefix = user ? getRolePrefix(user.role) : 'comprador';
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyFavorites()
      .then(setProducts)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Favoritos</h1>
        <p className="text-neutral-500">Produtos e serviços que marcou para consultar depois.</p>
      </div>

      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && products.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Ainda não tem favoritos. Marque produtos no marketplace para os encontrar aqui.
        </p>
      )}

      {!isLoading && products.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} linkTo={`/${prefix}/produtos/${product.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
