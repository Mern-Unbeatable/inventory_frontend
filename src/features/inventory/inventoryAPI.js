import { apiClient } from '@/config/api/config.client.js';
import { HTTP_ENDPOINTS } from '@/config/api/config.httpEndpoint.js';

export const inventoryAPI = {
  list: (params) => apiClient.get(HTTP_ENDPOINTS.INVENTORY.BASE, { params }),
  me: () => apiClient.get(HTTP_ENDPOINTS.INVENTORY.ME),
  getById: (id) => apiClient.get(HTTP_ENDPOINTS.INVENTORY.BY_ID(id)),
  getByUser: (userId) => apiClient.get(HTTP_ENDPOINTS.INVENTORY.USER(userId)),
  assign: (payload) => apiClient.post(HTTP_ENDPOINTS.INVENTORY.ASSIGN, payload),
  setQuantity: (id, payload) =>
    apiClient.patch(HTTP_ENDPOINTS.INVENTORY.QUANTITY(id), payload),
  adjust: (id, payload) => apiClient.patch(HTTP_ENDPOINTS.INVENTORY.ADJUST(id), payload),
  sell: (id, payload) => apiClient.post(HTTP_ENDPOINTS.INVENTORY.SELL(id), payload),
  unassign: (id) => apiClient.delete(HTTP_ENDPOINTS.INVENTORY.BY_ID(id)),
};
