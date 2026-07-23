import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  clearCurrentUser,
  createUserThunk,
  deleteUserThunk,
  fetchUserByIdThunk,
  fetchUsersThunk,
  setUserFilters,
  updateUserThunk,
} from './usersSlice.js';
import {
  selectCurrentUser,
  selectUserFilters,
  selectUserItems,
  selectUserMeta,
  selectUsersDetailError,
  selectUsersDetailStatus,
  selectUsersError,
  selectUsersMutationStatus,
  selectUsersStatus,
} from './usersSelectors.js';

export const useUsers = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectUserItems);
  const meta = useSelector(selectUserMeta);
  const filters = useSelector(selectUserFilters);
  const current = useSelector(selectCurrentUser);
  const status = useSelector(selectUsersStatus);
  const detailStatus = useSelector(selectUsersDetailStatus);
  const mutationStatus = useSelector(selectUsersMutationStatus);
  const error = useSelector(selectUsersError);
  const detailError = useSelector(selectUsersDetailError);

  const loadUsers = useCallback(() => dispatch(fetchUsersThunk()), [dispatch]);
  const updateFilters = useCallback((next) => dispatch(setUserFilters(next)), [dispatch]);

  const loadUserById = useCallback(
    (id) => dispatch(fetchUserByIdThunk(id)),
    [dispatch]
  );

  const clearUser = useCallback(() => dispatch(clearCurrentUser()), [dispatch]);

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
        return { success: true, user: result.payload };
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
    current,
    status,
    detailStatus,
    mutationStatus,
    error,
    detailError,
    isLoading: status === 'loading',
    isDetailLoading: detailStatus === 'loading',
    isMutating: mutationStatus === 'loading',
    loadUsers,
    loadUserById,
    clearUser,
    updateFilters,
    createUser,
    updateUser,
    deleteUser,
  };
};
