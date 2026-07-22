/**
 * Development helper for inspecting readable (non-httpOnly) cookies.
 * The auth refresh cookie is httpOnly and will never appear here — that's
 * expected, not a bug, when checking this in the browser console.
 */
export const listReadableCookies = () =>
  document.cookie
    .split(';')
    .map((pair) => pair.trim())
    .filter(Boolean)
    .reduce((acc, pair) => {
      const [key, ...rest] = pair.split('=');
      acc[key] = decodeURIComponent(rest.join('='));
      return acc;
    }, {});

export const logReadableCookies = () => {
  if (import.meta.env.DEV) {
    console.table(listReadableCookies());
  }
};
