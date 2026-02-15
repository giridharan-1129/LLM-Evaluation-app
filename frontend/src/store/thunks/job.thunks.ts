import { createAsyncThunk } from '@reduxjs/toolkit'
import type { CreateJobPayload } from '../types'
import { jobService } from '../../api/services/job.service'

export const fetchJobsByProject = createAsyncThunk(
  'job/fetchByProject',
  async (
    { projectId, page = 1, limit = 10 }: { projectId: string; page?: number; limit?: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await jobService.getJobsByProject(projectId, page, limit)
      return response
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch jobs'
      return rejectWithValue(message)
    }
  },
)

export const fetchJobById = createAsyncThunk(
  'job/fetchById',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await jobService.getJobById(jobId)
      return response
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch job'
      return rejectWithValue(message)
    }
  },
)

export const createJob = createAsyncThunk(
  'job/create',
  async (payload: CreateJobPayload, { rejectWithValue }) => {
    try {
      const response = await jobService.createJob(payload)
      return response
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create job'
      return rejectWithValue(message)
    }
  },
)

export const cancelJob = createAsyncThunk(
  'job/cancel',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await jobService.cancelJob(jobId)
      return response
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cancel job'
      return rejectWithValue(message)
    }
  },
)
