import { productsAPI } from './productsAPI.js';
import { unwrapData, unwrapList } from '@/config/api/config.response.js';

const triggerBrowserDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const productsService = {
  async list(params) {
    const { data } = await productsAPI.list(params);
    return unwrapList(data);
  },

  async getById(id) {
    const { data } = await productsAPI.getById(id);
    return unwrapData(data);
  },

  async create(payload) {
    const { data } = await productsAPI.create(payload);
    return unwrapData(data);
  },

  async update(id, payload) {
    const { data } = await productsAPI.update(id, payload);
    return unwrapData(data);
  },

  async remove(id) {
    await productsAPI.remove(id);
  },

  /**
   * Downloads a product export (csv|xlsx|json) for products the current user can access.
   */
  async exportProducts(params = {}, fallbackName = 'products-export.csv') {
    const response = await productsAPI.exportFile(params);
    let blob = response.data;
    const format = params.format || 'csv';

    // Successful JSON exports also use application/json. Only treat the blob as an
    // API error when it looks like the standard error envelope.
    if (blob?.type && blob.type.includes('application/json')) {
      const text = await blob.text();
      let parsed = null;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = null;
      }

      const isApiErrorEnvelope =
        parsed &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed) &&
        parsed.success === false;

      if (isApiErrorEnvelope || (format !== 'json' && parsed?.message)) {
        const error = new Error(
          parsed?.message || 'Failed to export products'
        );
        error.statusCode = response.status || parsed?.statusCode;
        throw error;
      }

      // Re-wrap consumed blob so the browser can still download it.
      blob = new Blob([text], {
        type: 'application/json;charset=utf-8',
      });
    }

    const disposition = response.headers?.['content-disposition'] || '';
    const match = disposition.match(/filename="?([^"]+)"?/i);
    const filename = match?.[1] || fallbackName;

    triggerBrowserDownload(blob, filename);
    return { filename };
  },

  async importProducts(file) {
    const { data } = await productsAPI.importFile(file);
    return unwrapData(data);
  },
};
