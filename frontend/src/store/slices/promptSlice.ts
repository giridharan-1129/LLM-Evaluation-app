import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PromptState, Prompt, PromptVersion } from '../types'

const initialState: PromptState = {
  prompts: [],
  currentPrompt: null,
  selectedPrompt: null,
  selectedVersion: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
}

const promptSlice = createSlice({
  name: 'prompt',
  initialState,
  reducers: {
    setSelectedPrompt: (state, action: PayloadAction<Prompt | null>) => {
      state.selectedPrompt = action.payload
    },
    setSelectedVersion: (state, action: PayloadAction<PromptVersion | null>) => {
      state.selectedVersion = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    setPrompts: (state, action: PayloadAction<Prompt[]>) => {
      state.prompts = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { 
  setSelectedPrompt, 
  setSelectedVersion, 
  clearError, 
  setPrompts,
  setLoading,
  setError 
} = promptSlice.actions
export default promptSlice.reducer
