import { RootState } from '../store'

export const selectMetrics = (state: RootState) => state.metrics.metrics

export const selectJobMetrics = (state: RootState) => state.metrics.jobMetrics

export const selectSelectedJobMetrics = (state: RootState) => state.metrics.selectedJobMetrics

export const selectProjectMetrics = (state: RootState) => state.metrics.projectMetrics

export const selectMetricsIsLoading = (state: RootState) => state.metrics.loading || state.metrics.isLoading

export const selectMetricsError = (state: RootState) => state.metrics.error

export const selectMetricsByJobId = (state: RootState, jobId: string) =>
  state.metrics.metrics.find((m: any) => m.job_id === jobId)
