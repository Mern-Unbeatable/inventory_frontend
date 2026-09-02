import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { usersService } from "./usersService.js";
import { appConfig } from "@/config/app.config.js";

export const fetchUsersThunk = createAsyncThunk(
  "users/fetchList",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { page, limit, search, role } = getState().users.filters;
      return await usersService.list({
        page,
        limit,
        search: search || undefined,
        role: role || undefined,
      });
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const fetchUserByIdThunk = createAsyncThunk(
  "users/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await usersService.getById(id);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const createUserThunk = createAsyncThunk(
  "users/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await usersService.create(payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const updateUserThunk = createAsyncThunk(
  "users/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await usersService.update(id, payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const deleteUserThunk = createAsyncThunk(
  "users/delete",
  async (id, { rejectWithValue }) => {
    try {
      await usersService.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const bulkDeleteUsersThunk = createAsyncThunk(
  "users/bulkDelete",
  async (ids, { rejectWithValue }) => {
    try {
      const result = await usersService.bulkRemove(ids);
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
    role: "",
  },
  current: null,
  status: "idle",
  detailStatus: "idle",
  mutationStatus: "idle",
  error: null,
  detailError: null,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUserFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentUser: (state) => {
      state.current = null;
      state.detailStatus = "idle";
      state.detailError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUsersThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items;
        state.meta = action.payload.meta;
      })
      .addCase(fetchUsersThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || "Failed to load users";
      })

      .addCase(fetchUserByIdThunk.pending, (state) => {
        state.detailStatus = "loading";
        state.detailError = null;
      })
      .addCase(fetchUserByIdThunk.fulfilled, (state, action) => {
        state.detailStatus = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchUserByIdThunk.rejected, (state, action) => {
        state.detailStatus = "failed";
        state.current = null;
        state.detailError = action.payload?.message || "Failed to load user";
      })

      .addCase(createUserThunk.pending, (state) => {
        state.mutationStatus = "loading";
      })
      .addCase(createUserThunk.fulfilled, (state) => {
        state.mutationStatus = "succeeded";
      })
      .addCase(createUserThunk.rejected, (state) => {
        state.mutationStatus = "failed";
      })

      .addCase(updateUserThunk.pending, (state) => {
        state.mutationStatus = "loading";
      })
      .addCase(updateUserThunk.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        const updated = action.payload;
        if (updated?.id) {
          state.items = state.items.map((item) =>
            item.id === updated.id ? { ...item, ...updated } : item,
          );
          if (state.current?.id === updated.id) {
            state.current = { ...state.current, ...updated };
          }
        }
      })
      .addCase(updateUserThunk.rejected, (state) => {
        state.mutationStatus = "failed";
      })

      .addCase(deleteUserThunk.pending, (state) => {
        state.mutationStatus = "loading";
      })
      .addCase(deleteUserThunk.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        const id = action.payload;
        state.items = state.items.filter((item) => item.id !== id);
        if (state.current?.id === id) {
          state.current = null;
          state.detailStatus = "idle";
        }
      })
      .addCase(deleteUserThunk.rejected, (state) => {
        state.mutationStatus = "failed";
      })
      .addCase(bulkDeleteUsersThunk.pending, (state) => {
        state.mutationStatus = "loading";
      })
      .addCase(bulkDeleteUsersThunk.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        const ids = action.payload?.ids || [];
        if (ids.length) {
          state.items = state.items.filter((item) => !ids.includes(item.id));
          if (state.current && ids.includes(state.current.id)) {
            state.current = null;
            state.detailStatus = "idle";
          }
        }
      })
      .addCase(bulkDeleteUsersThunk.rejected, (state) => {
        state.mutationStatus = "failed";
      });
  },
});

export const { setUserFilters, clearCurrentUser } = usersSlice.actions;
export default usersSlice.reducer;
