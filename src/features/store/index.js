import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './rootReducer.js';
import { appMiddleware } from './middleware.js';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(appMiddleware),
  devTools: import.meta.env.DEV,
});
