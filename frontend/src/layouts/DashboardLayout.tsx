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

// Navegação horizontal do Comerciante — os 11 itens de topo seguem a estrutura pedida (Visão
// geral / Explorar produtos / Meus produtos / Stock / Pedidos / Compras / Vendas / Pagamentos /
// Entregas / Relatórios / Meu perfil). Nada foi removido: Negociações, Disputas, Documentos,
// INSS, Contas bancárias, Mensagens, Notificações, Suporte e Minha Loja continuam acessíveis,
// agrupadas dentro dos dropdowns dos itens mais próximos.
function buildMerchantNav(p: string): NavEntry[] {
  return [
    { type: 'link', to: `/${p}/dashboard`, label: 'Visão geral', shortLabel: 'Painel' },
    { type: 'link', to: `/${p}/marketplace`, label: 'Explorar produtos', shortLabel: 'Explorar' },
    { type: 'link', to: `/${p}/produtos`, label: 'Meus produtos', shortLabel: 'Produtos' },
    { type: 'link', to: `/${p}/stock`, label: 'Stock' },
    {
      type: 'dropdown',
      label: 'Pedidos',
      items: [
        { to: `/${p}/pedidos`, label: 'Pedidos recebidos' },
        { to: `/${p}/negociacoes`, label: 'Negociações' },
      ],
    },
    { type: 'link', to: `/${p}/compras`, label: 'Compras' },
    { type: 'link', to: `/${p}/historico`, label: 'Vendas' },
    { type: 'link', to: `/${p}/pagamentos`, label: 'Pagamentos' },
    { type: 'link', to: `/${p}/entregas`, label: 'Entregas' },
    { type: 'link', to: `/${p}/relatorios`, label: 'Relatórios' },
    {
      type: 'dropdown',
      label: 'Meu perfil',
      items: [
        { to: `/${p}/conta`, label: 'Meu perfil' },
        { to: `/${p}/perfil`, label: 'Minha Loja' },
        { to: `/${p}/documentos`, label: 'Documentos' },
        { to: `/${p}/inss`, label: 'INSS' },
        { to: `/${p}/contas-bancarias`, label: 'Contas bancárias' },
        { to: `/${p}/disputas`, label: 'Disputas' },
        { to: `/${p}/avaliacoes`, label: 'Avaliações' },
        { to: `/${p}/mensagens`, label: 'Mensagens' },
        { to: `/${p}/notificacoes`, label: 'Notificações' },
        { to: `/${p}/suporte`, label: 'Suporte' },
        { to: `/${p}/definicoes`, label: 'Definições' },
      ],
    },
  ];
}

// Navegação horizontal da Transportadora — os 11 itens de topo seguem a estrutura pedida
// (Visão geral / Solicitações / Transportes disponíveis / Serviços aceites / Em trânsito /
// Entregas concluídas / Histórico / Pagamentos / Veículos / Motoristas / Meu perfil).
// "Solicitações"/"Serviços aceites"/"Em trânsito"/"Entregas concluídas"/"Histórico" reaproveitam
// a mesma página "Minhas entregas" com um filtro por estado — não há páginas nem APIs
// duplicadas. "Pagamentos" reaproveita a página de Ganhos (o modelo de dados não distingue
// estados de pagamento por frete, só o valor acordado). "Veículos" e "Motoristas" apontam para
// o único perfil de transportador existente (dados de veículo e dados pessoais, respectivamente)
// — a plataforma não tem um modelo de frota com vários veículos/motoristas por conta.
function buildTransporterNav(p: string): NavEntry[] {
  return [
    { type: 'link', to: `/${p}/dashboard`, label: 'Visão geral', shortLabel: 'Painel' },
    { type: 'link', to: `/${p}/meus-fretes?status=solicitacoes`, label: 'Solicitações' },
    { type: 'link', to: `/${p}/fretes`, label: 'Transportes disponíveis', shortLabel: 'Disponíveis' },
    { type: 'link', to: `/${p}/meus-fretes?status=aceites`, label: 'Serviços aceites', shortLabel: 'Aceites' },
    { type: 'link', to: `/${p}/meus-fretes?status=transito`, label: 'Em trânsito' },
    { type: 'link', to: `/${p}/meus-fretes?status=concluidas`, label: 'Entregas concluídas', shortLabel: 'Concluídas' },
    { type: 'link', to: `/${p}/meus-fretes`, label: 'Histórico' },
    { type: 'link', to: `/${p}/rendimentos`, label: 'Pagamentos' },
    { type: 'link', to: `/${p}/veiculo`, label: 'Veículos', shortLabel: 'Veículo' },
    { type: 'link', to: `/${p}/conta`, label: 'Motoristas', shortLabel: 'Motorista' },
    {
      type: 'dropdown',
      label: 'Meu perfil',
      items: [
        { to: `/${p}/conta`, label: 'Meu perfil' },
        { to: `/${p}/rotas`, label: 'Rotas' },
        { to: `/${p}/avaliacoes`, label: 'Avaliações' },
        { to: `/${p}/documentos`, label: 'Documentos' },
        { to: `/${p}/inss`, label: 'INSS' },
        { to: `/${p}/contas-bancarias`, label: 'Contas bancárias' },
        { to: `/${p}/disputas`, label: 'Disputas' },
        { to: `/${p}/mensagens`, label: 'Mensagens' },
        { to: `/${p}/notificacoes`, label: 'Notificações' },
        { to: `/${p}/suporte`, label: 'Suporte' },
        { to: `/${p}/definicoes`, label: 'Definições' },
      ],
    },
  ];
}

