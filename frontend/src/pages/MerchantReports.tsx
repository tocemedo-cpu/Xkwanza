import { useEffect, useState } from 'react';
import { TrendingUp, ShoppingBag, Package, Star, ShoppingCart, Boxes } from 'lucide-react';
import { fetchMyProducts } from '../services/productsService';
import { fetchMyOrders, fetchReceivedOrders } from '../services/ordersService';
import { fetchSellerStats } from '../services/economicsService';
import { Order, Product } from '../types/marketplace';
import { SellerStats } from '../types/reviews';
import { formatKwanza } from '../utils/angola';

function StatCard({ icon: Icon, label, value }: { icon: typeof TrendingUp; label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="mb-1 flex items-center gap-2 text-xkwanza-600">
        <Icon size={18} />
        <h2 className="font-semibold text-neutral-900">{label}</h2>
      </div>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}

export function MerchantReports() {
  const [products, setProducts] = useState<Product[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [receivedOrders, setReceivedOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchMyProducts(), fetchMyOrders(1, 100), fetchReceivedOrders(1, 100), fetchSellerStats()])
      .then(([myProducts, mine, received, sellerStats]) => {
        setProducts(myProducts);
        setMyOrders(mine.items);
        setReceivedOrders(received.items);
        setStats(sellerStats);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const completedPurchases = myOrders.filter((o) => o.status === 'COMPLETED');
  const totalSpent = completedPurchases.reduce((sum, o) => sum + Number(o.total), 0);
  const availableStock = products
    .filter((p) => p.status === 'PUBLISHED' && p.listingType === 'PRODUCT')
    .reduce((sum, p) => sum + (p.stock ?? 0), 0);

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Relatórios</h1>
        <p className="text-neutral-500">Resumo combinado da sua actividade de compra e venda na AO Market.</p>
      </div>

      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && (
        <>
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-500">Vendas</h2>
            <div className="grid gap-4 sm:grid-cols-4">
              <StatCard icon={TrendingUp} label="Rendimento total" value={formatKwanza(stats?.totalRevenue ?? 0)} />
              <StatCard icon={ShoppingBag} label="Pedidos concluídos" value={stats?.totalOrders ?? 0} />
              <StatCard icon={Package} label="Itens vendidos" value={stats?.totalItemsSold ?? 0} />
              <StatCard
                icon={Star}
                label="Reputação"
                value={stats?.averageRating ? `${stats.averageRating.toFixed(1)} (${stats.ratingCount})` : '—'}
              />
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-500">Compras</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard icon={ShoppingCart} label="Total gasto" value={formatKwanza(totalSpent)} />
              <StatCard icon={ShoppingCart} label="Compras concluídas" value={completedPurchases.length} />
              <StatCard icon={ShoppingCart} label="Pedidos de compra feitos" value={myOrders.length} />
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-500">Catálogo e pedidos recebidos</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard icon={Package} label="Produtos publicados" value={products.filter((p) => p.status === 'PUBLISHED').length} />
              <StatCard icon={Boxes} label="Stock disponível" value={availableStock} />
              <StatCard icon={ShoppingBag} label="Pedidos recebidos" value={receivedOrders.length} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
