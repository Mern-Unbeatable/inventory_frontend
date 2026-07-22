import { apiClient } from '@/config/api/config.client.js';
import { HTTP_ENDPOINTS } from '@/config/api/config.httpEndpoint.js';

export const countriesAPI = {
  list: () => apiClient.get(HTTP_ENDPOINTS.COUNTRIES.BASE),
  getById: (id) => apiClient.get(HTTP_ENDPOINTS.COUNTRIES.BY_ID(id)),
  create: (payload) => apiClient.post(HTTP_ENDPOINTS.COUNTRIES.BASE, payload),
  update: (id, payload) => apiClient.patch(HTTP_ENDPOINTS.COUNTRIES.BY_ID(id), payload),
  remove: (id) => apiClient.delete(HTTP_ENDPOINTS.COUNTRIES.BY_ID(id)),
};
