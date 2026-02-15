import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../store'

const selectUIState = (state: RootState) => state.ui

export const selectNotifications = createSelector([selectUIState], (ui) => ui.notifications)

export const selectModals = createSelector([selectUIState], (ui) => ui.modals)

export const selectSidebarOpen = createSelector([selectUIState], (ui) => ui.sidebarOpen ?? true)

export const selectTheme = createSelector([selectUIState], (ui) => ui.theme ?? 'light')

export const selectLoading = createSelector([selectUIState], (ui) => ui.loading)

export const selectIsGlobalLoading = createSelector([selectLoading], (loading) => {
  if (typeof loading === 'boolean') return loading
  return loading?.global ?? false
})

export const selectModal = (modalId: string) =>
  createSelector([selectModals], (modals) => modals.find((m) => m.type === modalId))

export const selectError = createSelector([selectUIState], (ui) => ui.error)
