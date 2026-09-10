import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { formatKwanza } from '../utils/angola';

export function Cart() {
  const { items, totalAmount, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-neutral-900">Carrinho</h1>
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          O seu carrinho está vazio.{' '}
          <Link to="/comprador/marketplace" className="font-medium text-xkwanza-600 hover:underline">
            Explorar produtos
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Carrinho</h1>

      <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 p-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-100">
              {item.product.photos[0] && (
                <img src={item.product.photos[0].url} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-neutral-900">{item.product.name}</p>
              <p className="text-sm text-neutral-500">
                {formatKwanza(Number(item.product.price))} / {item.product.unit}
              </p>
            </div>
            <input
              type="number"
              min={1}
              max={item.product.stock ?? undefined}
              value={item.quantity}
              onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
              className="w-16 rounded-md border border-neutral-300 px-2 py-1"
            />
            <p className="w-28 text-right font-medium text-neutral-900">
              {formatKwanza(Number(item.product.price) * item.quantity)}
            </p>
            <button onClick={() => removeItem(item.productId)} className="text-neutral-400 hover:text-red-600">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4">
        <span className="text-neutral-600">Subtotal</span>
        <span className="text-xl font-bold text-neutral-900">{formatKwanza(totalAmount)}</span>
      </div>

      <button
        onClick={() => navigate('/comprador/checkout')}
        className="w-full rounded-md bg-xkwanza-600 px-4 py-3 font-medium text-white hover:bg-xkwanza-700"
      >
        Finalizar compra
      </button>
    </div>
  );
}
