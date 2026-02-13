import { RootState } from '../store'

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
export const selectIsLoading = (state: RootState) => state.auth.isLoading
export const selectUser = (state: RootState) => state.auth.user
export const selectToken = (state: RootState) => state.auth.token
export const selectError = (state: RootState) => state.auth.error
export const selectExpiresIn = (state: RootState) => state.auth.expiresIn
export const selectSessionExpiredAt = (state: RootState) => state.auth.sessionExpiredAt

export const selectIsSessionExpired = (state: RootState) => {
  if (!state.auth.sessionExpiredAt) return false
  return Date.now() > state.auth.sessionExpiredAt
}
