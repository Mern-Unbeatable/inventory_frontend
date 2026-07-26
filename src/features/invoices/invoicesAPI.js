import { apiClient } from '@/config/api/config.client.js';
import { HTTP_ENDPOINTS } from '@/config/api/config.httpEndpoint.js';

export const invoicesAPI = {
  list: (params) => apiClient.get(HTTP_ENDPOINTS.INVOICES.BASE, { params }),
  getById: (id) => apiClient.get(HTTP_ENDPOINTS.INVOICES.BY_ID(id)),
  create: (payload) => apiClient.post(HTTP_ENDPOINTS.INVOICES.BASE, payload),
  update: (id, payload) => apiClient.patch(HTTP_ENDPOINTS.INVOICES.BY_ID(id), payload),
  confirm: (id) => apiClient.post(HTTP_ENDPOINTS.INVOICES.CONFIRM(id)),
  cancel: (id) => apiClient.post(HTTP_ENDPOINTS.INVOICES.CANCEL(id)),
  remove: (id) => apiClient.delete(HTTP_ENDPOINTS.INVOICES.BY_ID(id)),
  downloadPdf: (id) =>
    apiClient.get(HTTP_ENDPOINTS.INVOICES.PDF(id), {
      responseType: 'blob',
    }),
};
