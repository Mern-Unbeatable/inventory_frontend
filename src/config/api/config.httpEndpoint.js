/**
 * Centralized path constants mirroring api/postman (base: /api).
 */
export const HTTP_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    PASSWORD: "/auth/password",
  },
  USERS: {
    BASE: "/users",
    BY_ID: (id) => `/users/${id}`,
  },
  COUNTRIES: {
    BASE: "/countries",
    BY_ID: (id) => `/countries/${id}`,
  },
  BRANCHES: {
    BASE: "/branches",
    BY_ID: (id) => `/branches/${id}`,
  },
  PRODUCTS: {
    BASE: "/products",
    BY_ID: (id) => `/products/${id}`,
  },
  INVENTORY: {
    BASE: "/inventory",
    ME: "/inventory/me",
    ASSIGN: "/inventory/assign",
    BY_ID: (id) => `/inventory/${id}`,
    USER: (userId) => `/inventory/user/${userId}`,
    QUANTITY: (id) => `/inventory/${id}/quantity`,
    ADJUST: (id) => `/inventory/${id}/adjust`,
    SELL: (id) => `/inventory/${id}/sell`,
    RECEIVE: (id) => `/inventory/${id}/receive`,
    TRANSACTIONS: (id) => `/inventory/${id}/transactions`,
    TRANSACTIONS_ME: "/inventory/transactions/me",
    TRANSACTIONS_ALL: "/inventory/transactions",
  },
  DASHBOARD: {
    OVERVIEW: "/dashboard/overview",
  },
  CUSTOMERS: {
    BASE: "/customers",
    BY_ID: (id) => `/customers/${id}`,
    INVOICES: (id) => `/customers/${id}/invoices`,
    PURCHASE_HISTORY: (id) => `/customers/${id}/purchase-history`,
    PORTAL_ACCOUNT: (id) => `/customers/${id}/portal-account`,
  },
  INVOICES: {
    BASE: "/invoices",
    BY_ID: (id) => `/invoices/${id}`,
    PDF: (id) => `/invoices/${id}/pdf`,
    CONFIRM: (id) => `/invoices/${id}/confirm`,
    CANCEL: (id) => `/invoices/${id}/cancel`,
  },
  PAYMENTS: {
    BASE: "/payments",
    BY_ID: (id) => `/payments/${id}`,
  },
  PRODUCT_REQUESTS: {
    PDF: "/product-requests/pdf",
  },
  VERIFICATIONS: {
    BASE: "/verifications",
    BY_ID: (id) => `/verifications/${id}`,
    PUBLIC_VERIFY: (qrId) => `/verify/${qrId}`,
  },
};
