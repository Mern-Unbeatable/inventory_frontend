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

  // Let the browser set multipart boundary when sending FormData.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (typeof config.headers?.delete === 'function') {
      config.headers.delete('Content-Type');
    } else if (config.headers) {
      delete config.headers['Content-Type'];
    }
  }

  return config;
};
