import { createSlice } from '@reduxjs/toolkit'
import {
  fetchPromptsByProject,
  fetchPromptById,
  createPrompt,
  createPromptVersion,
  deletePrompt,
} from '../thunks'
import type { PromptState } from '../types'

const initialState: PromptState = {
  prompts: [],
  selectedPrompt: null,
  selectedVersion: null,
  isLoading: false,
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
    selectPrompt: (state, action) => {
      state.selectedPrompt = action.payload
    },
    selectVersion: (state, action) => {
      state.selectedVersion = action.payload
    },
  },
  extraReducers: (builder) => {
    // Fetch Prompts by Project
    builder
      .addCase(fetchPromptsByProject.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPromptsByProject.fulfilled, (state, action) => {
        state.isLoading = false
        state.prompts = action.payload.prompts || []
        state.pagination = action.payload.pagination || state.pagination
      })
      .addCase(fetchPromptsByProject.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch Prompt by ID
    builder
      .addCase(fetchPromptById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPromptById.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedPrompt = action.payload
        if (action.payload.versions && action.payload.versions.length > 0) {
          state.selectedVersion = action.payload.versions[0]
        }
      })
      .addCase(fetchPromptById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Create Prompt
    builder
      .addCase(createPrompt.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createPrompt.fulfilled, (state, action) => {
        state.isLoading = false
        state.prompts.push(action.payload)
      })
      .addCase(createPrompt.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Create Prompt Version
    builder
      .addCase(createPromptVersion.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createPromptVersion.fulfilled, (state, action) => {
        state.isLoading = false
        if (state.selectedPrompt && state.selectedPrompt.versions) {
          state.selectedPrompt.versions.push(action.payload)
        }
      })
      .addCase(createPromptVersion.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Delete Prompt
    builder
      .addCase(deletePrompt.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deletePrompt.fulfilled, (state, action) => {
        state.isLoading = false
        state.prompts = state.prompts.filter((p) => p.id !== action.payload)
      })
      .addCase(deletePrompt.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { selectPrompt, selectVersion } = promptSlice.actions
export default promptSlice.reducer
