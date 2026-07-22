import { authAPI } from './authAPI.js';
import {
  clearAuthSession,
  getRefreshToken,
  getStoredUser,
  setAuthSession,
} from '@/utils/auth/authStorage.js';
import { unwrapData } from '@/config/api/config.response.js';

/**
 * Business logic for auth: API calls + session persistence.
 * Backend login shape: { user, tokens: { accessToken, refreshToken, ... } }
 */
export const authService = {
  async login(credentials) {
    const { data } = await authAPI.login(credentials);
    const payload = unwrapData(data);
    const tokens = payload?.tokens || {};

    setAuthSession({
      user: payload.user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });

    return payload.user;
  },

  async logout() {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await authAPI.logout({ refreshToken });
      }
    } finally {
      clearAuthSession();
    }
  },

  async fetchCurrentUser() {
    const { data } = await authAPI.getMe();
    const user = unwrapData(data);
    setAuthSession({ user });
    return user;
  },

  getPersistedUser() {
    return getStoredUser();
  },
};
