import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  adjustQuantityThunk,
  assignStockThunk,
  fetchInventoryThunk,
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

  const loadInventory = useCallback(() => {
    if (!user?.role) return;
    return dispatch(fetchInventoryThunk({ role: user.role }));
  }, [dispatch, user?.role]);

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

  return {
    items,
    meta,
    filters,
    summary,
    status,
    mutationStatus,
    error,
    isAdmin,
    isLoading: status === 'loading',
    isMutating: mutationStatus === 'loading',
    loadInventory,
    updateFilters,
    assignStock,
    setQuantity,
    adjustQuantity,
    recordSale,
    unassignStock,
  };
};
