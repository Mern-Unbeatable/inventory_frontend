import { getLocalItem, removeLocalItem, setLocalItem } from '../storage/localStorage.js';
import { STORAGE_KEYS } from '../storage/storageKeys.js';

/**
 * Persists the auth session (tokens + user profile) in localStorage so a
 * page refresh doesn't log the user out. The refresh token is also set as
 * an httpOnly cookie by the backend, but we keep a copy here so the Axios
 * client can send it explicitly in the /auth/refresh request body.
 */
export const getAccessToken = () => getLocalItem(STORAGE_KEYS.ACCESS_TOKEN);
export const setAccessToken = (token) => setLocalItem(STORAGE_KEYS.ACCESS_TOKEN, token);

export const getRefreshToken = () => getLocalItem(STORAGE_KEYS.REFRESH_TOKEN);
export const setRefreshToken = (token) => setLocalItem(STORAGE_KEYS.REFRESH_TOKEN, token);

export const getStoredUser = () => getLocalItem(STORAGE_KEYS.USER);
export const setStoredUser = (user) => setLocalItem(STORAGE_KEYS.USER, user);

export const setAuthSession = ({ user, accessToken, refreshToken }) => {
  if (user) setStoredUser(user);
  if (accessToken) setAccessToken(accessToken);
  if (refreshToken) setRefreshToken(refreshToken);
};

export const clearAuthSession = () => {
  removeLocalItem(STORAGE_KEYS.ACCESS_TOKEN);
  removeLocalItem(STORAGE_KEYS.REFRESH_TOKEN);
  removeLocalItem(STORAGE_KEYS.USER);
};
