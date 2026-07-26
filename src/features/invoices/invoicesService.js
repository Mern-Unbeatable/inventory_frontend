import { invoicesAPI } from './invoicesAPI.js';
import { unwrapData, unwrapList } from '@/config/api/config.response.js';

export const invoicesService = {
  async list(params) {
    const { data } = await invoicesAPI.list(params);
    return unwrapList(data);
  },

  async getById(id) {
    const { data } = await invoicesAPI.getById(id);
    return unwrapData(data);
  },

  async create(payload) {
    const { data } = await invoicesAPI.create(payload);
    return unwrapData(data);
  },

  async update(id, payload) {
    const { data } = await invoicesAPI.update(id, payload);
    return unwrapData(data);
  },

  async confirm(id) {
    const { data } = await invoicesAPI.confirm(id);
    return unwrapData(data);
  },

  async cancel(id) {
    const { data } = await invoicesAPI.cancel(id);
    return unwrapData(data);
  },

  async remove(id) {
    await invoicesAPI.remove(id);
  },

  /**
   * Downloads an invoice PDF blob and triggers a browser save dialog.
   * Filename prefers Content-Disposition (e.g. INV-000123.pdf).
   */
  async downloadPdf(id, fallbackName = 'invoice.pdf') {
    const response = await invoicesAPI.downloadPdf(id);
    const blob = response.data;

    // Error responses may arrive as JSON blobs when responseType is blob.
    if (blob?.type && blob.type.includes('application/json')) {
      const text = await blob.text();
      let message = 'Failed to download invoice PDF';
      try {
        const parsed = JSON.parse(text);
        message = parsed?.message || message;
      } catch {
        // keep default message
      }
      const error = new Error(message);
      error.statusCode = response.status;
      throw error;
    }

    const disposition = response.headers?.['content-disposition'] || '';
    const match = disposition.match(/filename="?([^"]+)"?/i);
    const filename = match?.[1] || fallbackName;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { filename };
  },
};
