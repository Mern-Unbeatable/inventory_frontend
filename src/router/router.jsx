import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "@/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { HomeRedirect } from "./HomeRedirect.jsx";
import LoginPage from "@/pages/auth/LoginPage.jsx";
import VerifyPage from "@/pages/public/VerifyPage.jsx";
import { sharedRoutes } from "./routes/shared.routes.jsx";
import { sellerRoutes } from "./routes/seller.routes.jsx";
import { adminRoutes } from "./routes/admin.routes.jsx";

/**
 * App router — grouped by access level.
 *
 * | Group        | Who                         | Paths                                      |
 * |--------------|-----------------------------|--------------------------------------------|
 * | Auth         | Public                      | /login                                     |
 * | Shared       | Any authenticated role      | /products, /cart (+ /dashboard for staff) |
 * | Seller/Staff | ADMIN + SELLER              | /inventory, /customers, /invoices          |
 * | Admin        | ADMIN only                  | /countries, /branches, /seller, /profile   |
 *
 * Customer home is /products (no dashboard in nav or landing).
 */
export function AppRouter() {
  return (
    <Routes>
      {/* ── Auth (public) ─────────────────────────────────────────── */}
      <Route path="/login" element={<LoginPage />} />

      {/* ── Public product verification (no auth) ─────────────────── */}
      <Route path="/verify/:qrId" element={<VerifyPage />} />

      {/* ── Authenticated shell ───────────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<HomeRedirect />} />

          {/* Shared — any authenticated role */}
          {sharedRoutes}

          {/* Seller / Staff — ADMIN + SELLER */}
          {sellerRoutes}

          {/* Admin only */}
          {adminRoutes}
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
