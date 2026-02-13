import { UUID } from 'crypto'

export interface EvaluationEntry {
  id: UUID
  job_id: UUID
  input: string
  expected_output: string
  actual_output: string
  score: number
  created_at: string
}

export interface EvaluationJob {
  id: UUID
  project_id: UUID
  name: string
  description?: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number
  total_entries: number
  completed_entries: number
  failed_entries: number
  created_at: string
  updated_at: string
}

export interface CreateJobPayload {
  project_id: UUID
  name: string
  description?: string
  entries: Array<{
    input: string
    expected_output: string
  }>
}

export interface UpdateJobProgressPayload {
  job_id: UUID
  progress: number
  completed_entries: number
}

export interface JobState {
  jobs: EvaluationJob[]
  selectedJob: EvaluationJob | null
  jobEntries: EvaluationEntry[]
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
  }
}
