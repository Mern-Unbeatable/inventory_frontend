import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { verificationService } from "./verificationService.js";
import { appConfig } from "@/config/app.config.js";

export const fetchVerificationsThunk = createAsyncThunk(
  "verifications/fetchList",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { page, limit, search, status } = getState().verifications.filters;
      return await verificationService.list({
        page,
        limit,
        search: search || undefined,
        status: status || undefined,
      });
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const createVerificationThunk = createAsyncThunk(
  "verifications/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await verificationService.create(payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const updateVerificationThunk = createAsyncThunk(
  "verifications/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await verificationService.update(id, payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const deleteVerificationThunk = createAsyncThunk(
  "verifications/delete",
  async (id, { rejectWithValue }) => {
    try {
      await verificationService.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const bulkDeleteVerificationsThunk = createAsyncThunk(
  "verifications/bulkDelete",
  async (ids, { rejectWithValue }) => {
    try {
      const result = await verificationService.bulkRemove(ids);
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
    status: "",
  },
  status: "idle",
  mutationStatus: "idle",
  error: null,
};

const verificationsSlice = createSlice({
  name: "verifications",
  initialState,
  reducers: {
    setVerificationFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVerificationsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchVerificationsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items;
        state.meta = action.payload.meta;
      })
      .addCase(fetchVerificationsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || "Failed to load verifications";
      })
      .addCase(createVerificationThunk.pending, (state) => {
        state.mutationStatus = "loading";
      })
      .addCase(createVerificationThunk.fulfilled, (state) => {
        state.mutationStatus = "succeeded";
      })
      .addCase(createVerificationThunk.rejected, (state) => {
        state.mutationStatus = "failed";
      })
      .addCase(updateVerificationThunk.pending, (state) => {
        state.mutationStatus = "loading";
      })
      .addCase(updateVerificationThunk.fulfilled, (state) => {
        state.mutationStatus = "succeeded";
      })
      .addCase(updateVerificationThunk.rejected, (state) => {
        state.mutationStatus = "failed";
      })
      .addCase(deleteVerificationThunk.pending, (state) => {
        state.mutationStatus = "loading";
      })
      .addCase(deleteVerificationThunk.fulfilled, (state) => {
        state.mutationStatus = "succeeded";
      })
      .addCase(deleteVerificationThunk.rejected, (state) => {
        state.mutationStatus = "failed";
      });
  },
});

export const { setVerificationFilters } = verificationsSlice.actions;
export default verificationsSlice.reducer;
