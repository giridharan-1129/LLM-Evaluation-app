import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../store'

const selectPromptState = (state: RootState) => state.prompt

export const selectAllPrompts = createSelector(
  [selectPromptState],
  (prompt) => prompt.prompts,
)

export const selectSelectedPrompt = createSelector(
  [selectPromptState],
  (prompt) => prompt.selectedPrompt,
)

export const selectSelectedVersion = createSelector(
  [selectPromptState],
  (prompt) => prompt.selectedVersion,
)

export const selectPromptIsLoading = createSelector(
  [selectPromptState],
  (prompt) => prompt.isLoading,
)

export const selectPromptError = createSelector([selectPromptState], (prompt) => prompt.error)

export const selectPromptsByProject = (projectId: string) =>
  createSelector([selectAllPrompts], (prompts) =>
    prompts.filter((p) => p.project_id === projectId),
  )

export const selectPromptById = (promptId: string) =>
  createSelector([selectAllPrompts], (prompts) =>
    prompts.find((p) => p.id === promptId),
  )

export const selectPromptVersionCount = (promptId: string) =>
  createSelector([selectPromptById(promptId)], (prompt) =>
    prompt?.versions?.length ?? 0,
  )
