import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-neutral-500">
        A carregar...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/entrar" replace />;
  }

  return <Outlet />;
}
