export interface Job {
  id: string
  name: string
  project_id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  total_entries: number
  completed_entries: number
  failed_entries?: number
  created_at: string
  updated_at: string
}

export interface JobEntry {
  id: string
  job_id: string
  row_number: number
  input_text: string
  expected_output: string
  output: string
  latency: number
  tokens: number
  cost: number
  accuracy: number
}

export interface JobState {
  jobs: Job[]
  currentJob: Job | null
  selectedJob: Job | null
  jobEntries: JobEntry[]
  loading: boolean
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
  }
}

export interface CreateJobPayload {
  name: string
  project_id: string
  total_entries: number
}
