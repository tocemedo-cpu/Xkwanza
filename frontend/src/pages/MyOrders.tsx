import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { useAuth } from '../hooks/useAuth';
import { fetchMyOrders } from '../services/ordersService';
import { Order, OrderStatus } from '../types/marketplace';
import { getRolePrefix } from '../types/user';
import { formatKwanza } from '../utils/angola';

const OPEN_STATUSES: OrderStatus[] = [
  'CREATED',
  'CONFIRMED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'PICKED_UP',
  'IN_TRANSIT',
  'DELIVERED',
];
const HISTORY_STATUSES: OrderStatus[] = ['COMPLETED', 'CANCELLED'];

export function MyOrders() {
  const { user } = useAuth();
  const prefix = user ? getRolePrefix(user.role) : 'comprador';
  const isMerchant = user?.role === 'MERCHANT';
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') ?? 'todos';

  useEffect(() => {
    fetchMyOrders(1, 100)
      .then((result) => setOrders(result.items))
      .finally(() => setIsLoading(false));
  }, []);

  const visibleOrders = useMemo(() => {
    if (tab === 'aberto') return orders.filter((o) => OPEN_STATUSES.includes(o.status));
    if (tab === 'historico') return orders.filter((o) => HISTORY_STATUSES.includes(o.status));
    return orders;
  }, [orders, tab]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{isMerchant ? 'Compras' : 'Meus pedidos'}</h1>
        <p className="text-neutral-500">
          {isMerchant
            ? 'Pedidos feitos a produtores e fornecedores para reposição do seu stock.'
            : 'Compras feitas no marketplace AO Market.'}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {[
          { value: 'todos', label: 'Todos' },
          { value: 'aberto', label: 'Em aberto' },
          { value: 'historico', label: 'Histórico' },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSearchParams(opt.value === 'todos' ? {} : { tab: opt.value })}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              tab === opt.value
                ? 'border-xkwanza-950 bg-xkwanza-950 text-white'
                : 'border-neutral-200 text-neutral-700 hover:border-xkwanza-600 hover:text-xkwanza-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && visibleOrders.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          {orders.length === 0 ? (
            <>
              Ainda não fez nenhum pedido.{' '}
              <Link to={`/${prefix}/marketplace`} className="font-medium text-xkwanza-600 hover:underline">
                Explorar produtos
              </Link>
            </>
          ) : (
            'Nenhum pedido nesta vista.'
          )}
        </p>
      )}

      {!isLoading && visibleOrders.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {visibleOrders.map((order) => (
            <Link
              key={order.id}
              to={`/${prefix}/pedidos/${order.id}`}
              className="flex items-center justify-between p-4 hover:bg-neutral-50"
            >
              <div>
                <p className="font-medium text-neutral-900">Pedido #{order.id.slice(0, 8)}</p>
                <p className="text-sm text-neutral-500">
                  {order.items.length} item(ns) · {new Date(order.createdAt).toLocaleDateString('pt-AO')}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-neutral-900">{formatKwanza(Number(order.total))}</span>
                <OrderStatusBadge status={order.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
