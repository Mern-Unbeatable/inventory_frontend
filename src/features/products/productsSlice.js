import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { productsService } from './productsService.js';
import { appConfig } from '@/config/app.config.js';

export const fetchProductsThunk = createAsyncThunk(
  'products/fetchList',
  async (overrides = {}, { getState, rejectWithValue }) => {
    try {
      const filters = getState().products.filters;
      const page = overrides.page ?? filters.page;
      const limit = overrides.limit ?? filters.limit;
      const search =
        overrides.search !== undefined ? overrides.search : filters.search;

      return await productsService.list({
        page,
        limit,
        search: search || undefined,
      });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createProductThunk = createAsyncThunk(
  'products/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await productsService.create(payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateProductThunk = createAsyncThunk(
  'products/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await productsService.update(id, payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteProductThunk = createAsyncThunk(
  'products/delete',
  async (id, { rejectWithValue }) => {
    try {
      await productsService.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState = {
  items: [],
  meta: { page: 1, limit: appConfig.paginationDefaultLimit, total: 0, totalPages: 1 },
  filters: { page: 1, limit: appConfig.paginationDefaultLimit, search: '' },
  selected: null,
  status: 'idle',
  mutationStatus: 'idle',
  error: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProductFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedProduct: (state, action) => {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProductsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
        state.meta = action.payload.meta;
      })
      .addCase(fetchProductsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to load products';
      })
      .addCase(createProductThunk.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(createProductThunk.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(createProductThunk.rejected, (state) => {
        state.mutationStatus = 'failed';
      })
      .addCase(updateProductThunk.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(updateProductThunk.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(updateProductThunk.rejected, (state) => {
        state.mutationStatus = 'failed';
      })
      .addCase(deleteProductThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const { setProductFilters, setSelectedProduct } = productsSlice.actions;
export default productsSlice.reducer;
