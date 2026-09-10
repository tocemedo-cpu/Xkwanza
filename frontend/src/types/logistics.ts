import { Order } from './marketplace';

export type TransportStatus =
  | 'REQUESTED'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'PICKUP'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

export const TRANSPORT_STATUS_LABELS: Record<TransportStatus, string> = {
  REQUESTED: 'Aberto a propostas',
  ASSIGNED: 'Atribuído',
  ACCEPTED: 'Aceite pelo transportador',
  PICKUP: 'A caminho da recolha',
  PICKED_UP: 'Recolhido',
  IN_TRANSIT: 'Em trânsito',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
};

export type TransporterCategory = 'INDIVIDUAL' | 'EMPRESA';

export const TRANSPORTER_CATEGORY_LABELS: Record<TransporterCategory, string> = {
  INDIVIDUAL: 'Transportador independente',
  EMPRESA: 'Empresa de transporte',
};

export interface TransporterUserSummary {
  id: string;
  name: string;
  phone: string | null;
  email?: string | null;
  province?: string;
  municipality?: string;
  isActive?: boolean;
  isVerifiedBadge?: boolean;
}

export interface Transporter {
  id: string;
  userId: string;
  transporterCategory: TransporterCategory | null;
  vehicleType: string | null;
  vehiclePlate: string | null;
  cargoCapacity: string | null;
  cargoType: string | null;
  serviceAreas: string[];
  servicePrice: string | null;
  isAvailable: boolean;
  averageRating: string;
  createdAt: string;
  updatedAt: string;
  user?: TransporterUserSummary;
}

export interface TransportProposal {
  id: string;
  transportOrderId: string;
  transporterId: string;
  price: string;
  message: string | null;
  accepted: boolean;
  createdAt: string;
  transporter: Transporter;
}

export interface TransportStatusEvent {
  id: string;
  transportOrderId: string;
  status: TransportStatus;
  note: string | null;
  createdAt: string;
}

export interface TransportOrder {
  id: string;
  orderId: string;
  transporterId: string | null;
  status: TransportStatus;
  proposedPrice: string | null;
  agreedPrice: string | null;
  pickupOtp: string | null;
  pickupAt: string | null;
  deliveryOtp: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  order: Order;
  transporter: Transporter | null;
  proposals: TransportProposal[];
  statusHistory: TransportStatusEvent[];
}

export interface CreateProposalPayload {
  price: number;
  message?: string;
}

export interface UpsertTransporterPayload {
  transporterCategory?: TransporterCategory;
  vehicleType?: string;
  vehiclePlate?: string;
  cargoCapacity?: string;
  cargoType?: string;
  serviceAreas?: string[];
  servicePrice?: string;
}
