export interface Project {
  id: string
  name: string
  description: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  loading: boolean
  error: string | null
}

export interface CreateProjectRequest {
  name: string
  description: string
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
}
