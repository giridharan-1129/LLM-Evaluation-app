import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../store'

const selectMetricsState = (state: RootState) => state.metrics

export const selectAllJobMetrics = createSelector(
  [selectMetricsState],
  (metrics) => metrics.jobMetrics,
)

export const selectSelectedJobMetrics = createSelector(
  [selectMetricsState],
  (metrics) => metrics.selectedJobMetrics,
)

export const selectProjectMetrics = createSelector(
  [selectMetricsState],
  (metrics) => metrics.projectMetrics,
)

export const selectMetricsIsLoading = createSelector(
  [selectMetricsState],
  (metrics) => metrics.isLoading,
)

export const selectMetricsError = createSelector([selectMetricsState], (metrics) => metrics.error)

export const selectJobMetricsById = (jobId: string) =>
  createSelector([selectAllJobMetrics], (metrics) =>
    metrics.find((m) => m.job_id === jobId),
  )

export const selectJobMetricsCost = (jobId: string) =>
  createSelector([selectJobMetricsById(jobId)], (metrics) => metrics?.total_cost ?? 0)

export const selectJobMetricsAccuracy = (jobId: string) =>
  createSelector([selectJobMetricsById(jobId)], (metrics) => metrics?.accuracy ?? 0)

export const selectJobMetricsLatency = (jobId: string) =>
  createSelector([selectJobMetricsById(jobId)], (metrics) => metrics?.avg_latency_ms ?? 0)
