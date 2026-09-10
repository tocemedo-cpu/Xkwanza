import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchOrdersForAdmin } from '../services/ordersService';
import { ORDER_STATUS_LABELS, Order, OrderStatus, PaginatedResult } from '../types/marketplace';
import { formatKwanza } from '../utils/angola';

const STATUS_OPTIONS = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

export function AdminOrders() {
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [result, setResult] = useState<PaginatedResult<Order> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchOrdersForAdmin(status || undefined, 1, 50)
      .then(setResult)
      .finally(() => setIsLoading(false));
  }, [status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Pedidos</h1>
        <p className="text-neutral-500">Visão geral de todos os pedidos e transacções da plataforma.</p>
      </div>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as OrderStatus | '')}
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500"
      >
        <option value="">Todos os estados</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && result && result.items.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Nenhum pedido encontrado.
        </p>
      )}

      {!isLoading && result && result.items.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {result.items.map((order) => (
            <Link
              key={order.id}
              to={`/admin/pedidos/${order.id}`}
              className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm hover:bg-neutral-50"
            >
              <div>
                <p className="font-medium text-neutral-900">
                  Pedido #{order.id.slice(0, 8)} · {order.buyer?.name ?? '—'}
                </p>
                <p className="text-neutral-500">
                  {order.items.length} item(ns) · {formatKwanza(Number(order.total))}
                </p>
              </div>
              <span className="whitespace-nowrap rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                {ORDER_STATUS_LABELS[order.status]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
