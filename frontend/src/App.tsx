import { Route, Routes } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { RegisterRoleSelect } from './pages/RegisterRoleSelect';
import { Register } from './pages/Register';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { Dashboard } from './pages/Dashboard';
import { Marketplace } from './pages/Marketplace';
import { ProductDetail } from './pages/ProductDetail';
import { MyProducts } from './pages/MyProducts';
import { ProductForm } from './pages/ProductForm';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { MyOrders } from './pages/MyOrders';
import { ReceivedOrders } from './pages/ReceivedOrders';
import { OrderDetail } from './pages/OrderDetail';
import { TransporterProfile } from './pages/TransporterProfile';
import { ProducerProfile } from './pages/ProducerProfile';
import { MerchantProfile } from './pages/MerchantProfile';
import { MyProfile } from './pages/MyProfile';
import { TransportJobs } from './pages/TransportJobs';
import { MyTransportJobs } from './pages/MyTransportJobs';
import { TransportOrderDetail } from './pages/TransportOrderDetail';
import { Wallet } from './pages/Wallet';
import { BankAccounts } from './pages/BankAccounts';
import { AdminPayments } from './pages/AdminPayments';
import { EconomicHistory } from './pages/EconomicHistory';
import { Formalization } from './pages/Formalization';
import { FormalizationDiagnosis } from './pages/FormalizationDiagnosis';
import { AdminFormalization } from './pages/AdminFormalization';
import { AdminUsers } from './pages/AdminUsers';
import { INSS } from './pages/INSS';
import { AdminINSS } from './pages/AdminINSS';
import { NotFound } from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleGuard } from './components/RoleGuard';
import { DashboardLayout } from './layouts/DashboardLayout';

const SELLER_ROLES = ['PRODUCER', 'MERCHANT'] as const;
const TRANSPORTER_ROLES = ['TRANSPORTER'] as const;
const STAFF_ROLES = ['ADMIN', 'SUPPORT'] as const;
const EARNER_ROLES = ['PRODUCER', 'MERCHANT', 'TRANSPORTER'] as const;

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/entrar" element={<Login />} />
      <Route path="/registar" element={<RegisterRoleSelect />} />
      <Route path="/registar/:role" element={<Register />} />
      <Route path="/termos" element={<Terms />} />
      <Route path="/privacidade" element={<Privacy />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/painel" element={<Dashboard />} />
          <Route path="/meu-perfil" element={<MyProfile />} />

          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/produtos/:id" element={<ProductDetail />} />

          <Route path="/carrinho" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/meus-pedidos" element={<MyOrders />} />
          <Route path="/pedidos/:id" element={<OrderDetail />} />
          <Route path="/fretes/:id" element={<TransportOrderDetail />} />
          <Route path="/carteira" element={<Wallet />} />
          <Route path="/contas-bancarias" element={<BankAccounts />} />
          <Route path="/formalizacao" element={<Formalization />} />
          <Route path="/formalizacao/diagnostico" element={<FormalizationDiagnosis />} />
          <Route path="/inss" element={<INSS />} />

          <Route element={<RoleGuard allowedRoles={[...SELLER_ROLES]} />}>
            <Route path="/meus-produtos" element={<MyProducts />} />
            <Route path="/meus-produtos/novo" element={<ProductForm />} />
            <Route path="/meus-produtos/:id/editar" element={<ProductForm />} />
            <Route path="/pedidos-recebidos" element={<ReceivedOrders />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={['PRODUCER']} />}>
            <Route path="/meu-perfil-produtor" element={<ProducerProfile />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={['MERCHANT']} />}>
            <Route path="/meu-perfil-comerciante" element={<MerchantProfile />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={[...TRANSPORTER_ROLES]} />}>
            <Route path="/meu-perfil-transportador" element={<TransporterProfile />} />
            <Route path="/fretes" element={<TransportJobs />} />
            <Route path="/meus-fretes" element={<MyTransportJobs />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={[...STAFF_ROLES]} />}>
            <Route path="/admin/utilizadores" element={<AdminUsers />} />
            <Route path="/admin/pagamentos" element={<AdminPayments />} />
            <Route path="/admin/formalizacao" element={<AdminFormalization />} />
            <Route path="/admin/inss" element={<AdminINSS />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={[...EARNER_ROLES]} />}>
            <Route path="/historico" element={<EconomicHistory />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
