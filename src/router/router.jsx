import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from '@/layout/DashboardLayout.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import LoginPage from '@/pages/auth/LoginPage.jsx';
import { sharedRoutes } from './routes/shared.routes.jsx';
import { sellerRoutes } from './routes/seller.routes.jsx';
import { adminRoutes } from './routes/admin.routes.jsx';

/**
 * App router — grouped by access level.
 *
 * | Group        | Who                         | Paths                                      |
 * |--------------|-----------------------------|--------------------------------------------|
 * | Auth         | Public                      | /login                                     |
 * | Shared       | Any authenticated role      | /dashboard, /products, /profile, /settings |
 * | Seller/Staff | ADMIN + SELLER              | /inventory, /customers, /invoices          |
 * | Admin        | ADMIN only                  | /countries, /branches, /users              |
 *
 * URL paths are unchanged for backward compatibility.
 */
export function AppRouter() {
  return (
    <Routes>
      {/* ── Auth (public) ─────────────────────────────────────────── */}
      <Route path='/login' element={<LoginPage />} />

      {/* ── Authenticated shell ───────────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to='/dashboard' replace />} />

          {/* Shared — any authenticated role */}
          {sharedRoutes}

          {/* Seller / Staff — ADMIN + SELLER */}
          {sellerRoutes}

          {/* Admin only */}
          {adminRoutes}
        </Route>
      </Route>

      <Route path='*' element={<Navigate to='/dashboard' replace />} />
    </Routes>
  );
}
