export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

export interface ShowNotificationPayload {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

export interface OpenModalPayload {
  type: string
  data?: any
}

export interface UIState {
  notifications: Notification[]
  modals: Array<{
    type: string
    isOpen: boolean
    data?: any
  }>
  loading: boolean | { global?: boolean }
  error: string | null
  sidebarOpen?: boolean
  theme?: 'light' | 'dark'
}
