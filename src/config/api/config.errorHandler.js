import axios from 'axios';
import { appConfig } from '../app.config.js';
import { HTTP_ENDPOINTS } from './config.httpEndpoint.js';
import {
  clearAuthSession,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '@/utils/auth/authStorage.js';

/**
 * Normalizes Axios/network errors into { statusCode, message, details }.
 * Backend envelope: { success, message, errors? }
 */
export const normalizeError = (error) => {
  const body = error?.response?.data;

  return {
    statusCode: body?.statusCode || error?.response?.status || 0,
    message:
      body?.message ||
      error?.message ||
      'Something went wrong. Please try again.',
    details: body?.errors || body?.details || null,
  };
};

const AUTH_FREE_PATHS = [
  HTTP_ENDPOINTS.AUTH.LOGIN,
  HTTP_ENDPOINTS.AUTH.REFRESH,
  HTTP_ENDPOINTS.AUTH.LOGOUT,
];

let isRefreshing = false;
let pendingQueue = [];

const resolveQueue = (newToken) => {
  pendingQueue.forEach(({ resolve }) => resolve(newToken));
  pendingQueue = [];
};

const rejectQueue = (error) => {
  pendingQueue.forEach(({ reject }) => reject(error));
  pendingQueue = [];
};

const requestNewAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available');

  const { data } = await axios.post(
    `${appConfig.apiBaseUrl}${HTTP_ENDPOINTS.AUTH.REFRESH}`,
    { refreshToken }
  );

  const tokens = data?.data?.tokens || data?.data || {};
  if (!tokens.accessToken) {
    throw new Error('Refresh response missing access token');
  }

  setAccessToken(tokens.accessToken);
  if (tokens.refreshToken) setRefreshToken(tokens.refreshToken);
  return tokens.accessToken;
};

const forceLogoutRedirect = () => {
  clearAuthSession();
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

export const attachResponseErrorHandler = (client) => {
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { config, response } = error;
      const isAuthFreePath = AUTH_FREE_PATHS.some((path) =>
        config?.url?.includes(path)
      );

      if (response?.status !== 401 || isAuthFreePath || config._retried) {
        return Promise.reject(normalizeError(error));
      }

      config._retried = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token) =>
              resolve(
                client({
                  ...config,
                  headers: {
                    ...config.headers,
                    Authorization: `Bearer ${token}`,
                  },
                })
              ),
            reject,
          });
        });
      }

      isRefreshing = true;
      try {
        const newToken = await requestNewAccessToken();
        resolveQueue(newToken);
        config.headers.Authorization = `Bearer ${newToken}`;
        return client(config);
      } catch {
        rejectQueue(error);
        forceLogoutRedirect();
        return Promise.reject(normalizeError(error));
      } finally {
        isRefreshing = false;
      }
    }
  );
};
