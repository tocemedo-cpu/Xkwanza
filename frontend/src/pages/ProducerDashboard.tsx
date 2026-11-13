import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, Boxes, ShoppingBag, TrendingUp, CreditCard, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getRolePrefix } from '../types/user';
import { fetchMyProducts } from '../services/productsService';
import { fetchReceivedOrders } from '../services/ordersService';
import { fetchSellerStats } from '../services/economicsService';
import { Order, Product } from '../types/marketplace';
import { SellerStats } from '../types/reviews';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { ProductCard } from '../components/ProductCard';
import { formatKwanza } from '../utils/angola';

const PENDING_PAYMENT_STATUSES = ['PENDING', 'PROCESSING'];

function KpiCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: string | number;
}) {
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

export function ProducerDashboard() {
  const { user } = useAuth();
  const prefix = user ? getRolePrefix(user.role) : 'produtor';

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchMyProducts(), fetchReceivedOrders(1, 100), fetchSellerStats()])
      .then(([myProducts, receivedOrders, sellerStats]) => {
        setProducts(myProducts);
        setOrders(receivedOrders.items);
        setStats(sellerStats);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const publishedProducts = products.filter((p) => p.status === 'PUBLISHED');
  const pendingProducts = products.filter((p) => p.status === 'DRAFT');
  const availableStock = publishedProducts
    .filter((p) => p.listingType === 'PRODUCT')
    .reduce((sum, p) => sum + (p.stock ?? 0), 0);
  const pendingPayments = orders.filter((o) => o.payment && PENDING_PAYMENT_STATUSES.includes(o.payment.status)).length;

  const recentProducts = publishedProducts.slice(0, 4);
  const lastOrders = [...orders].slice(0, 5);

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Olá, {user.name.split(' ')[0]}</h1>
          <p className="text-neutral-500">Resumo da sua actividade como produtor na AO Market.</p>
        </div>
        <Link
          to={`/${prefix}/produtos/novo`}
          className="flex items-center gap-2 rounded-lg bg-xkwanza-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-xkwanza-700"
        >
          <Plus size={18} />
          Adicionar produto
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard icon={Package} label="Produtos publicados" value={isLoading ? '—' : publishedProducts.length} />
        <KpiCard icon={Clock} label="Produtos pendentes" value={isLoading ? '—' : pendingProducts.length} />
        <KpiCard icon={Boxes} label="Stock disponível" value={isLoading ? '—' : availableStock} />
        <KpiCard icon={ShoppingBag} label="Pedidos recebidos" value={isLoading ? '—' : orders.length} />
        <KpiCard icon={TrendingUp} label="Vendas realizadas" value={isLoading ? '—' : (stats?.totalOrders ?? 0)} />
        <KpiCard icon={CreditCard} label="Pagamentos pendentes" value={isLoading ? '—' : pendingPayments} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">Produtos recentemente publicados</h2>
            <Link to={`/${prefix}/produtos`} className="text-sm font-medium text-xkwanza-700 hover:underline">
              Ver todos
            </Link>
          </div>
          {!isLoading && recentProducts.length === 0 && (
            <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
              Ainda não tem produtos. Crie o primeiro.
            </p>
          )}
          {recentProducts.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {recentProducts.map((p) => (
                <ProductCard key={p.id} product={p} linkTo={`/${prefix}/produtos/${p.id}`} />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">Resumo das vendas</h2>
            <Link to={`/${prefix}/historico`} className="text-sm font-medium text-xkwanza-700 hover:underline">
              Ver mais
            </Link>
          </div>
          {stats && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Rendimento total</span>
                <span className="font-semibold text-neutral-900">{formatKwanza(stats.totalRevenue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Pedidos concluídos</span>
                <span className="font-semibold text-neutral-900">{stats.totalOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Itens vendidos</span>
                <span className="font-semibold text-neutral-900">{stats.totalItemsSold}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Reputação</span>
                <span className="font-semibold text-neutral-900">
                  {stats.averageRating ? stats.averageRating.toFixed(1) : '—'}
                  {stats.ratingCount > 0 && <span className="ml-1 font-normal text-neutral-400">({stats.ratingCount})</span>}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900">Últimos pedidos recebidos</h2>
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
  );
}
