import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { inventoryService } from './inventoryService.js';
import { appConfig } from '@/config/app.config.js';

export const fetchInventoryThunk = createAsyncThunk(
  'inventory/fetchList',
  async ({ role } = {}, { getState, rejectWithValue }) => {
    try {
      if (role === 'SELLER') {
        const { page, limit, search } = getState().inventory.filters;
        const mine = await inventoryService.myInventory();
        const query = (search || '').trim().toLowerCase();
        const filtered = query
          ? (mine.items || []).filter((row) => {
              const title = row.product?.title?.toLowerCase() || '';
              const sku = row.product?.sku?.toLowerCase() || '';
              return title.includes(query) || sku.includes(query);
            })
          : mine.items || [];

        const total = filtered.length;
        const start = (page - 1) * limit;
        const items = filtered.slice(start, start + limit);

        return {
          items,
          meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
          },
          summary: mine.summary,
          mode: 'seller',
        };
      }

      const { page, limit, countryId, branchId, userId, search } =
        getState().inventory.filters;
      const list = await inventoryService.list({
        page,
        limit,
        countryId: countryId || undefined,
        branchId: branchId || undefined,
        userId: userId || undefined,
        search: search || undefined,
      });
      return { ...list, summary: null, mode: 'admin' };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const assignStockThunk = createAsyncThunk(
  'inventory/assign',
  async (payload, { rejectWithValue }) => {
    try {
      return await inventoryService.assign(payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const setQuantityThunk = createAsyncThunk(
  'inventory/setQuantity',
  async ({ id, quantity }, { rejectWithValue }) => {
    try {
      return await inventoryService.setQuantity(id, quantity);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const adjustQuantityThunk = createAsyncThunk(
  'inventory/adjust',
  async ({ id, delta }, { rejectWithValue }) => {
    try {
      return await inventoryService.adjust(id, delta);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const sellStockThunk = createAsyncThunk(
  'inventory/sell',
  async ({ id, quantity }, { rejectWithValue }) => {
    try {
      return await inventoryService.sell(id, quantity);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const unassignStockThunk = createAsyncThunk(
  'inventory/unassign',
  async (id, { rejectWithValue }) => {
    try {
      await inventoryService.unassign(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchUserInventoryThunk = createAsyncThunk(
  'inventory/fetchByUser',
  async (userId, { rejectWithValue }) => {
    try {
      const payload = await inventoryService.getUserInventory(userId);
      return {
        userId,
        items: payload?.items || [],
        summary: payload?.summary || { productCount: 0, totalQuantity: 0 },
      };
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
    countryId: '',
    branchId: '',
    userId: '',
    search: '',
  },
  summary: null,
  userInventory: {
    userId: null,
    items: [],
    summary: null,
    status: 'idle',
    error: null,
  },
  status: 'idle',
  mutationStatus: 'idle',
  error: null,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setInventoryFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearUserInventory: (state) => {
      state.userInventory = {
        userId: null,
        items: [],
        summary: null,
        status: 'idle',
        error: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventoryThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchInventoryThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
        state.meta = action.payload.meta;
        state.summary = action.payload.summary;
      })
      .addCase(fetchInventoryThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to load inventory';
      })
      .addCase(fetchUserInventoryThunk.pending, (state) => {
        state.userInventory.status = 'loading';
        state.userInventory.error = null;
      })
      .addCase(fetchUserInventoryThunk.fulfilled, (state, action) => {
        state.userInventory.status = 'succeeded';
        state.userInventory.userId = action.payload.userId;
        state.userInventory.items = action.payload.items;
        state.userInventory.summary = action.payload.summary;
      })
      .addCase(fetchUserInventoryThunk.rejected, (state, action) => {
        state.userInventory.status = 'failed';
        state.userInventory.items = [];
        state.userInventory.summary = null;
        state.userInventory.error =
          action.payload?.message || 'Failed to load assigned products';
      })
      .addCase(assignStockThunk.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(assignStockThunk.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(assignStockThunk.rejected, (state) => {
        state.mutationStatus = 'failed';
      })
      .addCase(setQuantityThunk.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(setQuantityThunk.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(setQuantityThunk.rejected, (state) => {
        state.mutationStatus = 'failed';
      })
      .addCase(adjustQuantityThunk.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(adjustQuantityThunk.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(adjustQuantityThunk.rejected, (state) => {
        state.mutationStatus = 'failed';
      })
      .addCase(sellStockThunk.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(sellStockThunk.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(sellStockThunk.rejected, (state) => {
        state.mutationStatus = 'failed';
      })
      .addCase(unassignStockThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.userInventory.items = state.userInventory.items.filter(
          (item) => item.id !== action.payload
        );
      });
  },
});

export const { setInventoryFilters, clearUserInventory } = inventorySlice.actions;
export default inventorySlice.reducer;
