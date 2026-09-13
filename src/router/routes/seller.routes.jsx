import { Route } from 'react-router-dom';
import { RoleRoute } from '@/router/RoleRoute.jsx';
import InventoryPage from '@/pages/seller/InventoryPage.jsx';
import CustomersPage from '@/pages/seller/CustomersPage.jsx';
import CustomerDetailPage from '@/pages/seller/CustomerDetailPage.jsx';
import InvoicesPage from '@/pages/seller/InvoicesPage.jsx';
import InvoiceDetailPage from '@/pages/seller/InvoiceDetailPage.jsx';
import VerificationsPage from '@/pages/admin/VerificationsPage.jsx';

/**
 * Staff routes for ADMIN + SELLER (inventory ops, customers, invoices, verification).
 * Page modules live under `pages/seller/` — one real file each
 * (Verification reuses the shared VerificationsPage).
 */
export const sellerRoutes = (
  <Route element={<RoleRoute roles={['ADMIN', 'SELLER']} />}>
    <Route path='/inventory' element={<InventoryPage />} />
    <Route path='/customers' element={<CustomersPage />} />
    <Route path='/customers/:id' element={<CustomerDetailPage />} />
    <Route path='/invoices' element={<InvoicesPage />} />
    <Route path='/invoices/:id' element={<InvoiceDetailPage />} />
    <Route path='/verifications' element={<VerificationsPage />} />
  </Route>
);
