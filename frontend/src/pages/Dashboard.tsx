import { useAuth } from '../hooks/useAuth';
import { ProducerDashboard } from './ProducerDashboard';
import { BuyerDashboard } from './BuyerDashboard';
import { MerchantDashboard } from './MerchantDashboard';
import { TransporterDashboard } from './TransporterDashboard';

export function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;

  if (user.role === 'PRODUCER') return <ProducerDashboard />;
  if (user.role === 'BUYER') return <BuyerDashboard />;
  if (user.role === 'MERCHANT') return <MerchantDashboard />;
  if (user.role === 'TRANSPORTER') return <TransporterDashboard />;

  return null;
}
