import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { LogOut, ShieldCheck, ShoppingCart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { getRolePrefix, ROLE_LABELS } from '../types/user';
import { Logo } from '../components/Logo';
import { NavDropdown, NavDropdownItem } from '../components/NavDropdown';

const TRANSPORTER_ROLE = 'TRANSPORTER';
const BUYER_ROLE = 'BUYER';
const STAFF_ROLES = ['ADMIN', 'SUPPORT'];

type NavEntry =
  | { type: 'link'; to: string; label: string; shortLabel?: string }
  | { type: 'dropdown'; label: string; items: NavDropdownItem[] };

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition ${
    isActive ? 'bg-gold-400 text-xkwanza-950' : 'text-white/75 hover:bg-white/10 hover:text-white'
  }`;

const sidebarLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-gold-400 text-xkwanza-950' : 'text-white/75 hover:bg-white/10 hover:text-white'
  }`;

// Navegação de administração agrupada por área — 20 secções numa única barra plana ficava
// ilegível; um menu lateral com grupos é o padrão certo para um painel deste tamanho.
function buildStaffGroups(p: string) {
  return [
    { title: 'Visão geral', links: [{ to: `/${p}/dashboard`, label: 'Painel' }] },
    {
      title: 'Pessoas',
      links: [
        { to: `/${p}/utilizadores`, label: 'Utilizadores' },
        { to: `/${p}/produtores`, label: 'Produtores' },
        { to: `/${p}/compradores`, label: 'Compradores' },
        { to: `/${p}/transportadores`, label: 'Transportadores' },
        { to: `/${p}/verificacoes`, label: 'Verificações' },
      ],
    },
    {
      title: 'Catálogo & pedidos',
      links: [
        { to: `/${p}/categorias`, label: 'Categorias' },
        { to: `/${p}/produtos`, label: 'Produtos' },
        { to: `/${p}/pedidos`, label: 'Pedidos' },
        { to: `/${p}/entregas`, label: 'Entregas' },
      ],
    },
    {
      title: 'Confiança',
      links: [
        { to: `/${p}/negociacoes`, label: 'Negociações' },
        { to: `/${p}/avaliacoes`, label: 'Avaliações' },
        { to: `/${p}/disputas`, label: 'Reclamações' },
        { to: `/${p}/reclamacoes`, label: 'Suporte' },
      ],
    },
    {
      title: 'Finanças',
      links: [
        { to: `/${p}/pagamentos`, label: 'Pagamentos' },
        { to: `/${p}/relatorios`, label: 'Relatórios' },
      ],
    },
    {
      title: 'Formalização',
      links: [
        { to: `/${p}/formalizacao`, label: 'Formalização' },
        { to: `/${p}/inss`, label: 'INSS' },
      ],
    },
    {
      title: 'Sistema',
      links: [
        { to: `/${p}/notificacoes`, label: 'Notificações' },
        { to: `/${p}/banners`, label: 'Banners' },
        { to: `/${p}/configuracoes`, label: 'Configurações' },
        { to: `/${p}/auditoria`, label: 'Auditoria' },
      ],
    },
  ];
}

// Navegação horizontal do Produtor — os 10 itens de topo seguem exactamente a estrutura
// pedida (Visão geral / Minha produção / Meus produtos / Stock / Pedidos recebidos / Vendas /
// Pagamentos / Transportes / Avaliações / Meu perfil). Nenhuma página existente foi removida:
// Negociações, Disputas, Documentos, INSS, Contas bancárias, Mensagens, Notificações e Suporte
// continuam acessíveis, agrupadas por afinidade dentro dos dropdowns dos itens mais próximos.
function buildProducerNav(p: string): NavEntry[] {
  return [
    { type: 'link', to: `/${p}/dashboard`, label: 'Visão geral', shortLabel: 'Painel' },
    { type: 'link', to: `/${p}/perfil`, label: 'Minha produção', shortLabel: 'Minha Loja' },
    { type: 'link', to: `/${p}/produtos`, label: 'Meus produtos', shortLabel: 'Produtos' },
    { type: 'link', to: `/${p}/stock`, label: 'Stock' },
    {
      type: 'dropdown',
      label: 'Pedidos recebidos',
      items: [
        { to: `/${p}/pedidos`, label: 'Pedidos recebidos' },
        { to: `/${p}/negociacoes`, label: 'Negociações' },
      ],
    },
    { type: 'link', to: `/${p}/historico`, label: 'Vendas' },
    {
      type: 'dropdown',
      label: 'Pagamentos',
      items: [
        { to: `/${p}/pagamentos`, label: 'Pagamentos' },
        { to: `/${p}/contas-bancarias`, label: 'Contas bancárias' },
      ],
    },
    { type: 'link', to: `/${p}/entregas`, label: 'Transportes', shortLabel: 'Entregas' },
    { type: 'link', to: `/${p}/avaliacoes`, label: 'Avaliações' },
    {
      type: 'dropdown',
      label: 'Meu perfil',
      items: [
        { to: `/${p}/conta`, label: 'Meu perfil' },
        { to: `/${p}/documentos`, label: 'Documentos' },
        { to: `/${p}/inss`, label: 'INSS' },
        { to: `/${p}/disputas`, label: 'Disputas' },
        { to: `/${p}/mensagens`, label: 'Mensagens' },
        { to: `/${p}/notificacoes`, label: 'Notificações' },
        { to: `/${p}/suporte`, label: 'Suporte' },
        { to: `/${p}/definicoes`, label: 'Definições' },
      ],
    },
  ];
}

// Navegação horizontal do Comprador — os 11 itens de topo seguem a estrutura pedida (Visão
// geral / Explorar produtos / Favoritos / Carrinho / Meus pedidos / Pagamentos / Entregas /
// Histórico / Reclamações / Avaliações / Meu perfil). "Histórico" reaproveita a mesma página de
// "Meus pedidos" com um filtro por separador — não há endpoint nem página duplicados.
function buildBuyerNav(p: string): NavEntry[] {
  return [
    { type: 'link', to: `/${p}/dashboard`, label: 'Visão geral', shortLabel: 'Início' },
    { type: 'link', to: `/${p}/marketplace`, label: 'Explorar produtos', shortLabel: 'Explorar' },
    { type: 'link', to: `/${p}/favoritos`, label: 'Favoritos' },
    { type: 'link', to: `/${p}/carrinho`, label: 'Carrinho' },
    {
      type: 'dropdown',
      label: 'Meus pedidos',
      items: [
        { to: `/${p}/pedidos?tab=aberto`, label: 'Meus pedidos' },
        { to: `/${p}/negociacoes`, label: 'Negociações' },
      ],
    },
    { type: 'link', to: `/${p}/pagamentos`, label: 'Pagamentos' },
    { type: 'link', to: `/${p}/entregas`, label: 'Entregas' },
    { type: 'link', to: `/${p}/pedidos?tab=historico`, label: 'Histórico' },
    { type: 'link', to: `/${p}/disputas`, label: 'Reclamações', shortLabel: 'Reclamações' },
    { type: 'link', to: `/${p}/avaliacoes`, label: 'Avaliações' },
    {
      type: 'dropdown',
      label: 'Meu perfil',
      items: [
        { to: `/${p}/conta`, label: 'Meu perfil' },
        { to: `/${p}/mensagens`, label: 'Mensagens' },
        { to: `/${p}/notificacoes`, label: 'Notificações' },
        { to: `/${p}/suporte`, label: 'Suporte' },
        { to: `/${p}/definicoes`, label: 'Definições' },
      ],
    },
  ];
}

// Cada persona vê apenas a sua própria navegação — construída aqui um bloco por perfil,
// exactamente sobre as páginas definidas para essa persona. Negociações/Disputas/Suporte/INSS
// são funcionalidades pré-existentes e compatíveis (cotações, resolução de conflitos, apoio ao
// cliente, ligação ao INSS) mantidas por baixo dos itens principais — remover acesso a algo que
// já funciona quebraria funcionalidade existente sem motivo relacionado com esta reestruturação.
function buildLinks(p: string, role: string) {
  const links: { to: string; label: string; shortLabel?: string }[] = [];

  if (role === 'MERCHANT') {
    links.push(
      { to: `/${p}/dashboard`, label: 'Painel' },
      { to: `/${p}/conta`, label: 'Meu Perfil' },
      { to: `/${p}/perfil`, label: 'Minha Loja' },
      { to: `/${p}/produtos`, label: 'Produtos' },
      { to: `/${p}/stock`, label: 'Stock' },
      { to: `/${p}/compras`, label: 'Compras' },
      { to: `/${p}/marketplace`, label: 'Novo Pedido de Compra', shortLabel: 'Comprar' },
      { to: `/${p}/pedidos`, label: 'Pedidos de Venda', shortLabel: 'Vendas' },
      { to: `/${p}/historico`, label: 'Vendas', shortLabel: 'Histórico' },
      { to: `/${p}/entregas`, label: 'Entregas' },
      { to: `/${p}/negociacoes`, label: 'Negociações' },
      { to: `/${p}/disputas`, label: 'Disputas' },
      { to: `/${p}/avaliacoes`, label: 'Avaliações' },
      { to: `/${p}/mensagens`, label: 'Mensagens' },
      { to: `/${p}/notificacoes`, label: 'Notificações' },
      { to: `/${p}/documentos`, label: 'Documentos' },
      { to: `/${p}/inss`, label: 'INSS' },
      { to: `/${p}/suporte`, label: 'Suporte' },
      { to: `/${p}/definicoes`, label: 'Definições' },
    );
  } else if (role === TRANSPORTER_ROLE) {
    links.push(
      { to: `/${p}/dashboard`, label: 'Painel' },
      { to: `/${p}/conta`, label: 'Meu Perfil' },
      { to: `/${p}/veiculo`, label: 'Meu Veículo' },
      { to: `/${p}/fretes`, label: 'Entregas Disponíveis', shortLabel: 'Disponíveis' },
      { to: `/${p}/meus-fretes`, label: 'Minhas Entregas' },
      { to: `/${p}/rotas`, label: 'Rotas' },
      { to: `/${p}/rendimentos`, label: 'Ganhos' },
      { to: `/${p}/avaliacoes`, label: 'Avaliações' },
      { to: `/${p}/mensagens`, label: 'Mensagens' },
      { to: `/${p}/documentos`, label: 'Documentos' },
      { to: `/${p}/inss`, label: 'INSS' },
      { to: `/${p}/disputas`, label: 'Disputas' },
      { to: `/${p}/notificacoes`, label: 'Notificações' },
      { to: `/${p}/suporte`, label: 'Suporte' },
      { to: `/${p}/definicoes`, label: 'Definições' },
    );
  }

  return links;
}

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();

  if (!user) return null;

  const p = getRolePrefix(user.role);
  const isBuyer = user.role === BUYER_ROLE;
  const isMerchant = user.role === 'MERCHANT';
  const isStaff = STAFF_ROLES.includes(user.role);
  const canCheckout = isBuyer || isMerchant;

  const staffLinks: { to: string; label: string; shortLabel?: string }[] = [];

  if (isStaff) {
    staffLinks.push(
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
      { to: `/${p}/reclamacoes`, label: 'Suporte' },
      { to: `/${p}/disputas`, label: 'Reclamações' },
      { to: `/${p}/verificacoes`, label: 'Verificações' },
      { to: `/${p}/banners`, label: 'Banners' },
      { to: `/${p}/configuracoes`, label: 'Configurações' },
      { to: `/${p}/auditoria`, label: 'Auditoria' },
      { to: `/${p}/relatorios`, label: 'Relatórios' },
    );
  }

  const navEntries: NavEntry[] = isStaff
    ? []
    : user.role === 'PRODUCER'
      ? buildProducerNav(p)
      : user.role === BUYER_ROLE
        ? buildBuyerNav(p)
        : buildLinks(p, user.role).map((link) => ({ type: 'link' as const, ...link }));

  const mobileEntries: { to: string; label: string; shortLabel?: string }[] = navEntries.flatMap((entry) =>
    entry.type === 'link' ? [{ to: entry.to, label: entry.label, shortLabel: entry.shortLabel }] : entry.items,
  );

  const topBar = (
    <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 lg:px-6">
      <NavLink to={`/${p}/dashboard`}>
        <Logo size={32} />
      </NavLink>
      {!isStaff && (
        <nav className="hidden min-w-0 flex-1 flex-wrap items-center gap-1 px-4 md:flex">
          {navEntries.map((entry) =>
            entry.type === 'dropdown' ? (
              <NavDropdown key={entry.label} label={entry.label} items={entry.items} />
            ) : (
              <NavLink key={entry.to} to={entry.to} className={navLinkClass} end>
                {entry.label}
              </NavLink>
            ),
          )}
        </nav>
      )}
      <div className="flex shrink-0 items-center gap-4 text-sm">
        {canCheckout && (
          <NavLink to={`/${p}/carrinho`} className="relative text-white/75 hover:text-white">
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold-400 text-[10px] font-bold text-xkwanza-950">
                {totalItems}
              </span>
            )}
          </NavLink>
        )}
        <span className="hidden text-white/60 sm:inline">{ROLE_LABELS[user.role]}</span>
        <NavLink
          to={`/${p}/conta`}
          className="flex min-w-0 items-center gap-1 font-medium text-white hover:text-gold-300"
        >
          {user.isVerifiedBadge && <ShieldCheck size={16} className="shrink-0 text-gold-400" />}
          <span className="max-w-[84px] truncate sm:max-w-[160px]">{user.name}</span>
        </NavLink>
        <button
          onClick={() => logout()}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-white/75 hover:bg-white/10 hover:text-white"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </div>
  );

  if (isStaff) {
    const groups = buildStaffGroups(p);
    return (
      <div className="min-h-screen bg-xkwanza-50/30">
        <header className="bg-xkwanza-950">{topBar}</header>
        <nav className="flex items-center gap-1 overflow-x-auto bg-xkwanza-900 px-4 py-2 md:hidden">
          {staffLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClass} end>
              {link.shortLabel ?? link.label}
            </NavLink>
          ))}
        </nav>
        <div className="mx-auto flex max-w-[1600px]">
          <aside className="hidden w-56 shrink-0 border-r border-xkwanza-900/10 bg-xkwanza-950 md:block">
            <nav className="sticky top-0 space-y-5 overflow-y-auto px-3 py-5" style={{ maxHeight: '100vh' }}>
              {groups.map((group) => (
                <div key={group.title}>
                  <p className="px-3 pb-1.5 text-xs font-bold uppercase tracking-wider text-white/40">{group.title}</p>
                  <div className="space-y-0.5">
                    {group.links.map((link) => (
                      <NavLink key={link.to} to={link.to} className={sidebarLinkClass} end>
                        {link.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </aside>
          <main className="min-w-0 flex-1 px-4 py-6 lg:px-6">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-xkwanza-50/30">
      <header className="bg-xkwanza-950">
        {topBar}
        <nav className="flex items-center gap-1 overflow-x-auto bg-xkwanza-900 px-4 py-2 md:hidden">
          {mobileEntries.map((entry) => {
            const currentFullPath = location.pathname + location.search;
            const active = entry.to.includes('?') ? currentFullPath === entry.to : location.pathname === entry.to;
            return (
              <Link
                key={entry.to}
                to={entry.to}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  active ? 'bg-gold-400 text-xkwanza-950' : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                {entry.shortLabel ?? entry.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
