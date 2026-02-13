/**
 * Project State Types
 * Manages LLM evaluation projects
 */

export interface Project {
  id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface CreateProjectPayload {
  name: string;
  description: string;
}

export interface UpdateProjectPayload {
  id: string;
  name?: string;
  description?: string;
}

export interface DeleteProjectPayload {
  id: string;
}
