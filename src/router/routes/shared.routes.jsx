import { Route } from 'react-router-dom';
import { useAuth } from '@/features/auth/authHooks.js';
import AdminDashboardPage from '@/pages/admin/DashboardPage.jsx';
import SettingsPage from '@/pages/admin/SettingsPage.jsx';
import CustomerDashboardPage from '@/pages/customer/DashboardPage.jsx';
import ProfilePage from '@/pages/customer/ProfilePage.jsx';
import SellerDashboardPage from '@/pages/seller/DashboardPage.jsx';
import ProductsPage from '@/pages/seller/ProductsPage.jsx';

/**
 * Picks the role dashboard for `/dashboard`. Lives in the router (not under
 * pages/) so each role keeps one real DashboardPage with no re-export shim.
 */
function DashboardRoute() {
  const { isAdmin, isCustomer } = useAuth();
  if (isAdmin) return <AdminDashboardPage />;
  if (isCustomer) return <CustomerDashboardPage />;
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
    <Route path='/profile' element={<ProfilePage />} />
    <Route path='/settings' element={<SettingsPage />} />
  </>
);
