import { NavLink, Outlet } from 'react-router-dom';
import { LogOut, ShieldCheck, ShoppingCart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { getRolePrefix, ROLE_LABELS } from '../types/user';

const SELLER_ROLES = ['PRODUCER', 'MERCHANT'];
const TRANSPORTER_ROLE = 'TRANSPORTER';
const BUYER_ROLE = 'BUYER';
const STAFF_ROLES = ['ADMIN', 'SUPPORT'];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition ${
    isActive ? 'bg-amber-400 text-green-950' : 'text-white/75 hover:bg-white/10 hover:text-white'
  }`;

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  if (!user) return null;

  const p = getRolePrefix(user.role);
  const isSeller = SELLER_ROLES.includes(user.role);
  const isBuyer = user.role === BUYER_ROLE;
  const isTransporter = user.role === TRANSPORTER_ROLE;
  const isStaff = STAFF_ROLES.includes(user.role);
  const hasWallet = isSeller || isTransporter;

  const links: { to: string; label: string; shortLabel?: string }[] = [];

  if (isStaff) {
    links.push(
      { to: `/${p}/dashboard`, label: 'Painel' },
      { to: `/${p}/utilizadores`, label: 'Utilizadores' },
      { to: `/${p}/produtores`, label: 'Produtores' },
      { to: `/${p}/compradores`, label: 'Compradores' },
      { to: `/${p}/transportadores`, label: 'Transportadores' },
      { to: `/${p}/categorias`, label: 'Categorias' },
      { to: `/${p}/produtos`, label: 'Produtos' },
      { to: `/${p}/pedidos`, label: 'Pedidos' },
      { to: `/${p}/entregas`, label: 'Entregas' },
      { to: `/${p}/negociacoes`, label: 'Negociações' },
      { to: `/${p}/avaliacoes`, label: 'Avaliações' },
      { to: `/${p}/pagamentos`, label: 'Pagamentos' },
      { to: `/${p}/notificacoes`, label: 'Notificações' },
      { to: `/${p}/formalizacao`, label: 'Formalização' },
      { to: `/${p}/inss`, label: 'INSS' },
      { to: `/${p}/reclamacoes`, label: 'Reclamações' },
      { to: `/${p}/auditoria`, label: 'Auditoria' },
      { to: `/${p}/relatorios`, label: 'Relatórios' },
    );
  } else {
    links.push({ to: `/${p}/dashboard`, label: 'Painel' }, { to: `/${p}/marketplace`, label: 'Marketplace' });

    if (isBuyer) {
      links.push({ to: `/${p}/pedidos`, label: 'Meus pedidos', shortLabel: 'Pedidos' });
    }

    if (isSeller) {
      links.push(
        { to: `/${p}/stock`, label: 'Stock' },
        { to: `/${p}/pedidos`, label: 'Pedidos recebidos', shortLabel: 'Recebidos' },
      );
    }

    if (isTransporter) {
      links.push(
        { to: `/${p}/fretes`, label: 'Fretes disponíveis', shortLabel: 'Fretes' },
        { to: `/${p}/meus-fretes`, label: 'Meus fretes' },
        { to: `/${p}/veiculo`, label: 'Meu veículo', shortLabel: 'Veículo' },
        { to: `/${p}/rotas`, label: 'Rotas' },
      );
    }

    links.push({ to: `/${p}/negociacoes`, label: 'Negociações' }, { to: `/${p}/entregas`, label: 'Entregas' });

    if (isSeller && user.role === 'PRODUCER') {
      links.push({ to: `/${p}/perfil`, label: 'Meu perfil de produtor', shortLabel: 'Perfil produtor' });
    }
    if (isSeller && user.role === 'MERCHANT') {
      links.push({ to: `/${p}/perfil`, label: 'Meu perfil de comerciante', shortLabel: 'Perfil comerciante' });
    }

    if (hasWallet) {
      links.push(
        { to: isTransporter ? `/${p}/rendimentos` : `/${p}/historico`, label: isTransporter ? 'Rendimentos' : 'Histórico' },
        { to: `/${p}/carteira`, label: 'Carteira' },
      );
    }

    links.push({ to: `/${p}/avaliacoes`, label: 'Avaliações' }, { to: `/${p}/notificacoes`, label: 'Notificações' });

    if (hasWallet) {
      links.push({ to: `/${p}/documentos`, label: 'Documentos' }, { to: `/${p}/inss`, label: 'INSS' });
    }

    links.push({ to: `/${p}/suporte`, label: 'Suporte' });
  }

  return (
    <div className="min-h-screen bg-xkwanza-50/40">
      <header className="bg-green-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <NavLink to={`/${p}/dashboard`} className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 to-amber-500 text-sm font-black text-green-950">
              X
            </span>
            <span className="hidden text-lg font-bold tracking-tight text-white sm:inline">XKWANZA</span>
          </NavLink>
          <nav className="hidden min-w-0 flex-1 flex-wrap items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={navLinkClass} end>
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-4 text-sm">
            {isBuyer && (
              <NavLink to={`/${p}/carrinho`} className="relative text-white/75 hover:text-white">
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-green-950">
                    {totalItems}
                  </span>
                )}
              </NavLink>
            )}
            <span className="hidden text-white/60 sm:inline">{ROLE_LABELS[user.role]}</span>
            <NavLink to={`/${p}/conta`} className="flex items-center gap-1 font-medium text-white hover:text-amber-300">
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
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClass} end>
              {link.shortLabel ?? link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
