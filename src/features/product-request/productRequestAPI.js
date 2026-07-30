import { apiClient } from '@/config/api/config.client.js';
import { HTTP_ENDPOINTS } from '@/config/api/config.httpEndpoint.js';

export const productRequestAPI = {
  downloadPdf: (payload) =>
    apiClient.post(HTTP_ENDPOINTS.PRODUCT_REQUESTS.PDF, payload, {
      responseType: 'blob',
    }),
};
