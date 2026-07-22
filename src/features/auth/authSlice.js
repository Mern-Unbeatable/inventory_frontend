import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authService } from './authService.js';
import { clearAuthSession, getAccessToken } from '@/utils/auth/authStorage.js';

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.login(credentials);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

/**
 * Runs once on app boot when a persisted token exists, to confirm the
 * session is still valid and refresh the cached user profile.
 */
export const bootstrapAuthThunk = createAsyncThunk(
  'auth/bootstrap',
  async (_, { rejectWithValue }) => {
    if (!getAccessToken()) {
      return rejectWithValue({ code: 'NO_TOKEN' });
    }

    try {
      return await authService.fetchCurrentUser();
    } catch (error) {
      clearAuthSession();
      return rejectWithValue(error);
    }
  }
);

const persistedUser = authService.getPersistedUser();

const initialState = {
  user: persistedUser,
  isAuthenticated: Boolean(persistedUser && getAccessToken()),
  isBootstrapped: false,
  // Dedicated to login/logout UI — bootstrap must not overwrite this,
  // otherwise a "no token" boot leaves status=failed and confuses the form.
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
      if (state.status === 'failed') state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isBootstrapped = true;
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload?.message || 'Login failed';
      })

      .addCase(logoutThunk.fulfilled, (state) => {
        state.status = 'idle';
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutThunk.rejected, (state) => {
        // Always clear local session even if the API call fails.
        state.status = 'idle';
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })

      .addCase(bootstrapAuthThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isBootstrapped = true;
        state.error = null;
      })
      .addCase(bootstrapAuthThunk.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isBootstrapped = true;
        // Don't mark status=failed for a normal "no session" boot.
        if (action.payload?.code !== 'NO_TOKEN') {
          state.error = action.payload?.message || null;
        }
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
