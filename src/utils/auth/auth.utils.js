export const ROLES = {
  ADMIN: 'ADMIN',
  SELLER: 'SELLER',
};

export const isAdmin = (user) => user?.role === ROLES.ADMIN;
export const isSeller = (user) => user?.role === ROLES.SELLER;
/** @deprecated use isSeller — kept as alias for gradual migration */
export const isWorker = isSeller;

export const hasRole = (user, allowedRoles = []) => {
  if (!user || !allowedRoles.length) return false;
  return allowedRoles.includes(user.role);
};

export const getInitials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
