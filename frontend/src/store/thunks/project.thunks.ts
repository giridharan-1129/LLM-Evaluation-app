import { createAsyncThunk } from '@reduxjs/toolkit';
import type { Project, CreateProjectPayload, UpdateProjectPayload } from '../types';
import { projectService } from '../../api/services';

/**
 * Fetch all projects
 */
export const fetchProjects = createAsyncThunk(
  'project/fetchProjects',
  async (params: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await projectService.getProjects(params.page || 1, params.limit || 10);
      return response as { projects: Project[]; total: number };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch projects';
      return rejectWithValue(message);
    }
  }
);

/**
 * Get single project by ID
 */
export const fetchProjectById = createAsyncThunk(
  'project/fetchProjectById',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await projectService.getProjectById(projectId);
      return response as Project;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch project';
      return rejectWithValue(message);
    }
  }
);

/**
 * Create new project
 */
export const createProject = createAsyncThunk(
  'project/createProject',
  async (payload: CreateProjectPayload, { rejectWithValue }) => {
    try {
      const response = await projectService.createProject(payload);
      return response as Project;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create project';
      return rejectWithValue(message);
    }
  }
);

/**
 * Update project
 */
export const updateProject = createAsyncThunk(
  'project/updateProject',
  async (payload: UpdateProjectPayload, { rejectWithValue }) => {
    try {
      const response = await projectService.updateProject(payload.id, {
        name: payload.name,
        description: payload.description,
      });
      return response as Project;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update project';
      return rejectWithValue(message);
    }
  }
);

/**
 * Delete project
 */
export const deleteProject = createAsyncThunk(
  'project/deleteProject',
  async (projectId: string, { rejectWithValue }) => {
    try {
      await projectService.deleteProject(projectId);
      return projectId;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete project';
      return rejectWithValue(message);
    }
  }
);
