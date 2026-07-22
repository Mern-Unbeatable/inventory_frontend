import { apiClient } from '@/config/api/config.client.js';
import { HTTP_ENDPOINTS } from '@/config/api/config.httpEndpoint.js';

export const dashboardAPI = {
  getOverview: () => apiClient.get(HTTP_ENDPOINTS.DASHBOARD.OVERVIEW),
};
