/**
 * Prompt Slice
 * Manages prompts, versions, and prompt selection
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { PromptState, Prompt, PromptVersion } from '../types';

const initialState: PromptState = {
  prompts: [],
  selectedPrompt: null,
  selectedVersion: null,
  isLoading: false,
  error: null,
};

const promptSlice = createSlice({
  name: 'prompt',
  initialState,
  reducers: {
    // Action: Start fetching prompts
    fetchPromptsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    // Action: Prompts fetched successfully
    fetchPromptsSuccess: (state, action: PayloadAction<Prompt[]>) => {
      state.isLoading = false;
      state.prompts = action.payload;
      state.error = null;
    },

    // Action: Fetch prompts failed
    fetchPromptsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Action: Create prompt
    createPromptSuccess: (state, action: PayloadAction<Prompt>) => {
      state.prompts.push(action.payload);
      state.selectedPrompt = action.payload;
      state.selectedVersion = action.payload.versions[0];
    },

    // Action: Add new version to prompt
    addVersionSuccess: (
      state,
      action: PayloadAction<{ promptId: string; version: PromptVersion }>
    ) => {
      const prompt = state.prompts.find((p) => p.id === action.payload.promptId);
      if (prompt) {
        prompt.versions.push(action.payload.version);
      }
    },

    // Action: Select a prompt
    selectPrompt: (state, action: PayloadAction<Prompt>) => {
      state.selectedPrompt = action.payload;
      state.selectedVersion = action.payload.versions[0];
    },

    // Action: Select a version
    selectVersion: (state, action: PayloadAction<PromptVersion>) => {
      state.selectedVersion = action.payload;
    },

    // Action: Delete prompt
    deletePromptSuccess: (state, action: PayloadAction<string>) => {
      state.prompts = state.prompts.filter((p) => p.id !== action.payload);
      if (state.selectedPrompt?.id === action.payload) {
        state.selectedPrompt = null;
        state.selectedVersion = null;
      }
    },

    // Action: Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchPromptsStart,
  fetchPromptsSuccess,
  fetchPromptsFailure,
  createPromptSuccess,
  addVersionSuccess,
  selectPrompt,
  selectVersion,
  deletePromptSuccess,
  clearError,
} = promptSlice.actions;

export default promptSlice.reducer;
