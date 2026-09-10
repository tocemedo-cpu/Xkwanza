import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { StarRating } from '../components/StarRating';
import { deleteReview, fetchAllReviewsForAdmin } from '../services/reviewsService';
import { Review } from '../types/reviews';

export function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function reload() {
    setIsLoading(true);
    fetchAllReviewsForAdmin()
      .then(setReviews)
      .finally(() => setIsLoading(false));
  }

  useEffect(reload, []);

  async function handleDelete(review: Review) {
    if (!confirm('Remover esta avaliação?')) return;
    setError(null);
    try {
      await deleteReview(review.id);
      reload();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível remover a avaliação.';
      setError(message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Avaliações</h1>
        <p className="text-neutral-500">Modere avaliações impróprias de qualquer utilizador.</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && reviews.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Nenhuma avaliação registada.
        </p>
      )}

      {!isLoading && reviews.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {reviews.map((review) => (
            <div key={review.id} className="flex items-start justify-between gap-3 p-4 text-sm">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-900">{review.author?.name ?? '—'}</span>
                  <StarRating value={review.rating} size={14} />
                  <span className="text-xs text-neutral-400">
                    {review.targetType}
                    {review.product?.name && ` · ${review.product.name}`}
                  </span>
                </div>
                {review.comment && <p className="mt-1 text-neutral-600">{review.comment}</p>}
                <p className="mt-1 text-xs text-neutral-400">{new Date(review.createdAt).toLocaleDateString('pt-AO')}</p>
              </div>
              <button onClick={() => handleDelete(review)} className="text-neutral-400 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
