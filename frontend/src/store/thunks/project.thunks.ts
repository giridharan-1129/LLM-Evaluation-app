import { createAsyncThunk } from '@reduxjs/toolkit'
import type { CreateProjectPayload, Project } from '../types'
import { projectService } from '../../api/services'

interface FetchProjectsParams {
  page?: number
  limit?: number
}

/**
 * Fetch Projects Thunk
 */
export const fetchProjects = createAsyncThunk(
  'project/fetchProjects',
  async (params: FetchProjectsParams | undefined, { rejectWithValue }) => {
    try {
      const page = params?.page || 1
      const limit = params?.limit || 10
      const response = await projectService.getProjects(page, limit)
      return response
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch projects'
      return rejectWithValue(message)
    }
  },
)

/**
 * Fetch Project By ID Thunk
 */
export const fetchProjectById = createAsyncThunk(
  'project/fetchProjectById',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await projectService.getProjectById(projectId)
      return response as Project
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch project'
      return rejectWithValue(message)
    }
  },
)

/**
 * Create Project Thunk
 */
export const createProject = createAsyncThunk(
  'project/createProject',
  async (payload: CreateProjectPayload, { rejectWithValue }) => {
    try {
      const response = await projectService.createProject(payload)
      return response as Project
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create project'
      return rejectWithValue(message)
    }
  },
)

/**
 * Update Project Thunk
 */
export const updateProject = createAsyncThunk(
  'project/updateProject',
  async (
    { projectId, payload }: { projectId: string; payload: Partial<CreateProjectPayload> },
    { rejectWithValue },
  ) => {
    try {
      const response = await projectService.updateProject(projectId, payload)
      return response as Project
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update project'
      return rejectWithValue(message)
    }
  },
)

/**
 * Delete Project Thunk
 */
export const deleteProject = createAsyncThunk(
  'project/deleteProject',
  async (projectId: string, { rejectWithValue }) => {
    try {
      await projectService.deleteProject(projectId)
      return projectId
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete project'
      return rejectWithValue(message)
    }
  },
)
