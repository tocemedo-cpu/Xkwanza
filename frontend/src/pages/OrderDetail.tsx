import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { useAuth } from '../hooks/useAuth';
import { fetchOrder, updateOrderStatus } from '../services/ordersService';
import { requestTransport } from '../services/transportService';
import { Order, OrderStatus } from '../types/marketplace';
import { formatKwanza } from '../utils/angola';

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  CREATED: 'CONFIRMED',
  CONFIRMED: 'PREPARING',
  PREPARING: 'READY_FOR_PICKUP',
  READY_FOR_PICKUP: 'COMPLETED',
};

const NEXT_STATUS_LABEL: Partial<Record<OrderStatus, string>> = {
  CREATED: 'Confirmar pedido',
  CONFIRMED: 'Iniciar preparação',
  PREPARING: 'Marcar pronto para recolha',
  READY_FOR_PICKUP: 'Marcar como concluído',
};

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  function reload() {
    if (!id) return;
    fetchOrder(id)
      .then(setOrder)
      .catch(() => setError('Pedido não encontrado ou sem acesso.'));
  }

  useEffect(reload, [id]);

  const isSeller = order?.items.some((item) => item.product.ownerId === user?.id) ?? false;
  const isBuyer = order?.buyerId === user?.id;

  async function handleStatusChange(status: OrderStatus) {
    if (!id) return;
    setIsUpdating(true);
    setError(null);
    try {
      const updated = await updateOrderStatus(id, status);
      setOrder(updated);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível actualizar o estado.';
      setError(message);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleRequestTransport() {
    if (!id) return;
    setIsUpdating(true);
    setError(null);
    try {
      const transportOrder = await requestTransport(id);
      navigate(`/fretes/${transportOrder.id}`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível solicitar transporte.';
      setError(message);
    } finally {
      setIsUpdating(false);
    }
  }

  if (error) return <p className="text-neutral-500">{error}</p>;
  if (!order) return <p className="text-neutral-500">A carregar...</p>;

  const nextStatus = isSeller ? NEXT_STATUS[order.status] : undefined;
  const canCancel = (order.status === 'CREATED' || order.status === 'CONFIRMED') && (isBuyer || isSeller);

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        to={isSeller && !isBuyer ? '/pedidos-recebidos' : '/meus-pedidos'}
        className="text-sm text-xkwanza-600 hover:underline"
      >
        ← Voltar
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Pedido #{order.id.slice(0, 8)}</h1>
          <p className="text-sm text-neutral-500">{new Date(order.createdAt).toLocaleString('pt-AO')}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 text-sm">
            <div>
              <p className="font-medium text-neutral-900">{item.product.name}</p>
              <p className="text-neutral-500">
                {item.quantity} × {formatKwanza(Number(item.unitPrice))}
              </p>
            </div>
            <p className="font-medium text-neutral-900">{formatKwanza(Number(item.lineTotal))}</p>
          </div>
        ))}
      </div>

      <div className="space-y-1 rounded-xl border border-neutral-200 bg-white p-4 text-sm">
        <div className="flex justify-between text-neutral-600">
          <span>Subtotal</span>
          <span>{formatKwanza(Number(order.subtotal))}</span>
        </div>
        <div className="flex justify-between text-neutral-600">
          <span>Transporte</span>
          <span>{formatKwanza(Number(order.transportCost))}</span>
        </div>
        <div className="flex justify-between border-t border-neutral-100 pt-1 font-semibold text-neutral-900">
          <span>Total</span>
          <span>{formatKwanza(Number(order.total))}</span>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
        <p className="font-semibold text-neutral-900">Morada de entrega</p>
        <p>
          {order.shippingAddress.locality ? `${order.shippingAddress.locality}, ` : ''}
          {order.shippingAddress.municipality}, {order.shippingAddress.province}
        </p>
        {order.shippingAddress.reference && <p className="text-neutral-500">{order.shippingAddress.reference}</p>}
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm">
        <p className="mb-1 font-semibold text-neutral-900">Transporte</p>
        {order.transportOrder ? (
          <Link to={`/fretes/${order.transportOrder.id}`} className="text-xkwanza-600 hover:underline">
            Acompanhar transporte →
          </Link>
        ) : order.status === 'READY_FOR_PICKUP' && (isBuyer || isSeller) ? (
          <div className="space-y-2">
            <p className="text-neutral-500">
              Peça a um transportador XKWANZA para recolher e entregar esta encomenda, com rastreio e código de
              confirmação.
            </p>
            <button
              disabled={isUpdating}
              onClick={handleRequestTransport}
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 disabled:opacity-60"
            >
              Solicitar transporte XKWANZA
            </button>
          </div>
        ) : (
          <p className="text-neutral-500">Sem transporte XKWANZA associado a este pedido.</p>
        )}
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <p className="mb-2 font-semibold text-neutral-900">Histórico</p>
        <ul className="space-y-1 text-sm text-neutral-600">
          {order.statusHistory.map((event) => (
            <li key={event.id} className="flex justify-between">
              <span>
                <OrderStatusBadge status={event.status} />
                {event.note && <span className="ml-2 text-neutral-500">{event.note}</span>}
              </span>
              <span className="text-neutral-400">{new Date(event.createdAt).toLocaleString('pt-AO')}</span>
            </li>
          ))}
        </ul>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {(nextStatus || canCancel) && (
        <div className="flex gap-3">
          {nextStatus && (
            <button
              disabled={isUpdating}
              onClick={() => handleStatusChange(nextStatus)}
              className="flex-1 rounded-md bg-xkwanza-600 px-4 py-2 font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
            >
              {NEXT_STATUS_LABEL[order.status]}
            </button>
          )}
          {canCancel && (
            <button
              disabled={isUpdating}
              onClick={() => handleStatusChange('CANCELLED')}
              className="rounded-md border border-red-300 px-4 py-2 font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              Cancelar pedido
            </button>
          )}
        </div>
      )}
    </div>
  );
}
