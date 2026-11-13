import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, ShoppingCart, TrendingUp, CreditCard, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getRolePrefix } from '../types/user';
import { fetchMyProducts } from '../services/productsService';
import { fetchMyOrders, fetchReceivedOrders } from '../services/ordersService';
import { fetchSellerStats } from '../services/economicsService';
import { Order, OrderStatus, Product } from '../types/marketplace';
import { SellerStats } from '../types/reviews';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { ProductCard } from '../components/ProductCard';
import { formatKwanza } from '../utils/angola';

const PENDING_PAYMENT_STATUSES = ['PENDING', 'PROCESSING'];
const PROCESSING_STATUSES: OrderStatus[] = ['CREATED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'IN_TRANSIT'];

function KpiCard({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="mb-1 flex items-center gap-2 text-xkwanza-600">
        <Icon size={16} />
        <span className="text-xs font-medium text-neutral-500">{label}</span>
      </div>
      <p className="text-xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}

export function MerchantDashboard() {
  const { user } = useAuth();
  const prefix = user ? getRolePrefix(user.role) : 'comerciante';

  const [products, setProducts] = useState<Product[]>([]);
  const [receivedOrders, setReceivedOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchMyProducts(), fetchReceivedOrders(1, 100), fetchMyOrders(1, 100), fetchSellerStats()])
      .then(([myProducts, received, mine, sellerStats]) => {
        setProducts(myProducts);
        setReceivedOrders(received.items);
        setMyOrders(mine.items);
        setStats(sellerStats);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const availableProducts = products.filter((p) => p.status === 'PUBLISHED');
  const featuredProducts = [...availableProducts].sort((a, b) => Number(b.isVerified) - Number(a.isVerified)).slice(0, 4);
  const recentProducts = availableProducts.slice(0, 4);

  const completedPurchases = myOrders.filter((o) => o.status === 'COMPLETED');
  const processingOrders = receivedOrders.filter((o) => PROCESSING_STATUSES.includes(o.status));
  const pendingPayments =
    receivedOrders.filter((o) => o.payment && PENDING_PAYMENT_STATUSES.includes(o.payment.status)).length +
    myOrders.filter((o) => o.payment && PENDING_PAYMENT_STATUSES.includes(o.payment.status)).length;

  const lastOrders = [...receivedOrders].slice(0, 5);
  const totalSpentOnPurchases = completedPurchases.reduce((sum, o) => sum + Number(o.total), 0);

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Olá, {user.name.split(' ')[0]}</h1>
        <p className="text-neutral-500">Resumo da sua actividade comercial na AO Market.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard icon={Package} label="Produtos disponíveis" value={isLoading ? '—' : availableProducts.length} />
        <KpiCard icon={ShoppingBag} label="Pedidos recebidos" value={isLoading ? '—' : receivedOrders.length} />
        <KpiCard icon={ShoppingCart} label="Compras realizadas" value={isLoading ? '—' : completedPurchases.length} />
        <KpiCard icon={TrendingUp} label="Vendas realizadas" value={isLoading ? '—' : (stats?.totalOrders ?? 0)} />
        <KpiCard icon={CreditCard} label="Pagamentos pendentes" value={isLoading ? '—' : pendingPayments} />
        <KpiCard icon={Clock} label="Encomendas em processamento" value={isLoading ? '—' : processingOrders.length} />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900">Produtos em destaque</h2>
          <Link to={`/${prefix}/produtos`} className="text-sm font-medium text-xkwanza-700 hover:underline">
            Ver todos
          </Link>
        </div>
        {!isLoading && featuredProducts.length === 0 && (
          <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
            Ainda não tem produtos publicados.
          </p>
        )}
        {featuredProducts.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} linkTo={`/${prefix}/produtos/${p.id}`} />
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">Produtos recentemente adicionados</h2>
            <Link to={`/${prefix}/produtos`} className="text-sm font-medium text-xkwanza-700 hover:underline">
              Ver todos
            </Link>
          </div>
          {!isLoading && recentProducts.length === 0 && (
            <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
              Ainda não tem produtos.
            </p>
          )}
          {recentProducts.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
              {recentProducts.map((p) => (
                <ProductCard key={p.id} product={p} linkTo={`/${prefix}/produtos/${p.id}`} />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">Últimos pedidos</h2>
            <Link to={`/${prefix}/pedidos`} className="text-sm font-medium text-xkwanza-700 hover:underline">
              Ver todos
            </Link>
          </div>
          {!isLoading && lastOrders.length === 0 && (
            <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
              Ainda não recebeu nenhum pedido.
            </p>
          )}
          {lastOrders.length > 0 && (
            <div className="divide-y divide-neutral-100">
              {lastOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/${prefix}/pedidos/${order.id}`}
                  className="flex items-center justify-between gap-3 py-3 text-sm hover:bg-neutral-50"
                >
                  <div>
                    <p className="font-medium text-neutral-900">Pedido #{order.id.slice(0, 8)}</p>
                    <p className="text-neutral-500">{new Date(order.createdAt).toLocaleDateString('pt-AO')}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-neutral-900">{formatKwanza(Number(order.total))}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900">Resumo de compras e vendas</h2>
          <Link to={`/${prefix}/relatorios`} className="text-sm font-medium text-xkwanza-700 hover:underline">
            Ver relatório completo
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-neutral-700">Vendas</p>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Rendimento total</span>
              <span className="font-semibold text-neutral-900">{formatKwanza(stats?.totalRevenue ?? 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Pedidos concluídos</span>
              <span className="font-semibold text-neutral-900">{stats?.totalOrders ?? 0}</span>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-neutral-700">Compras</p>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Total gasto</span>
              <span className="font-semibold text-neutral-900">{formatKwanza(totalSpentOnPurchases)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Compras concluídas</span>
              <span className="font-semibold text-neutral-900">{completedPurchases.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
