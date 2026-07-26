import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  cancelInvoiceThunk,
  clearCurrentInvoice,
  confirmInvoiceThunk,
  createInvoiceThunk,
  deleteInvoiceThunk,
  fetchInvoiceByIdThunk,
  fetchInvoicesThunk,
  setInvoiceFilters,
  updateInvoiceThunk,
} from './invoicesSlice.js';
import { invoicesService } from './invoicesService.js';
import {
  selectCurrentInvoice,
  selectInvoiceFilters,
  selectInvoiceItems,
  selectInvoiceMeta,
  selectInvoicesDetailError,
  selectInvoicesDetailStatus,
  selectInvoicesError,
  selectInvoicesMutationStatus,
  selectInvoicesStatus,
} from './invoicesSelectors.js';

export const useInvoices = () => {
  const dispatch = useDispatch();
  const [pdfDownloadingId, setPdfDownloadingId] = useState(null);
  const items = useSelector(selectInvoiceItems);
  const meta = useSelector(selectInvoiceMeta);
  const filters = useSelector(selectInvoiceFilters);
  const current = useSelector(selectCurrentInvoice);
  const status = useSelector(selectInvoicesStatus);
  const detailStatus = useSelector(selectInvoicesDetailStatus);
  const mutationStatus = useSelector(selectInvoicesMutationStatus);
  const error = useSelector(selectInvoicesError);
  const detailError = useSelector(selectInvoicesDetailError);

  const loadInvoices = useCallback(() => dispatch(fetchInvoicesThunk()), [dispatch]);
  const updateFilters = useCallback((next) => dispatch(setInvoiceFilters(next)), [dispatch]);

  const loadInvoiceById = useCallback(
    (id) => dispatch(fetchInvoiceByIdThunk(id)),
    [dispatch]
  );

  const clearInvoice = useCallback(() => dispatch(clearCurrentInvoice()), [dispatch]);

  const createInvoice = useCallback(
    async (payload) => {
      const result = await dispatch(createInvoiceThunk(payload));
      if (createInvoiceThunk.fulfilled.match(result)) {
        toast.success('Invoice created as draft');
        dispatch(fetchInvoicesThunk());
        return { success: true, invoice: result.payload };
      }
      toast.error(result.payload?.message || 'Failed to create invoice');
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  const updateInvoice = useCallback(
    async (id, payload) => {
      const result = await dispatch(updateInvoiceThunk({ id, payload }));
      if (updateInvoiceThunk.fulfilled.match(result)) {
        toast.success('Invoice updated');
        return { success: true, invoice: result.payload };
      }
      toast.error(result.payload?.message || 'Failed to update invoice');
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  const confirmInvoice = useCallback(
    async (id) => {
      const result = await dispatch(confirmInvoiceThunk(id));
      if (confirmInvoiceThunk.fulfilled.match(result)) {
        toast.success('Invoice confirmed — stock updated');
        return { success: true, invoice: result.payload };
      }
      toast.error(result.payload?.message || 'Failed to confirm invoice');
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  const cancelInvoice = useCallback(
    async (id) => {
      const result = await dispatch(cancelInvoiceThunk(id));
      if (cancelInvoiceThunk.fulfilled.match(result)) {
        toast.success('Invoice cancelled');
        return { success: true, invoice: result.payload };
      }
      toast.error(result.payload?.message || 'Failed to cancel invoice');
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  const deleteInvoice = useCallback(
    async (id) => {
      const result = await dispatch(deleteInvoiceThunk(id));
      if (deleteInvoiceThunk.fulfilled.match(result)) {
        toast.success('Invoice deleted');
        return { success: true };
      }
      toast.error(result.payload?.message || 'Failed to delete invoice');
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  const downloadInvoicePdf = useCallback(async (id, invoiceNumber) => {
    setPdfDownloadingId(id);
    try {
      const fallback = invoiceNumber ? `${invoiceNumber}.pdf` : 'invoice.pdf';
      await invoicesService.downloadPdf(id, fallback);
      toast.success('Invoice PDF downloaded');
      return { success: true };
    } catch (error) {
      toast.error(error?.message || 'Failed to download invoice PDF');
      return { success: false, error };
    } finally {
      setPdfDownloadingId(null);
    }
  }, []);

  return {
    items,
    meta,
    filters,
    current,
    status,
    detailStatus,
    mutationStatus,
    error,
    detailError,
    isLoading: status === 'loading',
    isDetailLoading: detailStatus === 'loading',
    isMutating: mutationStatus === 'loading',
    pdfDownloadingId,
    isPdfDownloading: Boolean(pdfDownloadingId),
    loadInvoices,
    loadInvoiceById,
    clearInvoice,
    updateFilters,
    createInvoice,
    updateInvoice,
    confirmInvoice,
    cancelInvoice,
    deleteInvoice,
    downloadInvoicePdf,
  };
};
