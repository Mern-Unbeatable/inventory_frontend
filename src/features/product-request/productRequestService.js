import { productRequestAPI } from './productRequestAPI.js';

export const productRequestService = {
  /**
   * Generates and downloads a product request PDF from cart line items.
   * Does not create invoices or modify stock.
   */
  async downloadPdf(items, fallbackName = 'product-request.pdf') {
    const response = await productRequestAPI.downloadPdf({
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    });
    const blob = response.data;

    if (blob?.type && blob.type.includes('application/json')) {
      const text = await blob.text();
      let message = 'Failed to download product request PDF';
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
