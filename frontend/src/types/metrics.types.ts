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
}

export interface MetricsState {
  metrics: EvaluationMetrics[]
  loading: boolean
  error: string | null
}
