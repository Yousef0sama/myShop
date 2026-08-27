import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import { validateRegister } from '../../utils/validation';

// ? Safely retrieve active session data from LocalStorage on initial load
const getSavedAuthData = () => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem('authData');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

const savedAuthData = getSavedAuthData();

// * Initial authentication state structure
const initialState = {
  user: savedAuthData?.user || null,
  token: savedAuthData?.accessToken || null,
  status: 'idle', // ? Status enum: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// * Async Thunk: Authenticate user credentials and persist session
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await authService.login(email, password);
      // ? Expected payload structure: { accessToken, user }
      if (typeof window !== 'undefined') {
        localStorage.setItem('authData', JSON.stringify(data));
      }
      return data;
    } catch (error) {
      // ! Return server error message or fallback translation key
      return rejectWithValue(error.message || 'errors.loginFailed');
    }
  }
);

// * Async Thunk: Register new user account with pre-validation and persist session
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ userData, tErrors }, { rejectWithValue }) => {
    // ? Execute pre-validation using passed translated errors object from UI
    if (tErrors) {
      const validation = validateRegister(userData, tErrors);
      if (!validation.isValid) {
        return rejectWithValue(validation.error);
      }
    }

    try {
      // ? Omit confirmPassword from payload sent to backend API
      const { confirmPassword, ...dataToSend } = userData;

      const data = await authService.register(dataToSend);
      // ? Expected payload structure: { accessToken, user }
      if (typeof window !== 'undefined') {
        localStorage.setItem('authData', JSON.stringify(data));
      }
      return data;
    } catch (error) {
      // ! Return server error message or fallback translation key
      return rejectWithValue(error.message || 'errors.registerFailed');
    }
  }
);

// * Redux slice managing global authentication state and reducers
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // ! Purge user session state and remove credentials from LocalStorage
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authData');
      }
    },
    // ? Clear existing authentication error state
    clearError: (state) => {
      state.error = null;
    },
    // * Sync updated user details into auth session & localStorage (used when profile updates)
    updateAuthUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      if (typeof window !== 'undefined') {
        try {
          const currentAuthData = JSON.parse(localStorage.getItem('authData')) || {};
          localStorage.setItem(
            'authData',
            JSON.stringify({ ...currentAuthData, user: state.user })
          );
        } catch (e) {
          // ! Fallback if LocalStorage contains invalid JSON
          localStorage.setItem('authData', JSON.stringify({ user: state.user }));
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // * Login Action Handlers
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // * Register Action Handlers
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, updateAuthUser } = authSlice.actions;
export default authSlice.reducer;