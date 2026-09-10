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
import { Support } from './pages/Support';
import { SupportTicketDetail } from './pages/SupportTicketDetail';
import { AdminSupport } from './pages/AdminSupport';
import { AdminProducts } from './pages/AdminProducts';
import { AdminOrders } from './pages/AdminOrders';
import { AdminTransporters } from './pages/AdminTransporters';
import { AdminAuditLog } from './pages/AdminAuditLog';
import { Negociacoes } from './pages/Negociacoes';
import { Entregas } from './pages/Entregas';
import { Notificacoes } from './pages/Notificacoes';
import { AvaliacoesRecebidas } from './pages/AvaliacoesRecebidas';
import { MinhasAvaliacoes } from './pages/MinhasAvaliacoes';
import { Rotas } from './pages/Rotas';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminCategories } from './pages/AdminCategories';
import { AdminDeliveries } from './pages/AdminDeliveries';
import { AdminQuotes } from './pages/AdminQuotes';
import { AdminReviews } from './pages/AdminReviews';
import { AdminNotifications } from './pages/AdminNotifications';
import { AdminReports } from './pages/AdminReports';
import { NotFound } from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleGuard } from './components/RoleGuard';
import { DashboardLayout } from './layouts/DashboardLayout';

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
          {/* Produtor */}
          <Route element={<RoleGuard allowedRoles={['PRODUCER']} />}>
            <Route path="/produtor/dashboard" element={<Dashboard />} />
            <Route path="/produtor/marketplace" element={<Marketplace />} />
            <Route path="/produtor/produtos/:id" element={<ProductDetail />} />
            <Route path="/produtor/stock" element={<MyProducts />} />
            <Route path="/produtor/stock/novo" element={<ProductForm />} />
            <Route path="/produtor/stock/:id/editar" element={<ProductForm />} />
            <Route path="/produtor/pedidos" element={<ReceivedOrders />} />
            <Route path="/produtor/pedidos/:id" element={<OrderDetail />} />
            <Route path="/produtor/negociacoes" element={<Negociacoes />} />
            <Route path="/produtor/entregas" element={<Entregas />} />
            <Route path="/produtor/fretes/:id" element={<TransportOrderDetail />} />
            <Route path="/produtor/avaliacoes" element={<AvaliacoesRecebidas />} />
            <Route path="/produtor/documentos" element={<Formalization />} />
            <Route path="/produtor/documentos/diagnostico" element={<FormalizationDiagnosis />} />
            <Route path="/produtor/inss" element={<INSS />} />
            <Route path="/produtor/carteira" element={<Wallet />} />
            <Route path="/produtor/contas-bancarias" element={<BankAccounts />} />
            <Route path="/produtor/historico" element={<EconomicHistory />} />
            <Route path="/produtor/notificacoes" element={<Notificacoes />} />
            <Route path="/produtor/suporte" element={<Support />} />
            <Route path="/produtor/suporte/:id" element={<SupportTicketDetail />} />
            <Route path="/produtor/conta" element={<MyProfile />} />
            <Route path="/produtor/perfil" element={<ProducerProfile />} />
          </Route>

          {/* Comerciante */}
          <Route element={<RoleGuard allowedRoles={['MERCHANT']} />}>
            <Route path="/comerciante/dashboard" element={<Dashboard />} />
            <Route path="/comerciante/marketplace" element={<Marketplace />} />
            <Route path="/comerciante/produtos/:id" element={<ProductDetail />} />
            <Route path="/comerciante/stock" element={<MyProducts />} />
            <Route path="/comerciante/stock/novo" element={<ProductForm />} />
            <Route path="/comerciante/stock/:id/editar" element={<ProductForm />} />
            <Route path="/comerciante/pedidos" element={<ReceivedOrders />} />
            <Route path="/comerciante/pedidos/:id" element={<OrderDetail />} />
            <Route path="/comerciante/negociacoes" element={<Negociacoes />} />
            <Route path="/comerciante/entregas" element={<Entregas />} />
            <Route path="/comerciante/fretes/:id" element={<TransportOrderDetail />} />
            <Route path="/comerciante/avaliacoes" element={<AvaliacoesRecebidas />} />
            <Route path="/comerciante/documentos" element={<Formalization />} />
            <Route path="/comerciante/documentos/diagnostico" element={<FormalizationDiagnosis />} />
            <Route path="/comerciante/inss" element={<INSS />} />
            <Route path="/comerciante/carteira" element={<Wallet />} />
            <Route path="/comerciante/contas-bancarias" element={<BankAccounts />} />
            <Route path="/comerciante/historico" element={<EconomicHistory />} />
            <Route path="/comerciante/notificacoes" element={<Notificacoes />} />
            <Route path="/comerciante/suporte" element={<Support />} />
            <Route path="/comerciante/suporte/:id" element={<SupportTicketDetail />} />
            <Route path="/comerciante/conta" element={<MyProfile />} />
            <Route path="/comerciante/perfil" element={<MerchantProfile />} />
          </Route>

          {/* Comprador */}
          <Route element={<RoleGuard allowedRoles={['BUYER']} />}>
            <Route path="/comprador/dashboard" element={<Dashboard />} />
            <Route path="/comprador/marketplace" element={<Marketplace />} />
            <Route path="/comprador/produtos/:id" element={<ProductDetail />} />
            <Route path="/comprador/carrinho" element={<Cart />} />
            <Route path="/comprador/checkout" element={<Checkout />} />
            <Route path="/comprador/pedidos" element={<MyOrders />} />
            <Route path="/comprador/pedidos/:id" element={<OrderDetail />} />
            <Route path="/comprador/negociacoes" element={<Negociacoes />} />
            <Route path="/comprador/entregas" element={<Entregas />} />
            <Route path="/comprador/fretes/:id" element={<TransportOrderDetail />} />
            <Route path="/comprador/avaliacoes" element={<MinhasAvaliacoes />} />
            <Route path="/comprador/notificacoes" element={<Notificacoes />} />
            <Route path="/comprador/suporte" element={<Support />} />
            <Route path="/comprador/suporte/:id" element={<SupportTicketDetail />} />
            <Route path="/comprador/conta" element={<MyProfile />} />
          </Route>

          {/* Transportador */}
          <Route element={<RoleGuard allowedRoles={['TRANSPORTER']} />}>
            <Route path="/transportador/dashboard" element={<Dashboard />} />
            <Route path="/transportador/marketplace" element={<Marketplace />} />
            <Route path="/transportador/produtos/:id" element={<ProductDetail />} />
            <Route path="/transportador/fretes" element={<TransportJobs />} />
            <Route path="/transportador/meus-fretes" element={<MyTransportJobs />} />
            <Route path="/transportador/fretes/:id" element={<TransportOrderDetail />} />
            <Route path="/transportador/veiculo" element={<TransporterProfile />} />
            <Route path="/transportador/rotas" element={<Rotas />} />
            <Route path="/transportador/rendimentos" element={<EconomicHistory />} />
            <Route path="/transportador/avaliacoes" element={<AvaliacoesRecebidas />} />
            <Route path="/transportador/documentos" element={<Formalization />} />
            <Route path="/transportador/documentos/diagnostico" element={<FormalizationDiagnosis />} />
            <Route path="/transportador/inss" element={<INSS />} />
            <Route path="/transportador/carteira" element={<Wallet />} />
            <Route path="/transportador/contas-bancarias" element={<BankAccounts />} />
            <Route path="/transportador/notificacoes" element={<Notificacoes />} />
            <Route path="/transportador/suporte" element={<Support />} />
            <Route path="/transportador/suporte/:id" element={<SupportTicketDetail />} />
            <Route path="/transportador/conta" element={<MyProfile />} />
          </Route>

          {/* Administrador da plataforma */}
          <Route element={<RoleGuard allowedRoles={['ADMIN', 'SUPPORT']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/utilizadores" element={<AdminUsers />} />
            <Route path="/admin/produtores" element={<AdminUsers role="PRODUCER" />} />
            <Route path="/admin/compradores" element={<AdminUsers role="BUYER" />} />
            <Route path="/admin/transportadores" element={<AdminTransporters />} />
            <Route path="/admin/categorias" element={<AdminCategories />} />
            <Route path="/admin/produtos" element={<AdminProducts />} />
            <Route path="/admin/pedidos" element={<AdminOrders />} />
            <Route path="/admin/pedidos/:id" element={<OrderDetail />} />
            <Route path="/admin/fretes/:id" element={<TransportOrderDetail />} />
            <Route path="/admin/entregas" element={<AdminDeliveries />} />
            <Route path="/admin/negociacoes" element={<AdminQuotes />} />
            <Route path="/admin/avaliacoes" element={<AdminReviews />} />
            <Route path="/admin/pagamentos" element={<AdminPayments />} />
            <Route path="/admin/notificacoes" element={<AdminNotifications />} />
            <Route path="/admin/formalizacao" element={<AdminFormalization />} />
            <Route path="/admin/inss" element={<AdminINSS />} />
            <Route path="/admin/reclamacoes" element={<AdminSupport />} />
            <Route path="/admin/reclamacoes/:id" element={<SupportTicketDetail />} />
            <Route path="/admin/auditoria" element={<AdminAuditLog />} />
            <Route path="/admin/relatorios" element={<AdminReports />} />
            <Route path="/admin/conta" element={<MyProfile />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
