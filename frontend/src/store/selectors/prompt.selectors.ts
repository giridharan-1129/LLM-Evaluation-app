import { RootState } from '../store'

export const selectPrompts = (state: RootState) =>
  state.prompt.prompts

export const selectCurrentPrompt = (state: RootState) =>
  state.prompt.currentPrompt

export const selectSelectedPrompt = (state: RootState) =>
  state.prompt.selectedPrompt

export const selectSelectedVersion = (state: RootState) =>
  state.prompt.selectedVersion

export const selectPromptLoading = (state: RootState) =>
  state.prompt.loading || state.prompt.isLoading

export const selectPromptError = (state: RootState) =>
  state.prompt.error
