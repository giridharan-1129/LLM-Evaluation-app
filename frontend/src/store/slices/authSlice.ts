/**
 * Auth Slice
 * Manages user authentication state, login, logout, registration
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User, AuthResponse } from '../types';

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  token: null,
  error: null,
  sessionExpiredAt: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Action: Start login process
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    // Action: Login successful
    loginSuccess: (state, action: PayloadAction<AuthResponse>) => {
      state.isAuthenticated = true;
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      // Set session expiration time
      state.sessionExpiredAt = Date.now() + action.payload.expiresIn * 1000;
    },

    // Action: Login failed
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },

    // Action: Start registration process
    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    // Action: Registration successful
    registerSuccess: (state, action: PayloadAction<AuthResponse>) => {
      state.isAuthenticated = true;
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      state.sessionExpiredAt = Date.now() + action.payload.expiresIn * 1000;
    },

    // Action: Registration failed
    registerFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Action: Logout user
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      state.sessionExpiredAt = null;
    },

    // Action: Session expired
    sessionExpired: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = 'Session expired. Please login again.';
      state.sessionExpiredAt = null;
    },

    // Action: Clear error message
    clearError: (state) => {
      state.error = null;
    },

    // Action: Restore session from storage
    restoreSession: (
      state,
      action: PayloadAction<{ user: User; token: string; expiresIn: number }>
    ) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.sessionExpiredAt = Date.now() + action.payload.expiresIn * 1000;
    },
  },
});

// Export actions for use in components
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout,
  sessionExpired,
  clearError,
  restoreSession,
} = authSlice.actions;

// Export reducer for store configuration
export default authSlice.reducer;
