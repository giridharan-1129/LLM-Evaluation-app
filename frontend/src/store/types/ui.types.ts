/**
 * UI State Types
 * Manages UI-specific state (modals, notifications, loading)
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  description?: string;
  duration?: number;
  createdAt: number;
}

export interface Modal {
  id: string;
  isOpen: boolean;
  title?: string;
  data?: unknown;
}

export interface UIState {
  notifications: Notification[];
  modals: Record<string, Modal>;
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  loading: {
    global: boolean;
    [key: string]: boolean;
  };
}

export interface ShowNotificationPayload {
  type: NotificationType;
  message: string;
  description?: string;
  duration?: number;
}

export interface OpenModalPayload {
  id: string;
  title?: string;
  data?: unknown;
}
