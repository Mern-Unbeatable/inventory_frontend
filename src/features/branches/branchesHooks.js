import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  createBranchThunk,
  deleteBranchThunk,
  fetchBranchesThunk,
  setBranchFilters,
  updateBranchThunk,
} from './branchesSlice.js';
import {
  selectBranchFilters,
  selectBranchItems,
  selectBranchMeta,
  selectBranchesError,
  selectBranchesMutationStatus,
  selectBranchesStatus,
} from './branchesSelectors.js';

export const useBranches = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectBranchItems);
  const meta = useSelector(selectBranchMeta);
  const filters = useSelector(selectBranchFilters);
  const status = useSelector(selectBranchesStatus);
  const mutationStatus = useSelector(selectBranchesMutationStatus);
  const error = useSelector(selectBranchesError);

  const loadBranches = useCallback(() => dispatch(fetchBranchesThunk()), [dispatch]);

  const updateFilters = useCallback((next) => dispatch(setBranchFilters(next)), [dispatch]);

  const createBranch = useCallback(
    async (payload) => {
      const result = await dispatch(createBranchThunk(payload));
      if (createBranchThunk.fulfilled.match(result)) {
        toast.success('Branch created');
        dispatch(fetchBranchesThunk());
        return { success: true };
      }
      toast.error(result.payload?.message || 'Failed to create branch');
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  const updateBranch = useCallback(
    async (id, payload) => {
      const result = await dispatch(updateBranchThunk({ id, payload }));
      if (updateBranchThunk.fulfilled.match(result)) {
        toast.success('Branch updated');
        dispatch(fetchBranchesThunk());
        return { success: true };
      }
      toast.error(result.payload?.message || 'Failed to update branch');
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  const deleteBranch = useCallback(
    async (id) => {
      const result = await dispatch(deleteBranchThunk(id));
      if (deleteBranchThunk.fulfilled.match(result)) {
        toast.success('Branch deleted');
        dispatch(fetchBranchesThunk());
        return { success: true };
      }
      toast.error(result.payload?.message || 'Failed to delete branch');
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  return {
    items,
    meta,
    filters,
    status,
    mutationStatus,
    error,
    isLoading: status === 'loading',
    isMutating: mutationStatus === 'loading',
    loadBranches,
    updateFilters,
    createBranch,
    updateBranch,
    deleteBranch,
  };
};
