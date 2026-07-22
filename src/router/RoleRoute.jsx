import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/authHooks.js';
import { hasRole } from '@/utils/auth/auth.utils.js';

export function RoleRoute({ roles }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!hasRole(user, roles)) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
