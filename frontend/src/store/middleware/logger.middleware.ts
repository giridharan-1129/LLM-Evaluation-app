import { Middleware } from '@reduxjs/toolkit';

export const loggerMiddleware: Middleware = (store) => (next) => (action) => {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.group(`🔵 Action: ${action.type}`);
    // eslint-disable-next-line no-console
    console.log('📤 Dispatched:', action);
    // eslint-disable-next-line no-console
    console.log('📊 Previous State:', store.getState());
  }

  const result = next(action);

  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('📊 New State:', store.getState());
    // eslint-disable-next-line no-console
    console.groupEnd();
  }

  return result;
};
