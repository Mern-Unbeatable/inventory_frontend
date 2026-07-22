/**
 * Centralized path constants mirroring api/postman (base: /api).
 */
export const HTTP_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id) => `/users/${id}`,
  },
  COUNTRIES: {
    BASE: '/countries',
    BY_ID: (id) => `/countries/${id}`,
  },
  BRANCHES: {
    BASE: '/branches',
    BY_ID: (id) => `/branches/${id}`,
  },
  PRODUCTS: {
    BASE: '/products',
    BY_ID: (id) => `/products/${id}`,
  },
  INVENTORY: {
    BASE: '/inventory',
    ME: '/inventory/me',
    ASSIGN: '/inventory/assign',
    BY_ID: (id) => `/inventory/${id}`,
    USER: (userId) => `/inventory/user/${userId}`,
    QUANTITY: (id) => `/inventory/${id}/quantity`,
    ADJUST: (id) => `/inventory/${id}/adjust`,
    SELL: (id) => `/inventory/${id}/sell`,
  },
  DASHBOARD: {
    OVERVIEW: '/dashboard/overview',
  },
};
