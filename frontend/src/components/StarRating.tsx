import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
}

export function StarRating({ value, onChange, size = 18 }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];
  const interactive = Boolean(onChange);

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star
            size={size}
            className={star <= Math.round(value) ? 'fill-xkwanza-500 text-xkwanza-500' : 'text-neutral-300'}
          />
        </button>
      ))}
    </div>
  );
}