// Navegação horizontal do Administrador — substitui o antigo menu lateral pelos 14 itens de
// topo pedidos (Visão geral / Utilizadores / Produtores / Compradores / Comerciantes /
// Transportadoras / Produtos / Categorias / Pedidos / Transacções / Pagamentos / Reclamações /
// Relatórios / Configurações). "Transacções" reaproveita a mesma página de Pedidos — o próprio
// título dessa página já descreve "todos os pedidos e transacções da plataforma", não existe
// um livro-razão de transacções separado dos pedidos neste modelo de dados. Nenhuma secção
// administrativa existente foi removida: Negociações/Entregas ficam no dropdown de Pedidos,
// Suporte/Avaliações no de Reclamações, e Banners/Verificações/Auditoria/Notificações/
// Formalização/INSS no de Configurações.
function buildAdminNav(p: string): NavEntry[] {
  return [
    { type: 'link', to: `/${p}/dashboard`, label: 'Visão geral', shortLabel: 'Painel' },
    { type: 'link', to: `/${p}/utilizadores`, label: 'Utilizadores' },
    { type: 'link', to: `/${p}/produtores`, label: 'Produtores' },
    { type: 'link', to: `/${p}/compradores`, label: 'Compradores' },
    { type: 'link', to: `/${p}/comerciantes`, label: 'Comerciantes' },
    { type: 'link', to: `/${p}/transportadores`, label: 'Transportadoras', shortLabel: 'Transportadoras' },
    { type: 'link', to: `/${p}/produtos`, label: 'Produtos' },
    { type: 'link', to: `/${p}/categorias`, label: 'Categorias' },
    {
      type: 'dropdown',
      label: 'Pedidos',
      items: [
        { to: `/${p}/pedidos`, label: 'Pedidos' },
        { to: `/${p}/negociacoes`, label: 'Negociações' },
        { to: `/${p}/entregas`, label: 'Entregas' },
      ],
    },
    { type: 'link', to: `/${p}/pedidos`, label: 'Transacções' },
    { type: 'link', to: `/${p}/pagamentos`, label: 'Pagamentos' },
    {
      type: 'dropdown',
      label: 'Reclamações',
      items: [
        { to: `/${p}/disputas`, label: 'Reclamações' },
        { to: `/${p}/reclamacoes`, label: 'Suporte' },
        { to: `/${p}/avaliacoes`, label: 'Avaliações' },
      ],
    },
    { type: 'link', to: `/${p}/relatorios`, label: 'Relatórios' },
    {
      type: 'dropdown',
      label: 'Configurações',
      items: [
        { to: `/${p}/configuracoes`, label: 'Configurações' },
        { to: `/${p}/banners`, label: 'Banners' },
        { to: `/${p}/verificacoes`, label: 'Verificações' },
        { to: `/${p}/auditoria`, label: 'Auditoria' },
        { to: `/${p}/notificacoes`, label: 'Notificações' },
        { to: `/${p}/formalizacao`, label: 'Formalização' },
        { to: `/${p}/inss`, label: 'INSS' },
      ],
    },
  ];
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

  const navEntries: NavEntry[] =
    user.role === 'PRODUCER'
      ? buildProducerNav(p)
      : user.role === BUYER_ROLE
        ? buildBuyerNav(p)
        : user.role === 'MERCHANT'
          ? buildMerchantNav(p)
          : user.role === TRANSPORTER_ROLE
            ? buildTransporterNav(p)
            : buildAdminNav(p);

  const mobileEntries: { to: string; label: string; shortLabel?: string }[] = navEntries.flatMap((entry) =>
    entry.type === 'link' ? [{ to: entry.to, label: entry.label, shortLabel: entry.shortLabel }] : entry.items,
  );

  const topBar = (
    <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 lg:px-6">
      <NavLink to={`/${p}/dashboard`}>
        <Logo size={32} />
      </NavLink>
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
      <main className={`mx-auto px-4 py-6 ${isStaff ? 'max-w-[1600px] lg:px-6' : 'max-w-6xl'}`}>
        <Outlet />
      </main>
    </div>
  );
}
