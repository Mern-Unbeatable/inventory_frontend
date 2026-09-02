import { apiClient } from "@/config/api/config.client.js";
import { HTTP_ENDPOINTS } from "@/config/api/config.httpEndpoint.js";

export const branchesAPI = {
  list: (params) => apiClient.get(HTTP_ENDPOINTS.BRANCHES.BASE, { params }),
  getById: (id) => apiClient.get(HTTP_ENDPOINTS.BRANCHES.BY_ID(id)),
  create: (payload) => apiClient.post(HTTP_ENDPOINTS.BRANCHES.BASE, payload),
  update: (id, payload) =>
    apiClient.patch(HTTP_ENDPOINTS.BRANCHES.BY_ID(id), payload),
  remove: (id) => apiClient.delete(HTTP_ENDPOINTS.BRANCHES.BY_ID(id)),
  bulkRemove: (ids) =>
    apiClient.delete(HTTP_ENDPOINTS.BRANCHES.BULK_DELETE, {
      data: { ids },
    }),
};
