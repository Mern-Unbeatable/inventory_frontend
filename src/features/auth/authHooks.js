import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  bootstrapAuthThunk,
  changePasswordThunk,
  clearAuthError,
  loginThunk,
  logoutThunk,
  updateProfileThunk,
} from './authSlice.js';
import {
  selectAuthError,
  selectAuthMutationStatus,
  selectAuthStatus,
  selectIsAuthenticated,
  selectIsBootstrapped,
  selectUser,
} from './authSelectors.js';
import { isAdmin, isCustomer, isSeller } from '@/utils/auth/auth.utils.js';

export const useAuth = () => {
  const dispatch = useDispatch();

  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isBootstrapped = useSelector(selectIsBootstrapped);
  const status = useSelector(selectAuthStatus);
  const mutationStatus = useSelector(selectAuthMutationStatus);
  const error = useSelector(selectAuthError);

  const login = useCallback(
    async (credentials) => {
      dispatch(clearAuthError());
      const result = await dispatch(loginThunk(credentials));

      if (loginThunk.fulfilled.match(result)) {
        toast.success(`Welcome back, ${result.payload.name}`);
        return { success: true, user: result.payload };
      }

      const message =
        result.payload?.message ||
        (result.payload?.statusCode === 0
          ? 'Cannot reach the API. Check that the server is running and CORS allows this origin.'
          : 'Login failed');

      toast.error(message);
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    await dispatch(logoutThunk());
    toast.success('Signed out');
  }, [dispatch]);

  const bootstrap = useCallback(() => dispatch(bootstrapAuthThunk()), [dispatch]);

  const updateProfile = useCallback(
    async (payload) => {
      dispatch(clearAuthError());
      const result = await dispatch(updateProfileThunk(payload));

      if (updateProfileThunk.fulfilled.match(result)) {
        toast.success('Profile updated');
        return { success: true, user: result.payload };
      }

      toast.error(result.payload?.message || 'Failed to update profile');
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  const changePassword = useCallback(
    async (payload) => {
      dispatch(clearAuthError());
      const result = await dispatch(changePasswordThunk(payload));

      if (changePasswordThunk.fulfilled.match(result)) {
        toast.success('Password updated. Please sign in again.');
        await dispatch(logoutThunk());
        return { success: true };
      }

      toast.error(result.payload?.message || 'Failed to change password');
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  return {
    user,
    isAuthenticated,
    isBootstrapped,
    status,
    mutationStatus,
    error,
    isAdmin: isAdmin(user),
    isSeller: isSeller(user),
    isCustomer: isCustomer(user),
    isWorker: isSeller(user),
    login,
    logout,
    bootstrap,
    updateProfile,
    changePassword,
  };
};
