export interface JobMetrics {
  id: string
  job_id: string
  total_entries: number
  completed_entries: number
  failed_entries: number
  accuracy: number
  precision: number
  recall: number
  f1_score: number
  avg_latency_ms: number
  total_cost: number
  created_at: string
}

export interface ProjectMetricsAggregate {
  project_id: string
  total_jobs: number
  completed_jobs: number
  total_entries_evaluated: number
  avg_accuracy: number
  total_cost: number
  created_at: string
}

export interface MetricsState {
  jobMetrics: JobMetrics[]
  selectedJobMetrics: JobMetrics | null
  projectMetrics: ProjectMetricsAggregate | null
  isLoading: boolean
  error: string | null
}
