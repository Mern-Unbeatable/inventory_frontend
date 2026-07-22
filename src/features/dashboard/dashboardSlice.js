import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { dashboardService } from './dashboardService.js';

export const fetchDashboardThunk = createAsyncThunk(
  'dashboard/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardService.fetchOverview();
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState = {
  data: null,
  status: 'idle',
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    resetDashboard: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDashboardThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchDashboardThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to load dashboard';
      });
  },
});

export const { resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
