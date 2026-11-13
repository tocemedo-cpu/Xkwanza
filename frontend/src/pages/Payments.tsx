import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { fetchMyOrders, fetchReceivedOrders } from '../services/ordersService';
import { Order } from '../types/marketplace';
import { PAYMENT_STATUS_LABELS, PaymentStatus } from '../types/payments';
import { useAuth } from '../hooks/useAuth';
import { getRolePrefix } from '../types/user';
import { formatKwanza } from '../utils/angola';

const SELLER_ROLES = ['PRODUCER', 'MERCHANT'];
const PENDING_STATUSES: PaymentStatus[] = ['PENDING', 'PROCESSING'];

const STATUS_STYLES: Record<PaymentStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  PAID: 'bg-xkwanza-100 text-xkwanza-700',
  FAILED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-neutral-100 text-neutral-600',
  REFUNDED: 'bg-neutral-100 text-neutral-600',
};

type FilterOption = 'ALL' | 'PENDING';

export function Payments() {
  const { user } = useAuth();
  const isSeller = user ? SELLER_ROLES.includes(user.role) : false;
  const prefix = user ? getRolePrefix(user.role) : 'comprador';

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterOption>('ALL');

  useEffect(() => {
    const request = isSeller ? fetchReceivedOrders(1, 100) : fetchMyOrders(1, 100);
    request.then((result) => setOrders(result.items)).finally(() => setIsLoading(false));
  }, [isSeller]);

  const withPayment = useMemo(() => orders.filter((order) => order.payment), [orders]);

  const visible = useMemo(
    () =>
      filter === 'PENDING'
        ? withPayment.filter((order) => PENDING_STATUSES.includes(order.payment!.status))
        : withPayment,
    [withPayment, filter],
  );

  const pendingCount = withPayment.filter((order) => PENDING_STATUSES.includes(order.payment!.status)).length;
  const totalPending = withPayment
    .filter((order) => PENDING_STATUSES.includes(order.payment!.status))
    .reduce((sum, order) => sum + Number(order.total), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Pagamentos</h1>
        <p className="text-neutral-500">
          {isSeller
            ? 'Estado dos pagamentos dos pedidos que recebeu.'
            : 'Estado dos pagamentos das suas compras.'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="mb-1 flex items-center gap-2 text-xkwanza-600">
            <CreditCard size={18} />
            <h2 className="font-semibold text-neutral-900">Pagamentos pendentes</h2>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{pendingCount}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="mb-1 flex items-center gap-2 text-xkwanza-600">
            <CreditCard size={18} />
            <h2 className="font-semibold text-neutral-900">Valor pendente</h2>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{formatKwanza(totalPending)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {(['ALL', 'PENDING'] as FilterOption[]).map((opt) => (
          <button
            key={opt}
            onClick={() => setFilter(opt)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              filter === opt
                ? 'border-xkwanza-950 bg-xkwanza-950 text-white'
                : 'border-neutral-200 text-neutral-700 hover:border-xkwanza-600 hover:text-xkwanza-700'
            }`}
          >
            {opt === 'ALL' ? 'Todos' : 'Pendentes'}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && visible.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          {filter === 'PENDING' ? 'Sem pagamentos pendentes.' : 'Ainda não há pagamentos associados a pedidos.'}
        </p>
      )}

      {!isLoading && visible.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {visible.map((order) => (
            <Link
              key={order.id}
              to={`/${prefix}/pedidos/${order.id}`}
              className="flex items-center justify-between gap-3 p-4 text-sm hover:bg-neutral-50"
            >
              <div>
                <p className="font-medium text-neutral-900">Pedido #{order.id.slice(0, 8)}</p>
                <p className="text-neutral-500">{new Date(order.createdAt).toLocaleDateString('pt-AO')}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-neutral-900">{formatKwanza(Number(order.total))}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[order.payment!.status]}`}>
                  {PAYMENT_STATUS_LABELS[order.payment!.status]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
