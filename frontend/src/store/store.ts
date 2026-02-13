import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import projectReducer from './slices/projectSlice'
import promptReducer from './slices/promptSlice'
import jobReducer from './slices/jobSlice'
import metricsReducer from './slices/metricsSlice'
import uiReducer from './slices/uiSlice'
import logger from './middleware/logger'
import errorHandler from './middleware/errorHandler'

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
        ignoredActions: ['auth/loginUser/fulfilled', 'auth/registerUser/fulfilled'],
        ignoredPaths: ['auth.user'],
      },
    })
      .concat(logger)
      .concat(errorHandler),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
