import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../auth/authSlice.js';
import dashboardReducer from '../dashboard/dashboardSlice.js';
import productsReducer from '../products/productsSlice.js';
import countriesReducer from '../countries/countriesSlice.js';
import branchesReducer from '../branches/branchesSlice.js';
import usersReducer from '../users/usersSlice.js';
import inventoryReducer from '../inventory/inventorySlice.js';

export const rootReducer = combineReducers({
  auth: authReducer,
  dashboard: dashboardReducer,
  products: productsReducer,
  countries: countriesReducer,
  branches: branchesReducer,
  users: usersReducer,
  inventory: inventoryReducer,
});
