import { configureStore } from '@reduxjs/toolkit';
import type { ThunkAction, Action } from '@reduxjs/toolkit';
import {
  authReducer,
  projectReducer,
  promptReducer,
  jobReducer,
  metricsReducer,
  uiReducer,
} from './slices';
import { loggerMiddleware, errorHandlerMiddleware, analyticsMiddleware } from './middleware';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    project: projectReducer,
    prompt: promptReducer,
    job: jobReducer,
    metrics: metricsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['@@INIT'],
        ignoredPaths: ['ui.loading'],
      },
    })
      .concat(loggerMiddleware)
      .concat(errorHandlerMiddleware)
      .concat(analyticsMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action>;
