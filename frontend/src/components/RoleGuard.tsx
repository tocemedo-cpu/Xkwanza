import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/user';

// Restringe o acesso a um conjunto de perfis — a autorização real continua a ser aplicada no backend (RBAC).
export function RoleGuard({ allowedRoles }: { allowedRoles: UserRole[] }) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/painel" replace />;
  }

  return <Outlet />;
}
