import { Route } from "react-router-dom";
import { RoleRoute } from "@/router/RoleRoute.jsx";
import CountriesPage from "@/pages/admin/CountriesPage.jsx";
import BranchesPage from "@/pages/admin/BranchesPage.jsx";
import UsersPage from "@/pages/admin/UsersPage.jsx";
import UserDetailPage from "@/pages/admin/UserDetailPage.jsx";
import SettingsPage from "@/pages/admin/SettingsPage.jsx";
import VerificationsPage from "@/pages/admin/VerificationsPage.jsx";

/**
 * ADMIN-only routes. Page modules live under `pages/admin/`.
 */
export const adminRoutes = (
  <Route element={<RoleRoute roles={["ADMIN"]} />}>
    <Route path="/countries" element={<CountriesPage />} />
    <Route path="/branches" element={<BranchesPage />} />
    <Route path="/users" element={<UsersPage />} />
    <Route path="/users/:id" element={<UserDetailPage />} />
    <Route path="/verifications" element={<VerificationsPage />} />
    <Route path="/settings" element={<SettingsPage />} />
  </Route>
);
