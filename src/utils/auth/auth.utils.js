export const ROLES = {
  ADMIN: 'ADMIN',
  SELLER: 'SELLER',
  CUSTOMER: 'CUSTOMER',
};

export const isAdmin = (user) => user?.role === ROLES.ADMIN;
export const isSeller = (user) => user?.role === ROLES.SELLER;
export const isCustomer = (user) => user?.role === ROLES.CUSTOMER;
/** @deprecated use isSeller — kept as alias for gradual migration */
export const isWorker = isSeller;

export const hasRole = (user, allowedRoles = []) => {
  if (!user || !allowedRoles.length) return false;
  return allowedRoles.includes(user.role);
};

/** Default landing path after login / home redirects. */
export const getHomePath = (user) =>
  isCustomer(user) ? '/products' : '/dashboard';

/**
 * Resolves where to send a user after login.
 * Customers never land on Dashboard or staff-only areas.
 */
export const resolvePostLoginPath = (intendedPath, user) => {
  const home = getHomePath(user);
  if (!intendedPath || intendedPath === '/' || intendedPath === '/login') {
    return home;
  }
  if (isCustomer(user) && intendedPath === '/dashboard') {
    return home;
  }
  const staffPrefixes = [
    '/inventory',
    '/customers',
    '/invoices',
    '/countries',
    '/branches',
    '/users',
  ];
  if (
    isCustomer(user) &&
    staffPrefixes.some((prefix) => intendedPath.startsWith(prefix))
  ) {
    return home;
  }
  return intendedPath;
};

export const getInitials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
