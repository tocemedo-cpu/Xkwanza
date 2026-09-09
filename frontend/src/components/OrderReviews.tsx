import { useEffect, useState } from 'react';
import { StarRating } from './StarRating';
import { createReview, fetchMyReviewsForOrder } from '../services/reviewsService';
import { fetchTransportOrder } from '../services/transportService';
import { Order } from '../types/marketplace';
import { Review } from '../types/reviews';

interface ReviewTarget {
  key: string;
  label: string;
  targetType: 'PRODUCT' | 'SELLER' | 'TRANSPORTER';
  productId?: string;
  targetUserId?: string;
}

function ReviewPrompt({ orderId, target, onDone }: { orderId: string; target: ReviewTarget; onDone: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (rating === 0) {
      setError('Seleccione uma classificação.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await createReview({
        orderId,
        targetType: target.targetType,
        productId: target.productId,
        targetUserId: target.targetUserId,
        rating,
        comment: comment || undefined,
      });
      onDone();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível enviar a avaliação.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-2 border-t border-neutral-100 py-3 first:border-t-0 first:pt-0">
      <p className="text-sm font-medium text-neutral-800">{target.label}</p>
      <StarRating value={rating} onChange={setRating} />
      <input
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Comentário (opcional)"
        className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        disabled={isSubmitting}
        onClick={handleSubmit}
        className="rounded-md bg-xkwanza-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
      >
        Enviar avaliação
      </button>
    </div>
  );
}

export function OrderReviews({ order }: { order: Order }) {
  const [targets, setTargets] = useState<ReviewTarget[]>([]);
  const [reviewedKeys, setReviewedKeys] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  function keyFor(review: Pick<Review, 'targetType' | 'productId' | 'targetUserId'>) {
    return `${review.targetType}:${review.productId ?? review.targetUserId ?? ''}`;
  }

  useEffect(() => {
    async function load() {
      const productTargets: ReviewTarget[] = [];
      const sellerTargets: ReviewTarget[] = [];
      const seenProducts = new Set<string>();
      const seenSellers = new Set<string>();

      for (const item of order.items) {
        if (!seenProducts.has(item.product.id)) {
          seenProducts.add(item.product.id);
          productTargets.push({
            key: `PRODUCT:${item.product.id}`,
            label: `Produto: ${item.product.name}`,
            targetType: 'PRODUCT',
            productId: item.product.id,
          });
        }
        if (!seenSellers.has(item.product.ownerId)) {
          seenSellers.add(item.product.ownerId);
          sellerTargets.push({
            key: `SELLER:${item.product.ownerId}`,
            label: `Vendedor: ${item.product.owner.name}`,
            targetType: 'SELLER',
            targetUserId: item.product.ownerId,
          });
        }
      }

      const allTargets = [...productTargets, ...sellerTargets];

      if (order.transportOrder) {
        try {
          const transportOrder = await fetchTransportOrder(order.transportOrder.id);
          if (transportOrder.transporter) {
            allTargets.push({
              key: `TRANSPORTER:${transportOrder.transporter.userId}`,
              label: `Transportador: ${transportOrder.transporter.user?.name ?? ''}`,
              targetType: 'TRANSPORTER',
              targetUserId: transportOrder.transporter.userId,
            });
          }
        } catch {
          // sem acesso ao transporte — ignora
        }
      }

      setTargets(allTargets);

      const myReviews = await fetchMyReviewsForOrder(order.id);
      setReviewedKeys(new Set(myReviews.map(keyFor)));
      setIsLoading(false);
    }
    load();
  }, [order]);

  if (isLoading) return null;

  const pending = targets.filter((t) => !reviewedKeys.has(t.key));

  if (pending.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500">
        Obrigado! Já avaliou tudo o que havia a avaliar neste pedido.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <p className="mb-2 font-semibold text-neutral-900">Avaliar este pedido</p>
      {pending.map((target) => (
        <ReviewPrompt
          key={target.key}
          orderId={order.id}
          target={target}
          onDone={() => setReviewedKeys((prev) => new Set(prev).add(target.key))}
        />
      ))}
    </div>
  );
}
