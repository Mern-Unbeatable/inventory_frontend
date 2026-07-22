import { getAccessToken } from '@/utils/auth/authStorage.js';

/**
 * Request interceptor: attaches the JWT access token to every outgoing
 * request that has one available. Public endpoints (login, refresh) work
 * fine with the header present or absent, since the backend simply
 * ignores it for those routes.
 */
export const attachAuthHeader = (config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};
