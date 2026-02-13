import { createAsyncThunk } from '@reduxjs/toolkit';
import type { JobMetrics, ProjectMetricsAggregate } from '../types';
import { metricsService } from '../../api/services';

/**
 * Fetch metrics for a specific job
 */
export const fetchJobMetrics = createAsyncThunk(
  'metrics/fetchJobMetrics',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await metricsService.getJobMetrics(jobId);
      return response as JobMetrics;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch metrics';
      return rejectWithValue(message);
    }
  }
);

/**
 * Fetch aggregate metrics for a project
 */
export const fetchProjectMetrics = createAsyncThunk(
  'metrics/fetchProjectMetrics',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await metricsService.getProjectMetrics(projectId);
      return response as ProjectMetricsAggregate;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch project metrics';
      return rejectWithValue(message);
    }
  }
);

/**
 * Fetch all metrics for a list of jobs
 */
export const fetchMultipleJobMetrics = createAsyncThunk(
  'metrics/fetchMultiple',
  async (jobIds: string[], { rejectWithValue }) => {
    try {
      const promises = jobIds.map((id) => metricsService.getJobMetrics(id));
      const response = await Promise.all(promises);
      return response as JobMetrics[];
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch metrics';
      return rejectWithValue(message);
    }
  }
);
