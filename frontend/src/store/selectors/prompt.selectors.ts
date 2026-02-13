import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';

const selectPromptState = (state: RootState) => state.prompt;

export const selectAllPrompts = createSelector([selectPromptState], (prompt) => prompt.prompts);

export const selectSelectedPrompt = createSelector(
  [selectPromptState],
  (prompt) => prompt.selectedPrompt
);

export const selectSelectedVersion = createSelector(
  [selectPromptState],
  (prompt) => prompt.selectedVersion
);

export const selectPromptIsLoading = createSelector(
  [selectPromptState],
  (prompt) => prompt.isLoading
);

export const selectPromptError = createSelector([selectPromptState], (prompt) => prompt.error);

export const selectPromptsByProjectId = (projectId: string) =>
  createSelector([selectAllPrompts], (prompts) => prompts.filter((p) => p.projectId === projectId));

export const selectPromptById = (promptId: string) =>
  createSelector([selectAllPrompts], (prompts) => prompts.find((p) => p.id === promptId));

export const selectPromptVersionCount = createSelector(
  [selectSelectedPrompt],
  (prompt) => prompt?.versions.length ?? 0
);
