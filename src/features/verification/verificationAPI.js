import { apiClient } from "@/config/api/config.client.js";
import { HTTP_ENDPOINTS } from "@/config/api/config.httpEndpoint.js";

export const verificationAPI = {
  list: (params) =>
    apiClient.get(HTTP_ENDPOINTS.VERIFICATIONS.BASE, { params }),
  getById: (id) => apiClient.get(HTTP_ENDPOINTS.VERIFICATIONS.BY_ID(id)),
  create: (payload) =>
    apiClient.post(HTTP_ENDPOINTS.VERIFICATIONS.BASE, payload),
  update: (id, payload) =>
    apiClient.patch(HTTP_ENDPOINTS.VERIFICATIONS.BY_ID(id), payload),
  remove: (id) => apiClient.delete(HTTP_ENDPOINTS.VERIFICATIONS.BY_ID(id)),
  bulkRemove: (ids) =>
    apiClient.delete(HTTP_ENDPOINTS.VERIFICATIONS.BULK_DELETE, {
      data: { ids },
    }),
  // Public — no auth required.
  verify: (qrId, params) =>
    apiClient.get(HTTP_ENDPOINTS.VERIFICATIONS.PUBLIC_VERIFY(qrId), { params }),
};
