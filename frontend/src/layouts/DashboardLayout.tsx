import { NavLink, Outlet } from 'react-router-dom';
import { LogOut, ShieldCheck, ShoppingCart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { ROLE_LABELS } from '../types/user';

const SELLER_ROLES = ['PRODUCER', 'MERCHANT'];
const TRANSPORTER_ROLE = 'TRANSPORTER';
const STAFF_ROLES = ['ADMIN', 'SUPPORT'];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium ${
    isActive ? 'bg-xkwanza-50 text-xkwanza-700' : 'text-neutral-600 hover:bg-neutral-100'
  }`;

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  if (!user) return null;

  const isSeller = SELLER_ROLES.includes(user.role);
  const isTransporter = user.role === TRANSPORTER_ROLE;
  const isStaff = STAFF_ROLES.includes(user.role);
  const hasWallet = isSeller || isTransporter;

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <NavLink to="/painel" className="text-lg font-bold text-xkwanza-600">
            XKWANZA
          </NavLink>
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/painel" className={navLinkClass} end>
              Painel
            </NavLink>
            <NavLink to="/marketplace" className={navLinkClass}>
              Marketplace
            </NavLink>
            <NavLink to="/meus-pedidos" className={navLinkClass}>
              Meus pedidos
            </NavLink>
            {isSeller && (
              <>
                <NavLink to="/meus-produtos" className={navLinkClass}>
                  Meus produtos
                </NavLink>
                <NavLink to="/pedidos-recebidos" className={navLinkClass}>
                  Pedidos recebidos
                </NavLink>
              </>
            )}
            {isTransporter && (
              <>
                <NavLink to="/fretes" className={navLinkClass}>
                  Fretes disponíveis
                </NavLink>
                <NavLink to="/meus-fretes" className={navLinkClass}>
                  Meus fretes
                </NavLink>
                <NavLink to="/meu-perfil-transportador" className={navLinkClass}>
                  Meu veículo
                </NavLink>
              </>
            )}
            {hasWallet && (
              <>
                <NavLink to="/historico" className={navLinkClass}>
                  Histórico
                </NavLink>
                <NavLink to="/carteira" className={navLinkClass}>
                  Carteira
                </NavLink>
              </>
            )}
            {isStaff && (
              <NavLink to="/admin/pagamentos" className={navLinkClass}>
                Pagamentos
              </NavLink>
            )}
          </nav>
          <div className="flex items-center gap-4 text-sm">
            <NavLink to="/carrinho" className="relative text-neutral-600 hover:text-xkwanza-600">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-xkwanza-600 text-[10px] font-medium text-white">
                  {totalItems}
                </span>
              )}
            </NavLink>
            <span className="hidden text-neutral-500 sm:inline">{ROLE_LABELS[user.role]}</span>
            <span className="flex items-center gap-1 font-medium text-neutral-800">
              {user.isVerifiedBadge && <ShieldCheck size={16} className="text-xkwanza-600" />}
              {user.name}
            </span>
            <button
              onClick={() => logout()}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-neutral-500 hover:bg-neutral-100"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
        <nav className="flex items-center gap-1 overflow-x-auto px-4 pb-2 md:hidden">
          <NavLink to="/painel" className={navLinkClass} end>
            Painel
          </NavLink>
          <NavLink to="/marketplace" className={navLinkClass}>
            Marketplace
          </NavLink>
          <NavLink to="/meus-pedidos" className={navLinkClass}>
            Pedidos
          </NavLink>
          {isSeller && (
            <>
              <NavLink to="/meus-produtos" className={navLinkClass}>
                Produtos
              </NavLink>
              <NavLink to="/pedidos-recebidos" className={navLinkClass}>
                Recebidos
              </NavLink>
            </>
          )}
          {isTransporter && (
            <>
              <NavLink to="/fretes" className={navLinkClass}>
                Fretes
              </NavLink>
              <NavLink to="/meus-fretes" className={navLinkClass}>
                Meus fretes
              </NavLink>
              <NavLink to="/meu-perfil-transportador" className={navLinkClass}>
                Veículo
              </NavLink>
            </>
          )}
          {hasWallet && (
            <>
              <NavLink to="/historico" className={navLinkClass}>
                Histórico
              </NavLink>
              <NavLink to="/carteira" className={navLinkClass}>
                Carteira
              </NavLink>
            </>
          )}
          {isStaff && (
            <NavLink to="/admin/pagamentos" className={navLinkClass}>
              Pagamentos
            </NavLink>
          )}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
