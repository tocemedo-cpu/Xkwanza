import { useEffect, useState } from 'react';
import { StarRating } from '../components/StarRating';
import { fetchMyReviews } from '../services/reviewsService';
import { Review } from '../types/reviews';

export function MinhasAvaliacoes() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyReviews()
      .then(setReviews)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Minhas avaliações</h1>
        <p className="text-neutral-500">Avaliações que escreveu sobre produtos, vendedores e transportadores.</p>
      </div>

      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && reviews.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Ainda não escreveu nenhuma avaliação. Pode avaliar depois de um pedido ser concluído.
        </p>
      )}

      {!isLoading && reviews.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-900">{review.product?.name ?? review.targetType}</span>
                <StarRating value={review.rating} size={14} />
              </div>
              {review.comment && <p className="mt-1 text-neutral-600">{review.comment}</p>}
              <p className="mt-1 text-xs text-neutral-400">{new Date(review.createdAt).toLocaleDateString('pt-AO')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
