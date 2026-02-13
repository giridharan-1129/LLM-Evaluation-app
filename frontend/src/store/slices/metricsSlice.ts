/**
 * Metrics Slice
 * Manages job metrics, cost tracking, and analytics
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { MetricsState, JobMetrics, ProjectMetricsAggregate } from '../types';

const initialState: MetricsState = {
  jobMetrics: [],
  selectedJobMetrics: null,
  projectMetrics: null,
  isLoading: false,
  error: null,
};

const metricsSlice = createSlice({
  name: 'metrics',
  initialState,
  reducers: {
    // Action: Start fetching metrics
    fetchMetricsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    // Action: Job metrics fetched
    fetchJobMetricsSuccess: (state, action: PayloadAction<JobMetrics>) => {
      state.isLoading = false;
      const existingIndex = state.jobMetrics.findIndex((m) => m.jobId === action.payload.jobId);
      if (existingIndex !== -1) {
        state.jobMetrics[existingIndex] = action.payload;
      } else {
        state.jobMetrics.push(action.payload);
      }
      state.selectedJobMetrics = action.payload;
      state.error = null;
    },

    // Action: Project metrics fetched
    fetchProjectMetricsSuccess: (state, action: PayloadAction<ProjectMetricsAggregate>) => {
      state.isLoading = false;
      state.projectMetrics = action.payload;
      state.error = null;
    },

    // Action: Fetch metrics failed
    fetchMetricsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Action: Select job metrics
    selectJobMetrics: (state, action: PayloadAction<JobMetrics>) => {
      state.selectedJobMetrics = action.payload;
    },

    // Action: Update metrics (real-time updates)
    updateJobMetrics: (state, action: PayloadAction<JobMetrics>) => {
      const index = state.jobMetrics.findIndex((m) => m.jobId === action.payload.jobId);
      if (index !== -1) {
        state.jobMetrics[index] = action.payload;
      }
      if (state.selectedJobMetrics?.jobId === action.payload.jobId) {
        state.selectedJobMetrics = action.payload;
      }
    },

    // Action: Clear metrics for a job
    clearJobMetrics: (state, action: PayloadAction<string>) => {
      state.jobMetrics = state.jobMetrics.filter((m) => m.jobId !== action.payload);
      if (state.selectedJobMetrics?.jobId === action.payload) {
        state.selectedJobMetrics = null;
      }
    },

    // Action: Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchMetricsStart,
  fetchJobMetricsSuccess,
  fetchProjectMetricsSuccess,
  fetchMetricsFailure,
  selectJobMetrics,
  updateJobMetrics,
  clearJobMetrics,
  clearError,
} = metricsSlice.actions;

export default metricsSlice.reducer;
