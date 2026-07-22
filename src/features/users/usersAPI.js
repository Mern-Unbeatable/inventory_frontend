import { apiClient } from '@/config/api/config.client.js';
import { HTTP_ENDPOINTS } from '@/config/api/config.httpEndpoint.js';

export const usersAPI = {
  list: (params) => apiClient.get(HTTP_ENDPOINTS.USERS.BASE, { params }),
  getById: (id) => apiClient.get(HTTP_ENDPOINTS.USERS.BY_ID(id)),
  create: (payload) => apiClient.post(HTTP_ENDPOINTS.USERS.BASE, payload),
  update: (id, payload) => apiClient.patch(HTTP_ENDPOINTS.USERS.BY_ID(id), payload),
  remove: (id) => apiClient.delete(HTTP_ENDPOINTS.USERS.BY_ID(id)),
};
