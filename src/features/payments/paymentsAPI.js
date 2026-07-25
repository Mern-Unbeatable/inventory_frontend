import { apiClient } from '@/config/api/config.client.js';
import { HTTP_ENDPOINTS } from '@/config/api/config.httpEndpoint.js';

export const paymentsAPI = {
  list: (params) => apiClient.get(HTTP_ENDPOINTS.PAYMENTS.BASE, { params }),
  getById: (id) => apiClient.get(HTTP_ENDPOINTS.PAYMENTS.BY_ID(id)),
  create: (payload) => apiClient.post(HTTP_ENDPOINTS.PAYMENTS.BASE, payload),
  remove: (id) => apiClient.delete(HTTP_ENDPOINTS.PAYMENTS.BY_ID(id)),
};
