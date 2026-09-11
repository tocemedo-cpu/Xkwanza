import { TRANSPORT_STATUS_LABELS, TransportStatus } from '../types/logistics';

const STATUS_STYLES: Record<TransportStatus, string> = {
  REQUESTED: 'bg-neutral-100 text-neutral-700',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  PICKUP: 'bg-gold-100 text-gold-700',
  PICKED_UP: 'bg-gold-100 text-gold-700',
  IN_TRANSIT: 'bg-gold-100 text-gold-700',
  DELIVERED: 'bg-xkwanza-100 text-xkwanza-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export function TransportStatusBadge({ status }: { status: TransportStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {TRANSPORT_STATUS_LABELS[status]}
    </span>
  );
}
