import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';

// Base selector - returns auth state
const selectAuthState = (state: RootState) => state.auth;

// Memoized selectors - only recompute if input changes
export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => auth.isAuthenticated
);

export const selectUser = createSelector([selectAuthState], (auth) => auth.user);

export const selectToken = createSelector([selectAuthState], (auth) => auth.token);

export const selectAuthError = createSelector([selectAuthState], (auth) => auth.error);

export const selectAuthIsLoading = createSelector([selectAuthState], (auth) => auth.isLoading);

export const selectSessionExpiredAt = createSelector(
  [selectAuthState],
  (auth) => auth.sessionExpiredAt
);

// Composed selector
export const selectAuthStatus = createSelector(
  [selectIsAuthenticated, selectAuthIsLoading, selectAuthError],
  (isAuthenticated, isLoading, error) => ({
    isAuthenticated,
    isLoading,
    error,
  })
);
