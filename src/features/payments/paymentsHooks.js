import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  clearPayments,
  createPaymentThunk,
  deletePaymentThunk,
  fetchPaymentsThunk,
} from './paymentsSlice.js';
import {
  selectPaymentItems,
  selectPaymentMeta,
  selectPaymentsError,
  selectPaymentsMutationStatus,
  selectPaymentsStatus,
} from './paymentsSelectors.js';

export const usePayments = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectPaymentItems);
  const meta = useSelector(selectPaymentMeta);
  const status = useSelector(selectPaymentsStatus);
  const mutationStatus = useSelector(selectPaymentsMutationStatus);
  const error = useSelector(selectPaymentsError);

  const loadPayments = useCallback(
    (invoiceId) => dispatch(fetchPaymentsThunk(invoiceId)),
    [dispatch]
  );

  const clear = useCallback(() => dispatch(clearPayments()), [dispatch]);

  const recordPayment = useCallback(
    async (payload) => {
      const result = await dispatch(createPaymentThunk(payload));
      if (createPaymentThunk.fulfilled.match(result)) {
        toast.success('Payment recorded');
        dispatch(fetchPaymentsThunk(payload.invoiceId));
        return { success: true, data: result.payload };
      }
      toast.error(result.payload?.message || 'Failed to record payment');
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  const removePayment = useCallback(
    async (id, invoiceId) => {
      const result = await dispatch(deletePaymentThunk(id));
      if (deletePaymentThunk.fulfilled.match(result)) {
        toast.success('Payment reversed');
        if (invoiceId) dispatch(fetchPaymentsThunk(invoiceId));
        return { success: true, data: result.payload };
      }
      toast.error(result.payload?.message || 'Failed to reverse payment');
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  return {
    items,
    meta,
    status,
    mutationStatus,
    error,
    isLoading: status === 'loading',
    isMutating: mutationStatus === 'loading',
    loadPayments,
    clear,
    recordPayment,
    removePayment,
  };
};
