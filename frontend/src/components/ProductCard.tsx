import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Product } from '../types/marketplace';
import { formatKwanza } from '../utils/angola';

export function ProductCard({ product, linkTo }: { product: Product; linkTo: string }) {
  const photo = product.photos[0]?.url;
  const isService = product.listingType === 'SERVICE';

  return (
    <Link
      to={linkTo}
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
        <div className="flex items-center gap-1.5">
          {isService && (
            <span className="rounded-full bg-xkwanza-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-xkwanza-700">
              Serviço
            </span>
          )}
          <p className="line-clamp-1 font-medium text-neutral-900">{product.name}</p>
        </div>
        <p className="mt-0.5 text-xs text-neutral-500">
          {isService ? (product.serviceArea ?? 'Área de atendimento não indicada') : `${product.municipality}, ${product.province}`}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <p className="font-semibold text-xkwanza-700">
            {product.isEstimatedPrice && <span className="mr-1 text-xs font-normal text-neutral-500">A partir de</span>}
            {formatKwanza(Number(product.price))}
            {!isService && <span className="ml-1 text-xs font-normal text-neutral-500">/{product.unit}</span>}
          </p>
          {product.isVerified && <ShieldCheck size={16} className="text-xkwanza-600" />}
        </div>
      </div>
    </Link>
  );
}
