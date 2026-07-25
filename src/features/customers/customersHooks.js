import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  clearCurrentCustomer,
  createCustomerThunk,
  createPortalAccountThunk,
  deleteCustomerThunk,
  fetchCustomerByIdThunk,
  fetchCustomerInvoicesThunk,
  fetchCustomerPurchaseHistoryThunk,
  fetchCustomersThunk,
  setCustomerFilters,
  updateCustomerThunk,
} from './customersSlice.js';
import {
  selectCurrentCustomer,
  selectCustomerFilters,
  selectCustomerInvoices,
  selectCustomerItems,
  selectCustomerMeta,
  selectCustomerPurchaseHistory,
  selectCustomersDetailError,
  selectCustomersDetailStatus,
  selectCustomersError,
  selectCustomersMutationStatus,
  selectCustomersStatus,
} from './customersSelectors.js';

export const useCustomers = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectCustomerItems);
  const meta = useSelector(selectCustomerMeta);
  const filters = useSelector(selectCustomerFilters);
  const current = useSelector(selectCurrentCustomer);
  const invoices = useSelector(selectCustomerInvoices);
  const purchaseHistory = useSelector(selectCustomerPurchaseHistory);
  const status = useSelector(selectCustomersStatus);
  const detailStatus = useSelector(selectCustomersDetailStatus);
  const mutationStatus = useSelector(selectCustomersMutationStatus);
  const error = useSelector(selectCustomersError);
  const detailError = useSelector(selectCustomersDetailError);

  const loadCustomers = useCallback(() => dispatch(fetchCustomersThunk()), [dispatch]);
  const updateFilters = useCallback((next) => dispatch(setCustomerFilters(next)), [dispatch]);

  const loadCustomerById = useCallback(
    (id) => dispatch(fetchCustomerByIdThunk(id)),
    [dispatch]
  );

  const clearCustomer = useCallback(() => dispatch(clearCurrentCustomer()), [dispatch]);

  const loadCustomerInvoices = useCallback(
    (id, params) => dispatch(fetchCustomerInvoicesThunk({ id, params })),
    [dispatch]
  );

  const loadCustomerPurchaseHistory = useCallback(
    (id, params) => dispatch(fetchCustomerPurchaseHistoryThunk({ id, params })),
    [dispatch]
  );

  const createCustomer = useCallback(
    async (payload) => {
      const result = await dispatch(createCustomerThunk(payload));
      if (createCustomerThunk.fulfilled.match(result)) {
        toast.success('Customer created');
        dispatch(fetchCustomersThunk());
        return { success: true, customer: result.payload };
      }
      toast.error(result.payload?.message || 'Failed to create customer');
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  const updateCustomer = useCallback(
    async (id, payload) => {
      const result = await dispatch(updateCustomerThunk({ id, payload }));
      if (updateCustomerThunk.fulfilled.match(result)) {
        toast.success('Customer updated');
        return { success: true, customer: result.payload };
      }
      toast.error(result.payload?.message || 'Failed to update customer');
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  const deleteCustomer = useCallback(
    async (id) => {
      const result = await dispatch(deleteCustomerThunk(id));
      if (deleteCustomerThunk.fulfilled.match(result)) {
        toast.success('Customer deleted');
        return { success: true };
      }
      toast.error(result.payload?.message || 'Failed to delete customer');
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  const createPortalAccount = useCallback(
    async (id, payload) => {
      const result = await dispatch(createPortalAccountThunk({ id, payload }));
      if (createPortalAccountThunk.fulfilled.match(result)) {
        toast.success('Portal account created');
        return { success: true };
      }
      toast.error(result.payload?.message || 'Failed to create portal account');
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  return {
    items,
    meta,
    filters,
    current,
    invoices,
    purchaseHistory,
    status,
    detailStatus,
    mutationStatus,
    error,
    detailError,
    isLoading: status === 'loading',
    isDetailLoading: detailStatus === 'loading',
    isMutating: mutationStatus === 'loading',
    loadCustomers,
    loadCustomerById,
    clearCustomer,
    updateFilters,
    loadCustomerInvoices,
    loadCustomerPurchaseHistory,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    createPortalAccount,
  };
};
