import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/authHooks.js';
import { getHomePath, hasRole } from '@/utils/auth/auth.utils.js';

export function RoleRoute({ roles }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to='/login' replace />;
  if (!hasRole(user, roles)) {
    return <Navigate to={getHomePath(user)} replace />;
  }

  return <Outlet />;
}
