export type PaymentMethod = 'BANK_TRANSFER' | 'PAYMENT_REFERENCE' | 'WALLET' | 'BANK_INTEGRATION' | 'FINTECH_INTEGRATION';

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  BANK_TRANSFER: 'Transferência bancária',
  PAYMENT_REFERENCE: 'Referência de pagamento',
  WALLET: 'Carteira XKWANZA',
  BANK_INTEGRATION: 'Integração bancária',
  FINTECH_INTEGRATION: 'Integração fintech',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Aguarda pagamento',
  PROCESSING: 'Em verificação',
  PAID: 'Pago',
  FAILED: 'Falhou',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
};

export interface PaymentStatusEvent {
  id: string;
  paymentId: string;
  status: PaymentStatus;
  note: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: string;
  currency: string;
  custodyHeld: boolean;
  releasedAt: string | null;
  externalRef: string | null;
  createdAt: string;
  updatedAt: string;
  statusHistory: PaymentStatusEvent[];
}

export interface Wallet {
  id: string;
  userId: string;
  balance: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccount {
  id: string;
  userId: string;
  bankName: string;
  iban: string | null;
  accountHolder: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateBankAccountPayload {
  bankName: string;
  iban?: string;
  accountHolder: string;
  isDefault?: boolean;
}

export interface PendingPaymentOrder {
  id: string;
  createdAt: string;
  buyer: { id: string; name: string; phone: string };
  payment: Payment;
}
