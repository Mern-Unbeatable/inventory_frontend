export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  appName: import.meta.env.VITE_APP_NAME || "Inventory M",
  paginationDefaultLimit: 10,
  lowStockThreshold: 5,
  uploadMaxFileSize: Number(import.meta.env.VITE_UPLOAD_MAX_FILE_SIZE) || 2 * 1024 * 1024,
};
