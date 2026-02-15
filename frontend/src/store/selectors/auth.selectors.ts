import { RootState } from '../store'

export const selectUser = (state: RootState) => state.auth.user

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated

export const selectIsLoading = (state: RootState) => state.auth.loading || state.auth.isLoading

export const selectToken = (state: RootState) => state.auth.token

export const selectRefreshToken = (state: RootState) => state.auth.refreshToken

export const selectExpiresIn = (state: RootState) => state.auth.expiresIn

export const selectSessionExpiredAt = (state: RootState) => state.auth.sessionExpiredAt

export const selectIsSessionExpired = (state: RootState) => {
  if (!state.auth.sessionExpiredAt) return false
  return Date.now() > state.auth.sessionExpiredAt
}

export const selectError = (state: RootState) => state.auth.error
