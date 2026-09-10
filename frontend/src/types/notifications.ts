export type NotificationType =
  | 'NEW_ORDER'
  | 'ORDER_ACCEPTED'
  | 'ORDER_REJECTED'
  | 'PAYMENT'
  | 'TRANSPORT'
  | 'PICKUP'
  | 'DELIVERY'
  | 'DOCUMENT_PENDING'
  | 'FORMALIZATION'
  | 'INSS'
  | 'STATUS_CHANGE'
  | 'SUPPORT'
  | 'QUOTE';

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  NEW_ORDER: 'Novo pedido',
  ORDER_ACCEPTED: 'Pedido aceite',
  ORDER_REJECTED: 'Pedido rejeitado',
  PAYMENT: 'Pagamento',
  TRANSPORT: 'Transporte',
  PICKUP: 'Recolha',
  DELIVERY: 'Entrega',
  DOCUMENT_PENDING: 'Documento pendente',
  FORMALIZATION: 'Formalização',
  INSS: 'INSS',
  STATUS_CHANGE: 'Mudança de estado',
  SUPPORT: 'Suporte',
  QUOTE: 'Negociação',
};

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: 'IN_APP' | 'EMAIL' | 'PUSH';
  title: string;
  body: string;
  read: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user?: { id: string; name: string; role: string };
}
