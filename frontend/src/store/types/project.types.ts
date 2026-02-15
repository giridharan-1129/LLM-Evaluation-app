export interface Project {
  id: string
  name: string
  description: string
  user_id: string
  created_at: string
  updated_at: string
  is_active?: boolean
}

export interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  selectedProject: Project | null
  loading: boolean
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
  }
}

export interface CreateProjectRequest {
  name: string
  description: string
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
}

export interface CreateProjectPayload {
  name: string
  description: string
}
