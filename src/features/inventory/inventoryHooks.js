import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  adjustQuantityThunk,
  assignStockThunk,
  clearUserInventory,
  fetchInventoryThunk,
  fetchTransactionsThunk,
  fetchUserInventoryThunk,
  receiveStockThunk,
  sellStockThunk,
  setInventoryFilters,
  setQuantityThunk,
  unassignStockThunk,
} from './inventorySlice.js';
import {
  selectInventoryError,
  selectInventoryFilters,
  selectInventoryItems,
  selectInventoryMeta,
  selectInventoryMutationStatus,
  selectInventoryStatus,
  selectInventorySummary,
  selectInventoryTransactions,
  selectInventoryTransactionsError,
  selectInventoryTransactionsMeta,
  selectInventoryTransactionsStatus,
  selectUserInventoryError,
  selectUserInventoryItems,
  selectUserInventoryStatus,
  selectUserInventorySummary,
} from './inventorySelectors.js';
import { useAuth } from '../auth/authHooks.js';

export const useInventory = () => {
  const dispatch = useDispatch();
  const { user, isAdmin } = useAuth();

  const items = useSelector(selectInventoryItems);
  const meta = useSelector(selectInventoryMeta);
  const filters = useSelector(selectInventoryFilters);
  const summary = useSelector(selectInventorySummary);
  const status = useSelector(selectInventoryStatus);
  const mutationStatus = useSelector(selectInventoryMutationStatus);
  const error = useSelector(selectInventoryError);
  const userInventoryItems = useSelector(selectUserInventoryItems);
  const userInventorySummary = useSelector(selectUserInventorySummary);
  const userInventoryStatus = useSelector(selectUserInventoryStatus);
  const userInventoryError = useSelector(selectUserInventoryError);
  const transactions = useSelector(selectInventoryTransactions);
  const transactionsMeta = useSelector(selectInventoryTransactionsMeta);
  const transactionsStatus = useSelector(selectInventoryTransactionsStatus);
  const transactionsError = useSelector(selectInventoryTransactionsError);

  const loadInventory = useCallback(() => {
    if (!user?.role) return;
    return dispatch(fetchInventoryThunk({ role: user.role }));
  }, [dispatch, user?.role]);

  const loadUserInventory = useCallback(
    (userId) => dispatch(fetchUserInventoryThunk(userId)),
    [dispatch]
  );

  const clearAssignedInventory = useCallback(
    () => dispatch(clearUserInventory()),
    [dispatch]
  );

  const updateFilters = useCallback(
    (next) => dispatch(setInventoryFilters(next)),
    [dispatch]
  );

  const assignStock = useCallback(
    async (payload) => {
      const result = await dispatch(assignStockThunk(payload));
      if (assignStockThunk.fulfilled.match(result)) {
        toast.success('Product assigned');
        dispatch(fetchInventoryThunk({ role: user.role }));
        return { success: true };
      }
      toast.error(result.payload?.message || 'Failed to assign product');
      return { success: false, error: result.payload };
    },
    [dispatch, user?.role]
  );

  const setQuantity = useCallback(
    async (id, quantity) => {
      const result = await dispatch(setQuantityThunk({ id, quantity }));
      if (setQuantityThunk.fulfilled.match(result)) {
        toast.success('Stock updated');
        dispatch(fetchInventoryThunk({ role: user.role }));
        return { success: true };
      }
      toast.error(result.payload?.message || 'Failed to update stock');
      return { success: false, error: result.payload };
    },
    [dispatch, user?.role]
  );

  const adjustQuantity = useCallback(
    async (id, delta) => {
      const result = await dispatch(adjustQuantityThunk({ id, delta }));
      if (adjustQuantityThunk.fulfilled.match(result)) {
        toast.success('Quantity adjusted');
        dispatch(fetchInventoryThunk({ role: user.role }));
        return { success: true };
      }
      toast.error(result.payload?.message || 'Failed to adjust quantity');
      return { success: false, error: result.payload };
    },
    [dispatch, user?.role]
  );

  const recordSale = useCallback(
    async (id, quantity) => {
      const result = await dispatch(sellStockThunk({ id, quantity }));
      if (sellStockThunk.fulfilled.match(result)) {
        toast.success(`Sale recorded (−${quantity})`);
        dispatch(fetchInventoryThunk({ role: user.role }));
        return { success: true, data: result.payload };
      }
      toast.error(result.payload?.message || 'Failed to record sale');
      return { success: false, error: result.payload };
    },
    [dispatch, user?.role]
  );

  const unassignStock = useCallback(
    async (id) => {
      const result = await dispatch(unassignStockThunk(id));
      if (unassignStockThunk.fulfilled.match(result)) {
        toast.success('Product unassigned');
        dispatch(fetchInventoryThunk({ role: user.role }));
        return { success: true };
      }
      toast.error(result.payload?.message || 'Failed to unassign product');
      return { success: false, error: result.payload };
    },
    [dispatch, user?.role]
  );

  const receiveStock = useCallback(
    async (id, quantity, reason) => {
      const result = await dispatch(receiveStockThunk({ id, quantity, reason }));
      if (receiveStockThunk.fulfilled.match(result)) {
        toast.success(`Stock received (+${quantity})`);
        dispatch(fetchInventoryThunk({ role: user.role }));
        return { success: true, data: result.payload };
      }
      toast.error(result.payload?.message || 'Failed to record received stock');
      return { success: false, error: result.payload };
    },
    [dispatch, user?.role]
  );

  const loadTransactions = useCallback(
    (options) => dispatch(fetchTransactionsThunk(options)),
    [dispatch]
  );

  return {
    items,
    meta,
    filters,
    summary,
    status,
    mutationStatus,
    error,
    userInventoryItems,
    userInventorySummary,
    userInventoryStatus,
    userInventoryError,
    transactions,
    transactionsMeta,
    transactionsStatus,
    transactionsError,
    isAdmin,
    isLoading: status === 'loading',
    isUserInventoryLoading: userInventoryStatus === 'loading',
    isTransactionsLoading: transactionsStatus === 'loading',
    isMutating: mutationStatus === 'loading',
    loadInventory,
    loadUserInventory,
    clearAssignedInventory,
    updateFilters,
    assignStock,
    setQuantity,
    adjustQuantity,
    recordSale,
    receiveStock,
    loadTransactions,
    unassignStock,
  };
};
