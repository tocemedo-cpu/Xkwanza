import { OrderStatus } from './marketplace';
import { UserRole } from './user';

export interface PlatformReport {
  usersByRole: Partial<Record<UserRole, number>>;
  ordersByStatus: Partial<Record<OrderStatus, number>>;
  totalRevenue: number;
  pendingPayments: number;
  openSupportTickets: number;
  openQuoteRequests: number;
  activeProducts: number;
}
