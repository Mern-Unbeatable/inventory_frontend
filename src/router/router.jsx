import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from '@/layout/DashboardLayout.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { RoleRoute } from './RoleRoute.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import DashboardPage from '@/pages/DashboardPage.jsx';
import ProductsPage from '@/pages/ProductsPage.jsx';
import BranchesPage from '@/pages/BranchesPage.jsx';
import CountriesPage from '@/pages/CountriesPage.jsx';
import UsersPage from '@/pages/UsersPage.jsx';
import InventoryPage from '@/pages/InventoryPage.jsx';
import ProfilePage from '@/pages/ProfilePage.jsx';
import SettingsPage from '@/pages/SettingsPage.jsx';
import { ROLES } from '@/utils/auth/auth.utils.js';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />

          <Route element={<RoleRoute roles={[ROLES.ADMIN]} />}>
            <Route path="/countries" element={<CountriesPage />} />
            <Route path="/branches" element={<BranchesPage />} />
            <Route path="/users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
