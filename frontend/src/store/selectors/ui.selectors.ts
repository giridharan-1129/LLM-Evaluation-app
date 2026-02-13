import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';

const selectUIState = (state: RootState) => state.ui;

export const selectNotifications = createSelector([selectUIState], (ui) => ui.notifications);

export const selectModals = createSelector([selectUIState], (ui) => ui.modals);

export const selectSidebarOpen = createSelector([selectUIState], (ui) => ui.sidebarOpen);

export const selectTheme = createSelector([selectUIState], (ui) => ui.theme);

export const selectLoading = createSelector([selectUIState], (ui) => ui.loading);

export const selectIsGlobalLoading = createSelector([selectLoading], (loading) => loading.global);

export const selectModalById = (modalId: string) =>
  createSelector([selectModals], (modals) => modals[modalId]);

export const selectNotificationCount = createSelector(
  [selectNotifications],
  (notifications) => notifications.length
);

export const selectHasNotifications = createSelector(
  [selectNotifications],
  (notifications) => notifications.length > 0
);

export const selectLatestNotification = createSelector([selectNotifications], (notifications) =>
  notifications.length > 0 ? notifications[notifications.length - 1] : null
);
