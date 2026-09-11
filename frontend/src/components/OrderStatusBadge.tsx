import { ORDER_STATUS_LABELS, OrderStatus } from '../types/marketplace';

const STATUS_STYLES: Record<OrderStatus, string> = {
  CREATED: 'bg-neutral-100 text-neutral-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-blue-100 text-blue-700',
  READY_FOR_PICKUP: 'bg-gold-100 text-gold-700',
  PICKED_UP: 'bg-gold-100 text-gold-700',
  IN_TRANSIT: 'bg-gold-100 text-gold-700',
  DELIVERED: 'bg-xkwanza-100 text-xkwanza-700',
  COMPLETED: 'bg-xkwanza-100 text-xkwanza-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
