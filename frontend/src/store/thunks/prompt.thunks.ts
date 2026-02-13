import { createAsyncThunk } from '@reduxjs/toolkit'
import type { PromptCreate, PromptVersionCreate } from '../types'
import { promptService } from '../../api/services'

/**
 * Fetch Prompts by Project
 */
export const fetchPromptsByProject = createAsyncThunk(
  'prompt/fetchByProject',
  async (
    { projectId, page = 1, limit = 10 }: { projectId: string; page?: number; limit?: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await promptService.getPromptsByProject(projectId, page, limit)
      return response
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch prompts'
      return rejectWithValue(message)
    }
  },
)

/**
 * Fetch Prompt by ID
 */
export const fetchPromptById = createAsyncThunk(
  'prompt/fetchById',
  async (promptId: string, { rejectWithValue }) => {
    try {
      const response = await promptService.getPromptById(promptId)
      return response
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch prompt'
      return rejectWithValue(message)
    }
  },
)

/**
 * Create Prompt
 */
export const createPrompt = createAsyncThunk(
  'prompt/create',
  async (
    { projectId, payload }: { projectId: string; payload: PromptCreate },
    { rejectWithValue },
  ) => {
    try {
      const response = await promptService.createPrompt(projectId, payload)
      return response
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create prompt'
      return rejectWithValue(message)
    }
  },
)

/**
 * Create Prompt Version
 */
export const createPromptVersion = createAsyncThunk(
  'prompt/createVersion',
  async (
    { promptId, payload }: { promptId: string; payload: PromptVersionCreate },
    { rejectWithValue },
  ) => {
    try {
      const response = await promptService.createPromptVersion(promptId, payload)
      return response
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create version'
      return rejectWithValue(message)
    }
  },
)

/**
 * Delete Prompt
 */
export const deletePrompt = createAsyncThunk(
  'prompt/delete',
  async (promptId: string, { rejectWithValue }) => {
    try {
      await promptService.deletePrompt(promptId)
      return promptId
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete prompt'
      return rejectWithValue(message)
    }
  },
)
