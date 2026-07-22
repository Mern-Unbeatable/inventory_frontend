/**
 * Minimal JWT payload decoder. We only need to read the `exp` claim for
 * client-side expiry checks (the server is always the source of truth for
 * verification) — pulling in a full JWT library for this is unnecessary.
 */
export const decodeTokenPayload = (token) => {
  if (!token || typeof token !== 'string') return null;

  const segments = token.split('.');
  if (segments.length !== 3) return null;

  try {
    const base64 = segments[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => '%' + char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token) => {
  const payload = decodeTokenPayload(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
};
