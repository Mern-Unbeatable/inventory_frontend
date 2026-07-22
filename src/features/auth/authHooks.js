import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { bootstrapAuthThunk, clearAuthError, loginThunk, logoutThunk } from './authSlice.js';
import {
  selectAuthError,
  selectAuthStatus,
  selectIsAuthenticated,
  selectIsBootstrapped,
  selectUser,
} from './authSelectors.js';
import { isAdmin, isSeller } from '@/utils/auth/auth.utils.js';

export const useAuth = () => {
  const dispatch = useDispatch();

  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isBootstrapped = useSelector(selectIsBootstrapped);
  const status = useSelector(selectAuthStatus);
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

  return {
    user,
    isAuthenticated,
    isBootstrapped,
    status,
    error,
    isAdmin: isAdmin(user),
    isSeller: isSeller(user),
    isWorker: isSeller(user),
    login,
    logout,
    bootstrap,
  };
};
