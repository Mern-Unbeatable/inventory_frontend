import axios from 'axios';
import { appConfig } from '../app.config.js';
import { attachAuthHeader } from './config.request.js';
import { attachResponseErrorHandler } from './config.errorHandler.js';

/**
 * The single Axios instance used by every feature's *API.js file.
 * `withCredentials` lets the browser send/receive the backend's httpOnly
 * refresh-token cookie alongside the header-based access token flow.
 */
export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(attachAuthHeader);
attachResponseErrorHandler(apiClient);
