export interface Project {
  id: string
  user_id: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateProjectPayload {
  name: string
  description?: string
}

export interface UpdateProjectPayload {
  id: string
  name?: string
  description?: string
  is_active?: boolean
}

export interface ProjectState {
  projects: Project[]
  selectedProject: Project | null
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
  }
}
