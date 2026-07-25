import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { paymentsService } from './paymentsService.js';
import { appConfig } from '@/config/app.config.js';

export const fetchPaymentsThunk = createAsyncThunk(
  'payments/fetchList',
  async (invoiceId, { rejectWithValue }) => {
    try {
      const result = await paymentsService.list({
        invoiceId,
        limit: appConfig.paginationDefaultLimit,
      });
      return { invoiceId, ...result };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createPaymentThunk = createAsyncThunk(
  'payments/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await paymentsService.create(payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deletePaymentThunk = createAsyncThunk(
  'payments/delete',
  async (id, { rejectWithValue }) => {
    try {
      const result = await paymentsService.remove(id);
      return { id, ...result };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState = {
  invoiceId: null,
  items: [],
  meta: { page: 1, limit: appConfig.paginationDefaultLimit, total: 0, totalPages: 1 },
  status: 'idle',
  mutationStatus: 'idle',
  error: null,
};

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearPayments: (state) => {
      state.invoiceId = null;
      state.items = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentsThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPaymentsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.invoiceId = action.payload.invoiceId;
        state.items = action.payload.items;
        state.meta = action.payload.meta;
      })
      .addCase(fetchPaymentsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to load payments';
      })

      .addCase(createPaymentThunk.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(createPaymentThunk.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(createPaymentThunk.rejected, (state) => {
        state.mutationStatus = 'failed';
      })

      .addCase(deletePaymentThunk.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(deletePaymentThunk.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.items = state.items.filter((item) => item.id !== action.payload.id);
      })
      .addCase(deletePaymentThunk.rejected, (state) => {
        state.mutationStatus = 'failed';
      });
  },
});

export const { clearPayments } = paymentsSlice.actions;
export default paymentsSlice.reducer;
