export interface PromptCreate {
  name: string
  description: string
  content?: string
}

export interface PromptUpdate {
  name?: string
  description?: string
}

export interface PromptVersionCreate {
  content: string
  description: string
  status?: string
}

export interface PromptResponse {
  id: string
  project_id: string
  name: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Prompt extends PromptResponse {
  versions: PromptVersion[]
}

export interface PromptVersion {
  id: string
  prompt_id: string
  version_number: string
  content: string
  description: string
  status: string
  created_at: string
  updated_at: string
}

export interface PromptState {
  prompts: Prompt[]
  currentPrompt: Prompt | null
  selectedPrompt: Prompt | null
  selectedVersion: PromptVersion | null
  loading: boolean
  isLoading?: boolean
  error: string | null
  pagination?: {
    page: number
    limit: number
    total: number
  }
}
