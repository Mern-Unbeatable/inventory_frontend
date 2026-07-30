import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { productRequestService } from './productRequestService.js';

export const useProductRequest = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadProductRequestPdf = useCallback(async (items) => {
    if (!items?.length) {
      toast.error('Add at least one product to your cart');
      return { success: false };
    }

    setIsDownloading(true);
    try {
      await productRequestService.downloadPdf(items);
      toast.success('Product request PDF downloaded');
      return { success: true };
    } catch (error) {
      toast.error(error?.message || 'Failed to download product request PDF');
      return { success: false, error };
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return {
    isDownloading,
    downloadProductRequestPdf,
  };
};
