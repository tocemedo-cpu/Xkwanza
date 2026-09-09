import { NavLink, Outlet } from 'react-router-dom';
import { LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROLE_LABELS } from '../types/user';

export function DashboardLayout() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <NavLink to="/painel" className="text-lg font-bold text-xkwanza-600">
            XKWANZA
          </NavLink>
          <div className="flex items-center gap-4 text-sm">
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
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
