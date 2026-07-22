import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { countriesService } from './countriesService.js';

export const fetchCountriesThunk = createAsyncThunk(
  'countries/fetchList',
  async (_, { rejectWithValue }) => {
    try {
      return await countriesService.list();
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createCountryThunk = createAsyncThunk(
  'countries/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await countriesService.create(payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateCountryThunk = createAsyncThunk(
  'countries/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await countriesService.update(id, payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteCountryThunk = createAsyncThunk(
  'countries/delete',
  async (id, { rejectWithValue }) => {
    try {
      await countriesService.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState = {
  items: [],
  status: 'idle',
  mutationStatus: 'idle',
  error: null,
};

const countriesSlice = createSlice({
  name: 'countries',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountriesThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCountriesThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
      })
      .addCase(fetchCountriesThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to load countries';
      })
      .addCase(createCountryThunk.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(createCountryThunk.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(createCountryThunk.rejected, (state) => {
        state.mutationStatus = 'failed';
      })
      .addCase(updateCountryThunk.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(updateCountryThunk.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(updateCountryThunk.rejected, (state) => {
        state.mutationStatus = 'failed';
      })
      .addCase(deleteCountryThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export default countriesSlice.reducer;
