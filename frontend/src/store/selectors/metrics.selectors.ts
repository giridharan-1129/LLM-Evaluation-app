import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';

const selectMetricsState = (state: RootState) => state.metrics;

export const selectAllJobMetrics = createSelector(
  [selectMetricsState],
  (metrics) => metrics.jobMetrics
);

export const selectSelectedJobMetrics = createSelector(
  [selectMetricsState],
  (metrics) => metrics.selectedJobMetrics
);

export const selectProjectMetrics = createSelector(
  [selectMetricsState],
  (metrics) => metrics.projectMetrics
);

export const selectMetricsIsLoading = createSelector(
  [selectMetricsState],
  (metrics) => metrics.isLoading
);

export const selectMetricsError = createSelector([selectMetricsState], (metrics) => metrics.error);

export const selectMetricsByJobId = (jobId: string) =>
  createSelector([selectAllJobMetrics], (metrics) => metrics.find((m) => m.jobId === jobId));

export const selectTotalCost = createSelector(
  [selectSelectedJobMetrics],
  (metrics) => metrics?.cost.totalCost ?? 0
);

export const selectAccuracy = createSelector(
  [selectSelectedJobMetrics],
  (metrics) => metrics?.metrics.accuracy ?? 0
);

export const selectAverageLatency = createSelector(
  [selectSelectedJobMetrics],
  (metrics) => metrics?.performance.averageLatency ?? 0
);
