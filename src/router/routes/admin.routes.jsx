import { Route } from 'react-router-dom';
import { RoleRoute } from '../RoleRoute.jsx';
import CountriesPage from '@/pages/admin/CountriesPage.jsx';
import BranchesPage from '@/pages/admin/BranchesPage.jsx';
import UsersPage from '@/pages/admin/UsersPage.jsx';
import UserDetailPage from '@/pages/admin/UserDetailPage.jsx';
import { ROLES } from '@/utils/auth/auth.utils.js';

/**
 * ADMIN-only routes.
 * URLs unchanged: /countries, /branches, /users.
 */
export const adminRoutes = (
  <Route element={<RoleRoute roles={[ROLES.ADMIN]} />}>
    <Route path='/countries' element={<CountriesPage />} />
    <Route path='/branches' element={<BranchesPage />} />
    <Route path='/users' element={<UsersPage />} />
    <Route path='/users/:id' element={<UserDetailPage />} />
  </Route>
);
