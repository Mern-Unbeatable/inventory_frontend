/**
 * Thin wrapper around window.sessionStorage, mirroring localStorage.js.
 * Useful for tab-scoped UI state that shouldn't persist across sessions
 * (e.g. a "don't show again" banner dismissal).
 */
export const getSessionItem = (key, fallback = null) => {
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export const setSessionItem = (key, value) => {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // no-op
  }
};

export const removeSessionItem = (key) => {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // no-op
  }
};
