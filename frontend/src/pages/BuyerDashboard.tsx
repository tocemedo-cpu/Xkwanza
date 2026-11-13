import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, CreditCard, Truck, PackageCheck, ListOrdered } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getRolePrefix } from '../types/user';
import { fetchMyOrders } from '../services/ordersService';
import { fetchCategories } from '../services/categoriesService';
import { fetchProducts } from '../services/productsService';
import { Category, Order, OrderStatus, Product } from '../types/marketplace';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { ProductCard } from '../components/ProductCard';
import { formatKwanza } from '../utils/angola';

const OPEN_STATUSES: OrderStatus[] = [
  'CREATED',
  'CONFIRMED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'PICKED_UP',
  'IN_TRANSIT',
  'DELIVERED',
];
const IN_TRANSIT_STATUSES: OrderStatus[] = ['PICKED_UP', 'IN_TRANSIT'];
const DELIVERED_STATUSES: OrderStatus[] = ['DELIVERED', 'COMPLETED'];
const PENDING_PAYMENT_STATUSES = ['PENDING', 'PROCESSING'];

function KpiCard({ icon: Icon, label, value }: { icon: typeof ShoppingBag; label: string; value: string | number }) {
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

function OrderRow({ order, prefix }: { order: Order; prefix: string }) {
  return (
    <Link
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
  );
}

export function BuyerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const prefix = user ? getRolePrefix(user.role) : 'comprador';

  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetchMyOrders(1, 100),
      fetchCategories(),
      fetchProducts({ listingType: 'PRODUCT', page: 1, pageSize: 12 }),
    ])
      .then(([myOrders, allCategories, products]) => {
        setOrders(myOrders.items);
        setCategories(allCategories.filter((c) => !c.parentId).slice(0, 8));
        const sorted = [...products.items].sort((a, b) => Number(b.isVerified) - Number(a.isVerified));
        setRecommended(sorted.slice(0, 8));
      })
      .finally(() => setIsLoading(false));
  }, []);

  const openOrders = useMemo(() => orders.filter((o) => OPEN_STATUSES.includes(o.status)), [orders]);
  const completedOrders = useMemo(() => orders.filter((o) => o.status === 'COMPLETED'), [orders]);
  const inTransitOrders = useMemo(() => orders.filter((o) => IN_TRANSIT_STATUSES.includes(o.status)), [orders]);
  const deliveredOrders = useMemo(() => orders.filter((o) => DELIVERED_STATUSES.includes(o.status)), [orders]);
  const pendingPayments = useMemo(
    () => orders.filter((o) => o.payment && PENDING_PAYMENT_STATUSES.includes(o.payment.status)).length,
    [orders],
  );

  const lastOrders = [...orders].slice(0, 5);
  const recentPurchases = [...completedOrders].slice(0, 5);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    const term = search.trim();
    navigate(`/${prefix}/marketplace${term ? `?search=${encodeURIComponent(term)}` : ''}`);
  }

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Olá, {user.name.split(' ')[0]}</h1>
        <p className="text-neutral-500">Explore produtos reais e acompanhe as suas compras na AO Market.</p>
      </div>

      <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white p-2">
        <Search size={18} className="ml-2 shrink-0 text-neutral-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar produtos e serviços..."
          className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
        />
        <button type="submit" className="shrink-0 rounded-lg bg-xkwanza-600 px-4 py-2 text-sm font-semibold text-white hover:bg-xkwanza-700">
          Pesquisar
        </button>
      </form>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/${prefix}/marketplace?categoryId=${c.id}`}
              className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-xkwanza-600 hover:text-xkwanza-700"
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard icon={ListOrdered} label="Pedidos em aberto" value={isLoading ? '—' : openOrders.length} />
        <KpiCard icon={ShoppingBag} label="Compras realizadas" value={isLoading ? '—' : completedOrders.length} />
        <KpiCard icon={CreditCard} label="Pagamentos pendentes" value={isLoading ? '—' : pendingPayments} />
        <KpiCard icon={Truck} label="Encomendas em transporte" value={isLoading ? '—' : inTransitOrders.length} />
        <KpiCard icon={PackageCheck} label="Encomendas entregues" value={isLoading ? '—' : deliveredOrders.length} />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900">Produtos recomendados e recentes</h2>
          <Link to={`/${prefix}/marketplace`} className="text-sm font-medium text-xkwanza-700 hover:underline">
            Explorar produtos
          </Link>
        </div>
        {!isLoading && recommended.length === 0 && (
          <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
            Ainda não há produtos publicados.
          </p>
        )}
        {recommended.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {recommended.map((p) => (
              <ProductCard key={p.id} product={p} linkTo={`/${prefix}/produtos/${p.id}`} />
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">Pedidos em andamento</h2>
            <Link to={`/${prefix}/pedidos?tab=aberto`} className="text-sm font-medium text-xkwanza-700 hover:underline">
              Ver todos
            </Link>
          </div>
          {!isLoading && openOrders.length === 0 && (
            <p className="py-4 text-sm text-neutral-500">Sem pedidos em andamento.</p>
          )}
          {openOrders.length > 0 && (
            <div className="divide-y divide-neutral-100">
              {openOrders.slice(0, 5).map((o) => (
                <OrderRow key={o.id} order={o} prefix={prefix} />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">Últimas encomendas</h2>
            <Link to={`/${prefix}/pedidos`} className="text-sm font-medium text-xkwanza-700 hover:underline">
              Ver todos
            </Link>
          </div>
          {!isLoading && lastOrders.length === 0 && <p className="py-4 text-sm text-neutral-500">Ainda não fez pedidos.</p>}
          {lastOrders.length > 0 && (
            <div className="divide-y divide-neutral-100">
              {lastOrders.map((o) => (
                <OrderRow key={o.id} order={o} prefix={prefix} />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">Compras recentes</h2>
            <Link to={`/${prefix}/pedidos?tab=historico`} className="text-sm font-medium text-xkwanza-700 hover:underline">
              Ver histórico
            </Link>
          </div>
          {!isLoading && recentPurchases.length === 0 && (
            <p className="py-4 text-sm text-neutral-500">Ainda não concluiu nenhuma compra.</p>
          )}
          {recentPurchases.length > 0 && (
            <div className="divide-y divide-neutral-100">
              {recentPurchases.map((o) => (
                <OrderRow key={o.id} order={o} prefix={prefix} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
