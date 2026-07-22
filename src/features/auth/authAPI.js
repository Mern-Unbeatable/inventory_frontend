import { apiClient } from '@/config/api/config.client.js';
import { HTTP_ENDPOINTS } from '@/config/api/config.httpEndpoint.js';

export const authAPI = {
  login: (credentials) => apiClient.post(HTTP_ENDPOINTS.AUTH.LOGIN, credentials),
  logout: (payload) => apiClient.post(HTTP_ENDPOINTS.AUTH.LOGOUT, payload),
  getMe: () => apiClient.get(HTTP_ENDPOINTS.AUTH.ME),
};
