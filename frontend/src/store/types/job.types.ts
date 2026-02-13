export interface JobEntry {
  id: string
  job_id: string
  input: string
  expected_output: string
  actual_output?: string
  score?: number
  created_at: string
}

export interface EvaluationJob {
  id: string
  project_id: string
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
  project_id: string
  name: string
  description?: string
  entries: Array<{
    input: string
    expected_output: string
  }>
}

export interface UpdateJobProgressPayload {
  job_id: string
  progress: number
  completed_entries: number
}

export interface JobState {
  jobs: EvaluationJob[]
  selectedJob: EvaluationJob | null
  jobEntries: JobEntry[]
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
  }
}
