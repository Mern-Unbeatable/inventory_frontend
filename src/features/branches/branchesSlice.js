import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { branchesService } from "./branchesService.js";
import { appConfig } from "@/config/app.config.js";

export const fetchBranchesThunk = createAsyncThunk(
  "branches/fetchList",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { page, limit, search, countryId } = getState().branches.filters;
      return await branchesService.list({
        page,
        limit,
        search: search || undefined,
        countryId: countryId || undefined,
      });
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const createBranchThunk = createAsyncThunk(
  "branches/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await branchesService.create(payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const updateBranchThunk = createAsyncThunk(
  "branches/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await branchesService.update(id, payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const deleteBranchThunk = createAsyncThunk(
  "branches/delete",
  async (id, { rejectWithValue }) => {
    try {
      await branchesService.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const bulkDeleteBranchesThunk = createAsyncThunk(
  "branches/bulkDelete",
  async (ids, { rejectWithValue }) => {
    try {
      const result = await branchesService.bulkRemove(ids);
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const initialState = {
  items: [],
  meta: {
    page: 1,
    limit: appConfig.paginationDefaultLimit,
    total: 0,
    totalPages: 1,
  },
  filters: {
    page: 1,
    limit: appConfig.paginationDefaultLimit,
    search: "",
    countryId: "",
  },
  status: "idle",
  mutationStatus: "idle",
  error: null,
};

const branchesSlice = createSlice({
  name: "branches",
  initialState,
  reducers: {
    setBranchFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranchesThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchBranchesThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items;
        state.meta = action.payload.meta;
      })
      .addCase(fetchBranchesThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || "Failed to load branches";
      })
      .addCase(createBranchThunk.pending, (state) => {
        state.mutationStatus = "loading";
      })
      .addCase(createBranchThunk.fulfilled, (state) => {
        state.mutationStatus = "succeeded";
      })
      .addCase(createBranchThunk.rejected, (state) => {
        state.mutationStatus = "failed";
      })
      .addCase(updateBranchThunk.pending, (state) => {
        state.mutationStatus = "loading";
      })
      .addCase(updateBranchThunk.fulfilled, (state) => {
        state.mutationStatus = "succeeded";
      })
      .addCase(updateBranchThunk.rejected, (state) => {
        state.mutationStatus = "failed";
      })
      .addCase(bulkDeleteBranchesThunk.pending, (state) => {
        state.mutationStatus = "loading";
      })
      .addCase(bulkDeleteBranchesThunk.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        const ids = action.payload?.ids || [];
        if (ids.length) {
          state.items = state.items.filter((item) => !ids.includes(item.id));
        }
      })
      .addCase(bulkDeleteBranchesThunk.rejected, (state) => {
        state.mutationStatus = "failed";
      });
  },
});

export const { setBranchFilters } = branchesSlice.actions;
export default branchesSlice.reducer;
