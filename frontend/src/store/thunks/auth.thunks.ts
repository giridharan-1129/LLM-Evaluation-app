import { createAsyncThunk } from '@reduxjs/toolkit';
import type { LoginCredentials, RegisterCredentials, AuthResponse } from '../types';
import { authService } from '../../api/services';

/**
 * Login Thunk
 * Handles user login async operation
 */
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response as AuthResponse;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      return rejectWithValue(message);
    }
  }
);

/**
 * Register Thunk
 * Handles user registration async operation
 */
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.register(credentials);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response as AuthResponse;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      return rejectWithValue(message);
    }
  }
);

/**
 * Refresh Session Thunk
 */
export const refreshSession = createAsyncThunk(
  'auth/refreshSession',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }
      const response = await authService.refreshToken(token);
      localStorage.setItem('token', response.token);
      return response as AuthResponse;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const message = error instanceof Error ? error.message : 'Session refresh failed';
      return rejectWithValue(message);
    }
  }
);

/**
 * Logout Thunk
 */
export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return undefined;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Logout failed';
    return rejectWithValue(message);
  }
});
