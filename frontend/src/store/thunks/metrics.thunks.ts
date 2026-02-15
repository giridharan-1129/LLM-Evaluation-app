import { createAsyncThunk } from '@reduxjs/toolkit'
import { metricsService } from '../../api/services/metrics.service'

export const fetchJobMetrics = createAsyncThunk(
  'metrics/fetchJobMetrics',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await metricsService.getJobMetrics(jobId)
      return response
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch metrics'
      return rejectWithValue(message)
    }
  },
)

export const fetchProjectMetrics = createAsyncThunk(
  'metrics/fetchProjectMetrics',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await metricsService.getProjectMetrics(projectId)
      return response
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch project metrics'
      return rejectWithValue(message)
    }
  },
)

export const fetchMultipleJobMetrics = createAsyncThunk(
  'metrics/fetchMultipleJobMetrics',
  async (jobIds: string[], { rejectWithValue }) => {
    try {
      const response = await metricsService.getMultipleJobMetrics(jobIds)
      return response
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch metrics'
      return rejectWithValue(message)
    }
  },
)
