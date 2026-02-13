import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';
import type { UIState, Notification, ShowNotificationPayload, OpenModalPayload } from '../types';

const initialState: UIState = {
  notifications: [],
  modals: {},
  sidebarOpen: true,
  theme: 'light',
  loading: {
    global: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showNotification: (state, action: PayloadAction<ShowNotificationPayload>) => {
      const notification: Notification = {
        id: nanoid(),
        type: action.payload.type,
        message: action.payload.message,
        description: action.payload.description,
        duration: action.payload.duration ?? 3000,
        createdAt: Date.now(),
      };
      state.notifications.push(notification);
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },

    openModal: (state, action: PayloadAction<OpenModalPayload>) => {
      state.modals[action.payload.id] = {
        id: action.payload.id,
        isOpen: true,
        title: action.payload.title,
        data: action.payload.data,
      };
    },

    closeModal: (state, action: PayloadAction<string>) => {
      const modal = state.modals[action.payload];
      if (modal) {
        modal.isOpen = false;
      }
    },

    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },

    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },

    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },

    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },

    setLoading: (state, action: PayloadAction<{ key: string; isLoading: boolean }>) => {
      state.loading[action.payload.key] = action.payload.isLoading;
    },
  },
});

export const {
  showNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  toggleSidebar,
  setSidebarOpen,
  toggleTheme,
  setTheme,
  setGlobalLoading,
  setLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
