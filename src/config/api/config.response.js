/**
 * Helpers for the backend ApiResponse envelope:
 * { success, message, data }
 * List endpoints nest pagination as data: { items, meta }.
 */
export const unwrapData = (responseBody) => responseBody?.data ?? null;

export const unwrapList = (responseBody) => {
  const payload = responseBody?.data;
  return {
    items: Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [],
    meta: payload?.meta || {
      page: 1,
      limit: 10,
      total: Array.isArray(payload?.items)
        ? payload.items.length
        : Array.isArray(payload)
          ? payload.length
          : 0,
      totalPages: 1,
    },
  };
};
