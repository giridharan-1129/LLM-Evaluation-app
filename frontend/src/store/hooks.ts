import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from './store'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// Auth hooks
export const useAuth = () => useAppSelector((state) => state.auth)

// Project hooks
export const useProject = () => useAppSelector((state) => state.project)

// Prompt hooks
export const usePrompt = () => useAppSelector((state) => state.prompt)

// Job hooks
export const useJob = () => useAppSelector((state) => state.job)

// Metrics hooks
export const useMetrics = () => useAppSelector((state) => state.metrics)

// UI hooks
export const useUI = () => useAppSelector((state) => state.ui)
