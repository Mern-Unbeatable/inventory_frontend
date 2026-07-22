import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  createUserThunk,
  deleteUserThunk,
  fetchUsersThunk,
  setUserFilters,
  updateUserThunk,
} from './usersSlice.js';
import {
  selectUserFilters,
  selectUserItems,
  selectUserMeta,
  selectUsersError,
  selectUsersMutationStatus,
  selectUsersStatus,
} from './usersSelectors.js';

export const useUsers = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectUserItems);
  const meta = useSelector(selectUserMeta);
  const filters = useSelector(selectUserFilters);
  const status = useSelector(selectUsersStatus);
  const mutationStatus = useSelector(selectUsersMutationStatus);
  const error = useSelector(selectUsersError);

  const loadUsers = useCallback(() => dispatch(fetchUsersThunk()), [dispatch]);
  const updateFilters = useCallback((next) => dispatch(setUserFilters(next)), [dispatch]);

  const createUser = useCallback(
    async (payload) => {
      const result = await dispatch(createUserThunk(payload));
      if (createUserThunk.fulfilled.match(result)) {
        toast.success('User created');
        dispatch(fetchUsersThunk());
        return { success: true };
      }
      toast.error(result.payload?.message || 'Failed to create user');
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  const updateUser = useCallback(
    async (id, payload) => {
      const result = await dispatch(updateUserThunk({ id, payload }));
      if (updateUserThunk.fulfilled.match(result)) {
        toast.success('User updated');
        dispatch(fetchUsersThunk());
        return { success: true };
      }
      toast.error(result.payload?.message || 'Failed to update user');
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  const deleteUser = useCallback(
    async (id) => {
      const result = await dispatch(deleteUserThunk(id));
      if (deleteUserThunk.fulfilled.match(result)) {
        toast.success('User deleted');
        dispatch(fetchUsersThunk());
        return { success: true };
      }
      toast.error(result.payload?.message || 'Failed to delete user');
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
    loadUsers,
    updateFilters,
    createUser,
    updateUser,
    deleteUser,
  };
};
