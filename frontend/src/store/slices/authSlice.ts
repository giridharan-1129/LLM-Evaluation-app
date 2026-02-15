import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { loginUser, registerUser, refreshSession, logoutUser } from '../thunks'
import type { AuthState, AuthResponse } from '../types'

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  loading: false,
  user: null,
  token: null,
  refreshToken: null,
  error: null,
  expiresIn: null,
  sessionExpiredAt: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<AuthResponse>) => {
      state.isAuthenticated = true
      state.user = action.payload.user
      state.token = action.payload.access_token || null
      state.refreshToken = action.payload.refresh_token || null
      state.expiresIn = action.payload.expires_in || null
      state.sessionExpiredAt = action.payload.expires_in ? Date.now() + action.payload.expires_in * 1000 : null
      state.error = null
    },

    registerSuccess: (state, action: PayloadAction<AuthResponse>) => {
      state.isAuthenticated = true
      state.user = action.payload.user
      state.token = action.payload.access_token || null
      state.refreshToken = action.payload.refresh_token || null
      state.expiresIn = action.payload.expires_in || null
      state.sessionExpiredAt = action.payload.expires_in ? Date.now() + action.payload.expires_in * 1000 : null
      state.error = null
    },

    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.token = null
      state.refreshToken = null
      state.error = null
      state.expiresIn = null
      state.sessionExpiredAt = null
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },

    clearError: (state) => {
      state.error = null
    },
  },

  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.access_token || null
        state.refreshToken = action.payload.refresh_token || null
        state.expiresIn = action.payload.expires_in || null
        state.sessionExpiredAt = action.payload.expires_in ? Date.now() + action.payload.expires_in * 1000 : null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.loading = false
        state.error = action.payload as string
      })

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.access_token || null
        state.refreshToken = action.payload.refresh_token || null
        state.expiresIn = action.payload.expires_in || null
        state.sessionExpiredAt = action.payload.expires_in ? Date.now() + action.payload.expires_in * 1000 : null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.loading = false
        state.error = action.payload as string
      })

    // Refresh Session
    builder
      .addCase(refreshSession.pending, (state) => {
        state.isLoading = true
        state.loading = true
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.isLoading = false
        state.loading = false
        state.token = action.payload.access_token || null
        state.refreshToken = action.payload.refresh_token || null
        state.expiresIn = action.payload.expires_in || null
        state.sessionExpiredAt = action.payload.expires_in ? Date.now() + action.payload.expires_in * 1000 : null
      })
      .addCase(refreshSession.rejected, (state, action) => {
        state.isLoading = false
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = action.payload as string
      })

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true
        state.loading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.refreshToken = null
        state.sessionExpiredAt = null
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { loginSuccess, registerSuccess, logout, setError, clearError } = authSlice.actions
export default authSlice.reducer
