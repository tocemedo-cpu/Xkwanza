import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ShieldCheck, ShoppingCart } from 'lucide-react';
import { StarRating } from '../components/StarRating';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { fetchProduct } from '../services/productsService';
import { fetchProductReviews } from '../services/reviewsService';
import { Product } from '../types/marketplace';
import { Review } from '../types/reviews';
import { getRolePrefix } from '../types/user';
import { formatKwanza } from '../utils/angola';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchProduct(id)
      .then(setProduct)
      .catch(() => setError('Produto não encontrado.'));
    fetchProductReviews(id)
      .then((result) => setReviews(result.items))
      .catch(() => setReviews([]));
  }, [id]);

  if (error) {
    return <p className="text-neutral-500">{error}</p>;
  }

  if (!product) {
    return <p className="text-neutral-500">A carregar...</p>;
  }

  const isOwnProduct = user?.id === product.ownerId;
  const isBuyer = user?.role === 'BUYER';
  const prefix = user ? getRolePrefix(user.role) : 'comprador';

  function handleAddToCart() {
    if (!product) return;
    addItem(product, quantity);
    setAdded(true);
  }

  return (
    <div className="space-y-6">
      <Link to={`/${prefix}/marketplace`} className="text-sm text-xkwanza-600 hover:underline">
        ← Voltar ao marketplace
      </Link>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
            {product.photos[0] ? (
              <img src={product.photos[0].url} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-neutral-400">Sem foto</div>
            )}
          </div>
          {product.photos.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.photos.slice(1).map((photo) => (
                <div key={photo.id} className="aspect-square overflow-hidden rounded-md border border-neutral-200">
                  <img src={photo.url} alt={product.name} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-neutral-500">{product.category.name}</p>
            <h1 className="text-2xl font-bold text-neutral-900">{product.name}</h1>
            <p className="text-sm text-neutral-500">
              {product.listingType === 'SERVICE' ? product.serviceArea : `${product.municipality}, ${product.province}`}
            </p>
            {Number(product.averageRating) > 0 && (
              <div className="mt-1 flex items-center gap-2">
                <StarRating value={Number(product.averageRating)} size={16} />
                <span className="text-sm text-neutral-500">({reviews.length} avaliações)</span>
              </div>
            )}
          </div>

          <p className="text-3xl font-bold text-xkwanza-700">
            {product.isEstimatedPrice && <span className="mr-1 text-base font-normal text-neutral-500">A partir de</span>}
            {formatKwanza(Number(product.price))}
            {product.listingType === 'PRODUCT' && (
              <span className="ml-1 text-base font-normal text-neutral-500">/{product.unit}</span>
            )}
          </p>

          <p className="whitespace-pre-line text-neutral-700">{product.description}</p>

          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <span className="font-medium">{product.owner.name}</span>
            {product.owner.isVerifiedBadge && <ShieldCheck size={16} className="text-xkwanza-600" />}
          </div>

          {product.listingType === 'SERVICE' ? (
            <div className="space-y-1 rounded-md bg-neutral-50 p-3 text-sm text-neutral-600">
              <p>
                <span className="font-medium text-neutral-700">Disponibilidade:</span> {product.availability}
              </p>
              <p>
                <span className="font-medium text-neutral-700">Contacto:</span> {product.contact}
              </p>
            </div>
          ) : (
            <p className="text-sm text-neutral-500">
              {(product.stock ?? 0) > 0 ? `${product.stock} ${product.unit} disponíveis` : 'Sem stock disponível'}
            </p>
          )}

          {isOwnProduct ? (
            <p className="rounded-md bg-neutral-100 p-3 text-sm text-neutral-600">
              Este é o seu {product.listingType === 'SERVICE' ? 'serviço' : 'produto'}.
            </p>
          ) : product.listingType === 'SERVICE' ? (
            <Link
              to={`/${prefix}/negociacoes`}
              className="block w-full rounded-md bg-xkwanza-600 px-4 py-2 text-center font-medium text-white hover:bg-xkwanza-700"
            >
              Pedir orçamento para este serviço
            </Link>
          ) : isBuyer ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-neutral-700">Quantidade</label>
                <input
                  type="number"
                  min={1}
                  max={product.stock ?? undefined}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(Math.max(1, Number(e.target.value)), product.stock ?? 1))}
                  className="w-20 rounded-md border border-neutral-300 px-2 py-1"
                />
              </div>
              <button
                disabled={(product.stock ?? 0) === 0}
                onClick={handleAddToCart}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-xkwanza-600 px-4 py-2 font-medium text-white hover:bg-xkwanza-700 disabled:opacity-50"
              >
                <ShoppingCart size={18} />
                Adicionar ao carrinho
              </button>
              {added && (
                <button onClick={() => navigate('/comprador/carrinho')} className="w-full text-center text-sm text-xkwanza-600 hover:underline">
                  Adicionado. Ir para o carrinho →
                </button>
              )}
            </div>
          ) : (
            <Link
              to={`/${prefix}/negociacoes`}
              className="block w-full rounded-md border border-xkwanza-300 px-4 py-2 text-center font-medium text-xkwanza-700 hover:bg-xkwanza-50"
            >
              Pedir cotação para este produto
            </Link>
          )}
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="max-w-2xl space-y-3">
          <h2 className="font-semibold text-neutral-900">Avaliações</h2>
          <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
            {reviews.map((review) => (
              <div key={review.id} className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-800">{review.author?.name}</span>
                  <StarRating value={review.rating} size={14} />
                </div>
                {review.comment && <p className="mt-1 text-sm text-neutral-600">{review.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
