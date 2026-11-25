import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { customersService } from './customersService.js';
import { appConfig } from '@/config/app.config.js';

export const fetchCustomersThunk = createAsyncThunk(
  'customers/fetchList',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { page, limit, search } = getState().customers.filters;
      return await customersService.list({ page, limit, search: search || undefined });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchCustomerByIdThunk = createAsyncThunk(
  'customers/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return await customersService.getById(id);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createCustomerThunk = createAsyncThunk(
  'customers/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await customersService.create(payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateCustomerThunk = createAsyncThunk(
  'customers/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await customersService.update(id, payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteCustomerThunk = createAsyncThunk(
  'customers/delete',
  async (id, { rejectWithValue }) => {
    try {
      await customersService.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchCustomerInvoicesThunk = createAsyncThunk(
  'customers/fetchInvoices',
  async ({ id, params }, { rejectWithValue }) => {
    try {
      const result = await customersService.invoices(id, params);
      return { id, ...result };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchCustomerPurchaseHistoryThunk = createAsyncThunk(
  'customers/fetchPurchaseHistory',
  async ({ id, params }, { rejectWithValue }) => {
    try {
      const result = await customersService.purchaseHistory(id, params);
      return { id, ...result };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createPortalAccountThunk = createAsyncThunk(
  'customers/createPortalAccount',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await customersService.createPortalAccount(id, payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updatePortalPasswordThunk = createAsyncThunk(
  'customers/updatePortalPassword',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await customersService.updatePortalPassword(id, payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState = {
  items: [],
  meta: { page: 1, limit: appConfig.paginationDefaultLimit, total: 0, totalPages: 1 },
  filters: { page: 1, limit: appConfig.paginationDefaultLimit, search: '' },
  current: null,
  invoices: { items: [], meta: { page: 1, limit: 10, total: 0, totalPages: 1 }, status: 'idle' },
  purchaseHistory: { items: [], meta: { page: 1, limit: 10, total: 0, totalPages: 1 }, status: 'idle' },
  status: 'idle',
  detailStatus: 'idle',
  mutationStatus: 'idle',
  error: null,
  detailError: null,
};

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setCustomerFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentCustomer: (state) => {
      state.current = null;
      state.detailStatus = 'idle';
      state.detailError = null;
      state.invoices = initialState.invoices;
      state.purchaseHistory = initialState.purchaseHistory;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomersThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCustomersThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
        state.meta = action.payload.meta;
      })
      .addCase(fetchCustomersThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to load customers';
      })

      .addCase(fetchCustomerByIdThunk.pending, (state) => {
        state.detailStatus = 'loading';
        state.detailError = null;
      })
      .addCase(fetchCustomerByIdThunk.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.current = action.payload;
      })
      .addCase(fetchCustomerByIdThunk.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.current = null;
        state.detailError = action.payload?.message || 'Failed to load customer';
      })

      .addCase(createCustomerThunk.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(createCustomerThunk.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(createCustomerThunk.rejected, (state) => {
        state.mutationStatus = 'failed';
      })

      .addCase(updateCustomerThunk.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(updateCustomerThunk.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        const updated = action.payload;
        if (updated?.id) {
          state.items = state.items.map((item) =>
            item.id === updated.id ? { ...item, ...updated } : item
          );
          if (state.current?.id === updated.id) {
            state.current = { ...state.current, ...updated };
          }
        }
      })
      .addCase(updateCustomerThunk.rejected, (state) => {
        state.mutationStatus = 'failed';
      })

      .addCase(deleteCustomerThunk.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(deleteCustomerThunk.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteCustomerThunk.rejected, (state) => {
        state.mutationStatus = 'failed';
      })

      .addCase(fetchCustomerInvoicesThunk.pending, (state) => {
        state.invoices.status = 'loading';
      })
      .addCase(fetchCustomerInvoicesThunk.fulfilled, (state, action) => {
        state.invoices.status = 'succeeded';
        state.invoices.items = action.payload.items;
        state.invoices.meta = action.payload.meta;
      })
      .addCase(fetchCustomerInvoicesThunk.rejected, (state) => {
        state.invoices.status = 'failed';
      })

      .addCase(fetchCustomerPurchaseHistoryThunk.pending, (state) => {
        state.purchaseHistory.status = 'loading';
      })
      .addCase(fetchCustomerPurchaseHistoryThunk.fulfilled, (state, action) => {
        state.purchaseHistory.status = 'succeeded';
        state.purchaseHistory.items = action.payload.items;
        state.purchaseHistory.meta = action.payload.meta;
      })
      .addCase(fetchCustomerPurchaseHistoryThunk.rejected, (state) => {
        state.purchaseHistory.status = 'failed';
      })

      .addCase(createPortalAccountThunk.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(createPortalAccountThunk.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        if (state.current?.id === action.payload?.id) {
          state.current = { ...state.current, ...action.payload };
        }
      })
      .addCase(createPortalAccountThunk.rejected, (state) => {
        state.mutationStatus = 'failed';
      })

      .addCase(updatePortalPasswordThunk.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(updatePortalPasswordThunk.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(updatePortalPasswordThunk.rejected, (state) => {
        state.mutationStatus = 'failed';
      });
  },
});

export const { setCustomerFilters, clearCurrentCustomer } = customersSlice.actions;
export default customersSlice.reducer;
