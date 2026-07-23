import { apiClient } from '@/config/api/config.client.js';
import { HTTP_ENDPOINTS } from '@/config/api/config.httpEndpoint.js';

const multipartConfig = {};

const toFormData = (payload = {}) => {
  if (payload instanceof FormData) return payload;

  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === 'image' && value instanceof File) {
      formData.append('image', value);
      return;
    }
    if (typeof value === 'boolean') {
      formData.append(key, value ? 'true' : 'false');
      return;
    }
    formData.append(key, String(value));
  });
  return formData;
};

export const productsAPI = {
  list: (params) => apiClient.get(HTTP_ENDPOINTS.PRODUCTS.BASE, { params }),
  getById: (id) => apiClient.get(HTTP_ENDPOINTS.PRODUCTS.BY_ID(id)),
  create: (payload) => {
    if (payload?.image instanceof File || payload instanceof FormData) {
      return apiClient.post(HTTP_ENDPOINTS.PRODUCTS.BASE, toFormData(payload), multipartConfig);
    }
    return apiClient.post(HTTP_ENDPOINTS.PRODUCTS.BASE, payload);
  },
  update: (id, payload) => {
    const needsMultipart =
      payload instanceof FormData ||
      payload?.image instanceof File ||
      payload?.removeImage === true;

    if (needsMultipart) {
      return apiClient.patch(
        HTTP_ENDPOINTS.PRODUCTS.BY_ID(id),
        toFormData(payload),
        multipartConfig
      );
    }
    return apiClient.patch(HTTP_ENDPOINTS.PRODUCTS.BY_ID(id), payload);
  },
  remove: (id) => apiClient.delete(HTTP_ENDPOINTS.PRODUCTS.BY_ID(id)),
};
