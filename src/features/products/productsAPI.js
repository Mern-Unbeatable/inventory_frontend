import { apiClient } from '@/config/api/config.client.js';
import { HTTP_ENDPOINTS } from '@/config/api/config.httpEndpoint.js';

export const productsAPI = {
  list: (params) => apiClient.get(HTTP_ENDPOINTS.PRODUCTS.BASE, { params }),
  getById: (id) => apiClient.get(HTTP_ENDPOINTS.PRODUCTS.BY_ID(id)),
  create: (payload) => apiClient.post(HTTP_ENDPOINTS.PRODUCTS.BASE, payload),
  update: (id, payload) => apiClient.patch(HTTP_ENDPOINTS.PRODUCTS.BY_ID(id), payload),
  remove: (id) => apiClient.delete(HTTP_ENDPOINTS.PRODUCTS.BY_ID(id)),
};
