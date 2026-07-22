/**
 * Generic document.cookie helpers for non-httpOnly cookies (e.g. UI
 * preferences). The refresh-token cookie set by the backend is httpOnly
 * and intentionally invisible to JavaScript, so it never goes through
 * this module — auth relies on utils/auth/authStorage.js instead.
 */
export const getCookie = (name) => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export const setCookie = (name, value, { days = 30, path = '/' } = {}) => {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=${path}`;
};

export const removeCookie = (name, { path = '/' } = {}) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
};
