import { Route } from 'react-router-dom';
import DashboardPage from '@/pages/dashboard/DashboardPage.jsx';
import ProductsPage from '@/pages/products/ProductsPage.jsx';
import ProfilePage from '@/pages/account/ProfilePage.jsx';
import SettingsPage from '@/pages/account/SettingsPage.jsx';

/**
 * Routes available to any authenticated role (ADMIN / SELLER / CUSTOMER).
 * Page content may still branch by role internally.
 */
export const sharedRoutes = (
  <>
    <Route path='/dashboard' element={<DashboardPage />} />
    <Route path='/products' element={<ProductsPage />} />
    <Route path='/profile' element={<ProfilePage />} />
    <Route path='/settings' element={<SettingsPage />} />
  </>
);
