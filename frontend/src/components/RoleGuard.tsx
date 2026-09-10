import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getRolePrefix, UserRole } from '../types/user';

// Restringe o acesso a um conjunto de perfis — a autorização real continua a ser aplicada no backend (RBAC).
export function RoleGuard({ allowedRoles }: { allowedRoles: UserRole[] }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/entrar" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={`/${getRolePrefix(user.role)}/dashboard`} replace />;
  }

  return <Outlet />;
}
