import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { invoicesService } from './invoicesService.js';
import { appConfig } from '@/config/app.config.js';

export const fetchInvoicesThunk = createAsyncThunk(
  'invoices/fetchList',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { page, limit, status, paymentStatus, customerId, search } =
        getState().invoices.filters;
      return await invoicesService.list({
        page,
        limit,
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
        customerId: customerId || undefined,
        search: search || undefined,
      });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchInvoiceByIdThunk = createAsyncThunk(
  'invoices/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return await invoicesService.getById(id);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createInvoiceThunk = createAsyncThunk(
  'invoices/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await invoicesService.create(payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateInvoiceThunk = createAsyncThunk(
  'invoices/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await invoicesService.update(id, payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const confirmInvoiceThunk = createAsyncThunk(
  'invoices/confirm',
  async (id, { rejectWithValue }) => {
    try {
      return await invoicesService.confirm(id);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const cancelInvoiceThunk = createAsyncThunk(
  'invoices/cancel',
  async (id, { rejectWithValue }) => {
    try {
      return await invoicesService.cancel(id);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteInvoiceThunk = createAsyncThunk(
  'invoices/delete',
  async (id, { rejectWithValue }) => {
    try {
      await invoicesService.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState = {
  items: [],
  meta: { page: 1, limit: appConfig.paginationDefaultLimit, total: 0, totalPages: 1 },
  filters: {
    page: 1,
    limit: appConfig.paginationDefaultLimit,
    status: '',
    paymentStatus: '',
    customerId: '',
    search: '',
  },
  current: null,
  status: 'idle',
  detailStatus: 'idle',
  mutationStatus: 'idle',
  error: null,
  detailError: null,
};

const applyDetail = (state, action) => {
  state.detailStatus = 'succeeded';
  state.current = action.payload;
};

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    setInvoiceFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentInvoice: (state) => {
      state.current = null;
      state.detailStatus = 'idle';
      state.detailError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoicesThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchInvoicesThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
        state.meta = action.payload.meta;
      })
      .addCase(fetchInvoicesThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to load invoices';
      })

      .addCase(fetchInvoiceByIdThunk.pending, (state) => {
        state.detailStatus = 'loading';
        state.detailError = null;
      })
      .addCase(fetchInvoiceByIdThunk.fulfilled, applyDetail)
      .addCase(fetchInvoiceByIdThunk.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.current = null;
        state.detailError = action.payload?.message || 'Failed to load invoice';
      })

      .addCase(createInvoiceThunk.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(createInvoiceThunk.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(createInvoiceThunk.rejected, (state) => {
        state.mutationStatus = 'failed';
      })

      .addCase(updateInvoiceThunk.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(updateInvoiceThunk.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.current = action.payload;
      })
      .addCase(updateInvoiceThunk.rejected, (state) => {
        state.mutationStatus = 'failed';
      })

      .addCase(confirmInvoiceThunk.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(confirmInvoiceThunk.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.current = action.payload;
      })
      .addCase(confirmInvoiceThunk.rejected, (state) => {
        state.mutationStatus = 'failed';
      })

      .addCase(cancelInvoiceThunk.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(cancelInvoiceThunk.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.current = action.payload;
      })
      .addCase(cancelInvoiceThunk.rejected, (state) => {
        state.mutationStatus = 'failed';
      })

      .addCase(deleteInvoiceThunk.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(deleteInvoiceThunk.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteInvoiceThunk.rejected, (state) => {
        state.mutationStatus = 'failed';
      });
  },
});

export const { setInvoiceFilters, clearCurrentInvoice } = invoicesSlice.actions;
export default invoicesSlice.reducer;
