import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Product } from '../types/marketplace';
import { formatKwanza } from '../utils/angola';

export function ProductCard({ product }: { product: Product }) {
  const photo = product.photos[0]?.url;

  return (
    <Link
      to={`/produtos/${product.id}`}
      className="group overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:shadow-md"
    >
      <div className="aspect-square w-full overflow-hidden bg-neutral-100">
        {photo ? (
          <img
            src={photo}
            alt={product.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">Sem foto</div>
        )}
      </div>
      <div className="p-3">
        <p className="line-clamp-1 font-medium text-neutral-900">{product.name}</p>
        <p className="mt-0.5 text-xs text-neutral-500">
          {product.municipality}, {product.province}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <p className="font-semibold text-xkwanza-700">
            {formatKwanza(Number(product.price))}
            <span className="ml-1 text-xs font-normal text-neutral-500">/{product.unit}</span>
          </p>
          {product.isVerified && <ShieldCheck size={16} className="text-xkwanza-600" />}
        </div>
      </div>
    </Link>
  );
}
