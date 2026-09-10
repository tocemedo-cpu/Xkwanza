import { NavLink, Outlet } from 'react-router-dom';
import { LogOut, ShieldCheck, ShoppingCart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { ROLE_LABELS } from '../types/user';

const SELLER_ROLES = ['PRODUCER', 'MERCHANT'];
const TRANSPORTER_ROLE = 'TRANSPORTER';
const STAFF_ROLES = ['ADMIN', 'SUPPORT'];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition ${
    isActive ? 'bg-amber-400 text-green-950' : 'text-white/75 hover:bg-white/10 hover:text-white'
  }`;

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  if (!user) return null;

  const isSeller = SELLER_ROLES.includes(user.role);
  const isProducer = user.role === 'PRODUCER';
  const isMerchant = user.role === 'MERCHANT';
  const isTransporter = user.role === TRANSPORTER_ROLE;
  const isStaff = STAFF_ROLES.includes(user.role);
  const hasWallet = isSeller || isTransporter;

  return (
    <div className="min-h-screen bg-xkwanza-50/40">
      <header className="bg-green-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <NavLink to="/painel" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 to-amber-500 text-sm font-black text-green-950">
              X
            </span>
            <span className="hidden text-lg font-bold tracking-tight text-white sm:inline">XKWANZA</span>
          </NavLink>
          <nav className="hidden min-w-0 flex-1 flex-wrap items-center gap-1 md:flex">
            <NavLink to="/painel" className={navLinkClass} end>
              Painel
            </NavLink>
            <NavLink to="/marketplace" className={navLinkClass}>
              Marketplace
            </NavLink>
            <NavLink to="/meus-pedidos" className={navLinkClass}>
              Meus pedidos
            </NavLink>
            <NavLink to="/formalizacao" className={navLinkClass}>
              Formalização
            </NavLink>
            <NavLink to="/inss" className={navLinkClass}>
              INSS
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
            {isProducer && (
              <NavLink to="/meu-perfil-produtor" className={navLinkClass}>
                Meu perfil de produtor
              </NavLink>
            )}
            {isMerchant && (
              <NavLink to="/meu-perfil-comerciante" className={navLinkClass}>
                Meu perfil de comerciante
              </NavLink>
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
              <>
                <NavLink to="/admin/utilizadores" className={navLinkClass}>
                  Utilizadores
                </NavLink>
                <NavLink to="/admin/pagamentos" className={navLinkClass}>
                  Pagamentos
                </NavLink>
                <NavLink to="/admin/formalizacao" className={navLinkClass}>
                  Formalização (admin)
                </NavLink>
                <NavLink to="/admin/inss" className={navLinkClass}>
                  INSS (admin)
                </NavLink>
              </>
            )}
          </nav>
          <div className="flex shrink-0 items-center gap-4 text-sm">
            <NavLink to="/carrinho" className="relative text-white/75 hover:text-white">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-green-950">
                  {totalItems}
                </span>
              )}
            </NavLink>
            <span className="hidden text-white/60 sm:inline">{ROLE_LABELS[user.role]}</span>
            <NavLink to="/meu-perfil" className="flex items-center gap-1 font-medium text-white hover:text-amber-300">
              {user.isVerifiedBadge && <ShieldCheck size={16} className="text-amber-400" />}
              {user.name}
            </NavLink>
            <button
              onClick={() => logout()}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-white/75 hover:bg-white/10 hover:text-white"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
        <nav className="flex items-center gap-1 overflow-x-auto bg-green-900 px-4 py-2 md:hidden">
          <NavLink to="/painel" className={navLinkClass} end>
            Painel
          </NavLink>
          <NavLink to="/marketplace" className={navLinkClass}>
            Marketplace
          </NavLink>
          <NavLink to="/meus-pedidos" className={navLinkClass}>
            Pedidos
          </NavLink>
          <NavLink to="/formalizacao" className={navLinkClass}>
            Formalização
          </NavLink>
          <NavLink to="/inss" className={navLinkClass}>
            INSS
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
          {isProducer && (
            <NavLink to="/meu-perfil-produtor" className={navLinkClass}>
              Perfil produtor
            </NavLink>
          )}
          {isMerchant && (
            <NavLink to="/meu-perfil-comerciante" className={navLinkClass}>
              Perfil comerciante
            </NavLink>
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
            <>
              <NavLink to="/admin/utilizadores" className={navLinkClass}>
                Utilizadores
              </NavLink>
              <NavLink to="/admin/pagamentos" className={navLinkClass}>
                Pagamentos
              </NavLink>
              <NavLink to="/admin/formalizacao" className={navLinkClass}>
                Formalização (admin)
              </NavLink>
              <NavLink to="/admin/inss" className={navLinkClass}>
                INSS (admin)
              </NavLink>
            </>
          )}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
