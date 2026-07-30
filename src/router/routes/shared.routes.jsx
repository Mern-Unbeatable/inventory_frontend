import { Navigate, Route } from 'react-router-dom';
import { useAuth } from '@/features/auth/authHooks.js';
import AdminDashboardPage from '@/pages/admin/DashboardPage.jsx';
import SettingsPage from '@/pages/admin/SettingsPage.jsx';
import ProfilePage from '@/pages/customer/ProfilePage.jsx';
import CartPage from '@/pages/customer/CartPage.jsx';
import SellerDashboardPage from '@/pages/seller/DashboardPage.jsx';
import ProductsPage from '@/pages/seller/ProductsPage.jsx';
import { getHomePath } from '@/utils/auth/auth.utils.js';

/**
 * Staff dashboards for `/dashboard`. Customers are redirected to Products —
 * they no longer have a dashboard in the UI.
 */
function DashboardRoute() {
  const { user, isAdmin, isCustomer } = useAuth();
  if (isCustomer) {
    return <Navigate to={getHomePath(user)} replace />;
  }
  if (isAdmin) return <AdminDashboardPage />;
  return <SellerDashboardPage />;
}

/**
 * Routes available to any authenticated role (ADMIN / SELLER / CUSTOMER).
 * Cross-role pages are imported from the single role folder that owns them.
 */
export const sharedRoutes = (
  <>
    <Route path='/dashboard' element={<DashboardRoute />} />
    <Route path='/products' element={<ProductsPage />} />
    <Route path='/cart' element={<CartPage />} />
    <Route path='/profile' element={<ProfilePage />} />
    <Route path='/settings' element={<SettingsPage />} />
  </>
);
