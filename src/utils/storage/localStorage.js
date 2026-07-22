/**
 * Thin wrapper around window.localStorage that JSON-encodes values and
 * fails silently (returning `fallback`) if storage is unavailable
 * (e.g. private browsing) or the stored value is corrupted.
 */
export const getLocalItem = (key, fallback = null) => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export const setLocalItem = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable/full — non-fatal, app continues without persistence.
  }
};

export const removeLocalItem = (key) => {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // no-op
  }
};
