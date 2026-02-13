/**
 * Prompt State Types
 * Manages prompt templates and versioning
 */

export interface PromptVersion {
  id: string;
  version: number;
  systemPrompt: string;
  userPrompt: string;
  parameters: {
    temperature: number;
    maxTokens: number;
    topP?: number;
  };
  createdAt: string;
  createdBy: string;
  description?: string;
  isActive: boolean;
}

export interface Prompt {
  id: string;
  projectId: string;
  name: string;
  description: string;
  versions: PromptVersion[];
  currentVersionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromptState {
  prompts: Prompt[];
  selectedPrompt: Prompt | null;
  selectedVersion: PromptVersion | null;
  isLoading: boolean;
  error: string | null;
}

export interface CreatePromptPayload {
  projectId: string;
  name: string;
  description: string;
  systemPrompt: string;
  userPrompt: string;
  parameters: {
    temperature: number;
    maxTokens: number;
  };
}

export interface CreateVersionPayload {
  promptId: string;
  systemPrompt: string;
  userPrompt: string;
  parameters: {
    temperature: number;
    maxTokens: number;
  };
  description?: string;
}
