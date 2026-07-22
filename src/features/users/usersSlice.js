import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { usersService } from './usersService.js';
import { appConfig } from '@/config/app.config.js';

export const fetchUsersThunk = createAsyncThunk(
  'users/fetchList',
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
  }
);

export const createUserThunk = createAsyncThunk('users/create', async (payload, { rejectWithValue }) => {
  try {
    return await usersService.create(payload);
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const updateUserThunk = createAsyncThunk(
  'users/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await usersService.update(id, payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteUserThunk = createAsyncThunk('users/delete', async (id, { rejectWithValue }) => {
  try {
    await usersService.remove(id);
    return id;
  } catch (error) {
    return rejectWithValue(error);
  }
});

const initialState = {
  items: [],
  meta: { page: 1, limit: appConfig.paginationDefaultLimit, total: 0, totalPages: 1 },
  filters: { page: 1, limit: appConfig.paginationDefaultLimit, search: '', role: '' },
  status: 'idle',
  mutationStatus: 'idle',
  error: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUserFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUsersThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
        state.meta = action.payload.meta;
      })
      .addCase(fetchUsersThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to load users';
      })
      .addCase(createUserThunk.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(createUserThunk.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(createUserThunk.rejected, (state) => {
        state.mutationStatus = 'failed';
      })
      .addCase(updateUserThunk.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(updateUserThunk.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(updateUserThunk.rejected, (state) => {
        state.mutationStatus = 'failed';
      });
  },
});

export const { setUserFilters } = usersSlice.actions;
export default usersSlice.reducer;
