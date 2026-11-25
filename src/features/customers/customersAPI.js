import { apiClient } from '@/config/api/config.client.js';
import { HTTP_ENDPOINTS } from '@/config/api/config.httpEndpoint.js';

export const customersAPI = {
  list: (params) => apiClient.get(HTTP_ENDPOINTS.CUSTOMERS.BASE, { params }),
  getById: (id) => apiClient.get(HTTP_ENDPOINTS.CUSTOMERS.BY_ID(id)),
  create: (payload) => apiClient.post(HTTP_ENDPOINTS.CUSTOMERS.BASE, payload),
  update: (id, payload) => apiClient.patch(HTTP_ENDPOINTS.CUSTOMERS.BY_ID(id), payload),
  remove: (id) => apiClient.delete(HTTP_ENDPOINTS.CUSTOMERS.BY_ID(id)),
  invoices: (id, params) =>
    apiClient.get(HTTP_ENDPOINTS.CUSTOMERS.INVOICES(id), { params }),
  purchaseHistory: (id, params) =>
    apiClient.get(HTTP_ENDPOINTS.CUSTOMERS.PURCHASE_HISTORY(id), { params }),
  createPortalAccount: (id, payload) =>
    apiClient.post(HTTP_ENDPOINTS.CUSTOMERS.PORTAL_ACCOUNT(id), payload),
  updatePortalPassword: (id, payload) =>
    apiClient.patch(HTTP_ENDPOINTS.CUSTOMERS.PORTAL_PASSWORD(id), payload),
};
