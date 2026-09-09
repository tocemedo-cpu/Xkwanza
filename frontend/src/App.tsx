import { Route, Routes } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
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
import { NotFound } from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleGuard } from './components/RoleGuard';
import { DashboardLayout } from './layouts/DashboardLayout';

const SELLER_ROLES = ['PRODUCER', 'MERCHANT'] as const;

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/entrar" element={<Login />} />
      <Route path="/registar" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/painel" element={<Dashboard />} />

          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/produtos/:id" element={<ProductDetail />} />

          <Route path="/carrinho" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/meus-pedidos" element={<MyOrders />} />
          <Route path="/pedidos/:id" element={<OrderDetail />} />

          <Route element={<RoleGuard allowedRoles={[...SELLER_ROLES]} />}>
            <Route path="/meus-produtos" element={<MyProducts />} />
            <Route path="/meus-produtos/novo" element={<ProductForm />} />
            <Route path="/meus-produtos/:id/editar" element={<ProductForm />} />
            <Route path="/pedidos-recebidos" element={<ReceivedOrders />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
