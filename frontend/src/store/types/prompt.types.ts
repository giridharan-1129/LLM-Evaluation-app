export interface PromptVersion {
  id: string
  prompt_id: string
  version_number: number
  content: string
  description?: string
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
}

export interface Prompt {
  id: string
  project_id: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
  versions?: PromptVersion[]
}

export interface PromptCreate {
  name: string
  description?: string
  content: string
}

export interface PromptVersionCreate {
  content: string
  description?: string
  status?: string
}

export interface PromptUpdate {
  name?: string
  description?: string
  is_active?: boolean
}

export interface PromptState {
  prompts: Prompt[]
  selectedPrompt: Prompt | null
  selectedVersion: PromptVersion | null
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
  }
}
