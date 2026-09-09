import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { fetchMyOrders } from '../services/ordersService';
import { Order } from '../types/marketplace';
import { formatKwanza } from '../utils/angola';

export function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders()
      .then((result) => setOrders(result.items))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Meus pedidos</h1>
        <p className="text-neutral-500">Compras feitas no marketplace XKWANZA.</p>
      </div>

      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && orders.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Ainda não fez nenhum pedido.{' '}
          <Link to="/marketplace" className="font-medium text-xkwanza-600 hover:underline">
            Explorar produtos
          </Link>
        </p>
      )}

      {!isLoading && orders.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/pedidos/${order.id}`}
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
