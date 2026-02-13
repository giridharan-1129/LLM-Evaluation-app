import { createAsyncThunk } from '@reduxjs/toolkit';
import type { Prompt, PromptVersion, CreatePromptPayload, CreateVersionPayload } from '../types';
import { promptService } from '../../api/services';

/**
 * Fetch prompts by project ID
 */
export const fetchPromptsByProject = createAsyncThunk(
  'prompt/fetchByProject',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await promptService.getPromptsByProject(projectId);
      return response as Prompt[];
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch prompts';
      return rejectWithValue(message);
    }
  }
);

/**
 * Get single prompt
 */
export const fetchPrompt = createAsyncThunk(
  'prompt/fetchPrompt',
  async (promptId: string, { rejectWithValue }) => {
    try {
      const response = await promptService.getPrompt(promptId);
      return response as Prompt;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch prompt';
      return rejectWithValue(message);
    }
  }
);

/**
 * Create new prompt
 */
export const createPrompt = createAsyncThunk(
  'prompt/createPrompt',
  async (payload: CreatePromptPayload, { rejectWithValue }) => {
    try {
      const response = await promptService.createPrompt(payload);
      return response as Prompt;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create prompt';
      return rejectWithValue(message);
    }
  }
);

/**
 * Create new prompt version
 */
export const createPromptVersion = createAsyncThunk(
  'prompt/createVersion',
  async (payload: CreateVersionPayload, { rejectWithValue }) => {
    try {
      const response = await promptService.createVersion(payload);
      return response as PromptVersion;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create version';
      return rejectWithValue(message);
    }
  }
);

/**
 * Delete prompt
 */
export const deletePrompt = createAsyncThunk(
  'prompt/deletePrompt',
  async (promptId: string, { rejectWithValue }) => {
    try {
      await promptService.deletePrompt(promptId);
      return promptId;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete prompt';
      return rejectWithValue(message);
    }
  }
);
