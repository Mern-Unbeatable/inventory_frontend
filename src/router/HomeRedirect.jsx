import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/authHooks.js';
import { getHomePath } from '@/utils/auth/auth.utils.js';

/**
 * Role-aware home redirect: Customers → /products, Admin/Seller → /dashboard.
 */
export function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={getHomePath(user)} replace />;
}
