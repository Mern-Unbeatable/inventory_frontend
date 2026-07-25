import { Route } from 'react-router-dom';
import { RoleRoute } from '../RoleRoute.jsx';
import InventoryPage from '@/pages/inventory/InventoryPage.jsx';
import CustomersPage from '@/pages/customers/CustomersPage.jsx';
import CustomerDetailPage from '@/pages/customers/CustomerDetailPage.jsx';
import InvoicesPage from '@/pages/invoices/InvoicesPage.jsx';
import InvoiceDetailPage from '@/pages/invoices/InvoiceDetailPage.jsx';
import { ROLES } from '@/utils/auth/auth.utils.js';

/**
 * Staff routes — ADMIN and SELLER.
 * URLs unchanged: /inventory, /customers, /invoices.
 */
export const sellerRoutes = (
  <Route element={<RoleRoute roles={[ROLES.ADMIN, ROLES.SELLER]} />}>
    <Route path='/inventory' element={<InventoryPage />} />
    <Route path='/customers' element={<CustomersPage />} />
    <Route path='/customers/:id' element={<CustomerDetailPage />} />
    <Route path='/invoices' element={<InvoicesPage />} />
    <Route path='/invoices/:id' element={<InvoiceDetailPage />} />
  </Route>
);
