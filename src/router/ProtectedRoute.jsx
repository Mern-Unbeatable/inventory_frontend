import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { FullPageLoader } from '@/components/ui/Loader.jsx';
import { useAuth } from '@/features/auth/authHooks.js';

export function ProtectedRoute() {
  const { isAuthenticated, isBootstrapped } = useAuth();
  const location = useLocation();

  if (!isBootstrapped) return <FullPageLoader label="Checking session…" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
