export interface Notification {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

export interface ShowNotificationPayload {
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

export interface Modal {
  name: string
  isOpen: boolean
  title?: string
  data?: Record<string, any>
}

export interface OpenModalPayload {
  name: string
  title?: string
  data?: Record<string, any>
}

export interface UIState {
  notifications: Notification[]
  modals: {
    [key: string]: Modal
  }
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  loading: {
    [key: string]: boolean
  }
}
