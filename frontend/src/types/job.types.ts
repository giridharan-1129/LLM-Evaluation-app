export interface Job {
  id: string
  name: string
  project_id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  total_entries: number
  completed_entries: number
  created_at: string
  updated_at: string
}

export interface JobState {
  jobs: Job[]
  currentJob: Job | null
  loading: boolean
  error: string | null
}
