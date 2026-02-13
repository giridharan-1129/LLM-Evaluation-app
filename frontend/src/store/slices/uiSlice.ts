import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { UIState, ShowNotificationPayload, OpenModalPayload, Notification } from '../types'

const initialState: UIState = {
  notifications: [],
  modals: {},
  sidebarOpen: true,
  theme: 'light',
  loading: {},
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showNotification: (state, action: PayloadAction<ShowNotificationPayload>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        message: action.payload.message,
        type: action.payload.type,
        duration: action.payload.duration || 5000,
      }
      state.notifications.push(notification)
    },

    dismissNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      )
    },

    openModal: (state, action: PayloadAction<OpenModalPayload>) => {
      state.modals[action.payload.name] = {
        name: action.payload.name,
        isOpen: true,
        title: action.payload.title,
        data: action.payload.data,
      }
    },

    closeModal: (state, action: PayloadAction<string>) => {
      const modal = state.modals[action.payload]
      if (modal) {
        modal.isOpen = false
      }
    },

    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },

    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },

    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },

    setLoading: (state, action: PayloadAction<{ key: string; value: boolean }>) => {
      state.loading[action.payload.key] = action.payload.value
    },
  },
})

export const {
  showNotification,
  dismissNotification,
  openModal,
  closeModal,
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  setLoading,
} = uiSlice.actions

export default uiSlice.reducer
