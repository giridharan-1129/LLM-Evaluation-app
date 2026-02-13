import { createAsyncThunk } from '@reduxjs/toolkit';
import type { EvaluationJob, EvaluationEntry, CreateJobPayload } from '../types';
import { jobService } from '../../api/services';

/**
 * Fetch jobs by project ID
 */
export const fetchJobsByProject = createAsyncThunk(
  'job/fetchByProject',
  async (params: { projectId: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await jobService.getJobsByProject(
        params.projectId,
        params.page || 1,
        params.limit || 10
      );
      return response as { jobs: EvaluationJob[]; total: number };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch jobs';
      return rejectWithValue(message);
    }
  }
);

/**
 * Get single job
 */
export const fetchJob = createAsyncThunk(
  'job/fetchJob',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await jobService.getJob(jobId);
      return response as EvaluationJob;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch job';
      return rejectWithValue(message);
    }
  }
);

/**
 * Create new evaluation job
 */
export const createJob = createAsyncThunk(
  'job/createJob',
  async (payload: CreateJobPayload, { rejectWithValue }) => {
    try {
      const response = await jobService.createJob(payload);
      return response as EvaluationJob;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create job';
      return rejectWithValue(message);
    }
  }
);

/**
 * Fetch job entries (results)
 */
export const fetchJobEntries = createAsyncThunk(
  'job/fetchEntries',
  async (params: { jobId: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await jobService.getJobEntries(
        params.jobId,
        params.page || 1,
        params.limit || 50
      );
      return response as EvaluationEntry[];
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch job entries';
      return rejectWithValue(message);
    }
  }
);

/**
 * Cancel job
 */
export const cancelJob = createAsyncThunk(
  'job/cancelJob',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await jobService.cancelJob(jobId);
      return response as EvaluationJob;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cancel job';
      return rejectWithValue(message);
    }
  }
);
