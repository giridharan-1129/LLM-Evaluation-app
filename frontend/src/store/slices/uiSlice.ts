import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UIState, ShowNotificationPayload, OpenModalPayload, Notification } from '../types'

const initialState: UIState = {
  notifications: [],
  modals: [],
  loading: false,
  error: null,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showNotification: (state, action: PayloadAction<ShowNotificationPayload>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: action.payload.type,
        message: action.payload.message,
        duration: action.payload.duration,
      }
      state.notifications.push(notification)
    },
    dismissNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n: Notification) => n.id !== action.payload
      )
    },
    openModal: (state, action: PayloadAction<OpenModalPayload>) => {
      const existingModal = state.modals.find((m) => m.type === action.payload.type)
      if (existingModal) {
        existingModal.isOpen = true
        existingModal.data = action.payload.data
      } else {
        state.modals.push({
          type: action.payload.type,
          isOpen: true,
          data: action.payload.data,
        })
      }
    },
    closeModal: (state, action: PayloadAction<string>) => {
      const modal = state.modals.find((m) => m.type === action.payload)
      if (modal) {
        modal.isOpen = false
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  showNotification,
  dismissNotification,
  openModal,
  closeModal,
  setLoading,
  setError,
} = uiSlice.actions
export default uiSlice.reducer
