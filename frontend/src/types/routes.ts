import { Address, OrderStatus } from './marketplace';
import { TransportOrder } from './logistics';

export type RouteStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export const ROUTE_STATUS_LABELS: Record<RouteStatus, string> = {
  PLANNED: 'Planeada',
  IN_PROGRESS: 'Em curso',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
};

export type RouteStopStatus = 'PENDING' | 'COMPLETED' | 'SKIPPED';

export const ROUTE_STOP_STATUS_LABELS: Record<RouteStopStatus, string> = {
  PENDING: 'Pendente',
  COMPLETED: 'Concluída',
  SKIPPED: 'Ignorada',
};

// Versão reduzida do TransportOrder tal como devolvida numa paragem de rota: o backend
// selecciona apenas alguns campos da encomenda associada (ver transporterRoutes.service.ts,
// routeInclude.stops.include.transportOrder.include.order.select).
export type RouteStopTransportOrder = Omit<TransportOrder, 'order'> & {
  order: {
    id: string;
    status: OrderStatus;
    shippingAddress: Address;
  };
};

export interface RouteStop {
  id: string;
  routeId: string;
  transportOrderId: string;
  sequence: number;
  status: RouteStopStatus;
  createdAt: string;
  updatedAt: string;
  transportOrder: RouteStopTransportOrder;
}

export interface Route {
  id: string;
  transporterId: string;
  name: string;
  plannedDate: string | null;
  status: RouteStatus;
  createdAt: string;
  updatedAt: string;
  stops: RouteStop[];
}

export interface CreateRoutePayload {
  name: string;
  plannedDate?: string;
}

export interface UpdateRoutePayload {
  name?: string;
  plannedDate?: string | null;
  status?: RouteStatus;
}

export interface AddRouteStopPayload {
  transportOrderId: string;
}

export interface UpdateRouteStopPayload {
  sequence?: number;
  status?: RouteStopStatus;
}
