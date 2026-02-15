export interface EvaluationMetrics {
  id: string
  evaluation_id: string
  accuracy: number
  precision: number
  recall: number
  f1_score: number
  latency: number
  tokens_used: number
  cost: number
  job_id?: string
}

export interface MetricsState {
  metrics: EvaluationMetrics[]
  jobMetrics: EvaluationMetrics[]
  selectedJobMetrics: EvaluationMetrics[]
  projectMetrics: EvaluationMetrics[]
  loading: boolean
  isLoading: boolean
  error: string | null
}
