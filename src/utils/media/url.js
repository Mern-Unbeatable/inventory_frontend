/**
 * Resolve a product/media path from the API into a browser-loadable URL.
 * Accepts absolute URLs as-is; relative paths are prefixed with the API origin
 * (VITE_API_BASE_URL with trailing /api stripped).
 */
export const resolveMediaUrl = (pathOrUrl) => {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const origin = apiBase.replace(/\/api\/?$/, '');
  const normalized = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${origin}${normalized}`;
};
