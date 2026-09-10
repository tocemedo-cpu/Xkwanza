import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck } from 'lucide-react';
import { fetchMyOrders, fetchReceivedOrders } from '../services/ordersService';
import { Order } from '../types/marketplace';
import { TransportStatus } from '../types/logistics';
import { TransportStatusBadge } from '../components/TransportStatusBadge';
import { useAuth } from '../hooks/useAuth';
import { getRolePrefix } from '../types/user';

const SELLER_ROLES = ['PRODUCER', 'MERCHANT'];

export function Entregas() {
  const { user } = useAuth();
  const isSeller = user ? SELLER_ROLES.includes(user.role) : false;
  const prefix = user ? getRolePrefix(user.role) : 'comprador';

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const request = isSeller ? fetchReceivedOrders(1, 100) : fetchMyOrders(1, 100);
    request.then((result) => setOrders(result.items)).finally(() => setIsLoading(false));
  }, [isSeller]);

  const withTransport = orders.filter((order) => order.transportOrder);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Entregas</h1>
        <p className="text-neutral-500">Acompanhe o transporte dos seus pedidos com transportador XKWANZA.</p>
      </div>

      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && withTransport.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Ainda não há entregas com transportador XKWANZA associado.
        </p>
      )}

      {!isLoading && withTransport.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {withTransport.map((order) => (
            <Link
              key={order.id}
              to={`/${prefix}/fretes/${order.transportOrder!.id}`}
              className="flex items-center justify-between gap-3 p-4 text-sm hover:bg-neutral-50"
            >
              <div className="flex items-center gap-3">
                <Truck size={18} className="text-neutral-400" />
                <div>
                  <p className="font-medium text-neutral-900">Pedido #{order.id.slice(0, 8)}</p>
                  <p className="text-neutral-500">{new Date(order.createdAt).toLocaleDateString('pt-AO')}</p>
                </div>
              </div>
              <TransportStatusBadge status={order.transportOrder!.status as TransportStatus} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
