import { useEffect, useState } from 'react';
import { StarRating } from '../components/StarRating';
import { fetchReceivedReviews } from '../services/reviewsService';
import { Review } from '../types/reviews';

export function AvaliacoesRecebidas() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReceivedReviews()
      .then(setReviews)
      .finally(() => setIsLoading(false));
  }, []);

  const average = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Avaliações recebidas</h1>
        <p className="text-neutral-500">O que os compradores disseram sobre si.</p>
      </div>

      {!isLoading && reviews.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white p-4">
          <StarRating value={average} size={20} />
          <span className="font-semibold text-neutral-900">{average.toFixed(1)}</span>
          <span className="text-sm text-neutral-500">({reviews.length} avaliações)</span>
        </div>
      )}

      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && reviews.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Ainda não recebeu nenhuma avaliação.
        </p>
      )}

      {!isLoading && reviews.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-900">{review.author?.name ?? 'Comprador'}</span>
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
