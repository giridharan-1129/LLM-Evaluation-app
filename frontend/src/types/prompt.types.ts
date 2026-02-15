export interface PromptVersion {
  id: string
  project_id: string
  version: string
  system_prompt: string
  user_prompt: string
  created_at: string
  updated_at: string
}

export interface PromptState {
  versions: PromptVersion[]
  currentVersion: PromptVersion | null
  loading: boolean
  error: string | null
}
