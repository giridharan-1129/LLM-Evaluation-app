/**
 * Job Slice
 * Manages evaluation jobs, progress tracking, and job entries
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { JobState, EvaluationJob, EvaluationEntry, UpdateJobProgressPayload } from '../types';

const initialState: JobState = {
  jobs: [],
  selectedJob: null,
  jobEntries: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const jobSlice = createSlice({
  name: 'job',
  initialState,
  reducers: {
    // Action: Start fetching jobs
    fetchJobsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    // Action: Jobs fetched successfully
    fetchJobsSuccess: (state, action: PayloadAction<{ jobs: EvaluationJob[]; total: number }>) => {
      state.isLoading = false;
      state.jobs = action.payload.jobs;
      state.pagination.total = action.payload.total;
      state.error = null;
    },

    // Action: Fetch jobs failed
    fetchJobsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Action: Create job
    createJobSuccess: (state, action: PayloadAction<EvaluationJob>) => {
      state.jobs.unshift(action.payload);
      state.pagination.total += 1;
      state.selectedJob = action.payload;
    },

    // Action: Select a job
    selectJob: (state, action: PayloadAction<EvaluationJob>) => {
      state.selectedJob = action.payload;
    },

    // Action: Update job progress
    updateJobProgress: (state, action: PayloadAction<UpdateJobProgressPayload>) => {
      const job = state.jobs.find((j) => j.id === action.payload.jobId);
      if (job) {
        job.processedEntries = action.payload.processedEntries;
        job.progress = Math.round(
          (action.payload.processedEntries / action.payload.totalEntries) * 100
        );
      }
    },

    // Action: Job completed
    jobCompleted: (state, action: PayloadAction<EvaluationJob>) => {
      const index = state.jobs.findIndex((j) => j.id === action.payload.id);
      if (index !== -1) {
        state.jobs[index] = action.payload;
      }
      if (state.selectedJob?.id === action.payload.id) {
        state.selectedJob = action.payload;
      }
    },

    // Action: Job failed
    jobFailed: (state, action: PayloadAction<{ jobId: string; error: string }>) => {
      const job = state.jobs.find((j) => j.id === action.payload.jobId);
      if (job) {
        job.status = 'failed';
      }
      state.error = action.payload.error;
    },

    // Action: Fetch job entries
    fetchJobEntriesSuccess: (state, action: PayloadAction<EvaluationEntry[]>) => {
      state.jobEntries = action.payload;
    },

    // Action: Add job entry
    addJobEntry: (state, action: PayloadAction<EvaluationEntry>) => {
      state.jobEntries.push(action.payload);
    },

    // Action: Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchJobsStart,
  fetchJobsSuccess,
  fetchJobsFailure,
  createJobSuccess,
  selectJob,
  updateJobProgress,
  jobCompleted,
  jobFailed,
  fetchJobEntriesSuccess,
  addJobEntry,
  clearError,
} = jobSlice.actions;

export default jobSlice.reducer;
