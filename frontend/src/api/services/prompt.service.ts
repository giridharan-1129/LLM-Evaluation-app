import { apiClient } from '../client';
import type {
  Prompt,
  PromptVersion,
  CreatePromptPayload,
  CreateVersionPayload,
} from '../../store/types';

export const promptService = {
  async getPromptsByProject(projectId: string): Promise<Prompt[]> {
    const { data } = await apiClient.get(`/projects/${projectId}/prompts`);
    return data;
  },

  async getPrompt(id: string): Promise<Prompt> {
    const { data } = await apiClient.get(`/prompts/${id}`);
    return data;
  },

  async createPrompt(payload: CreatePromptPayload): Promise<Prompt> {
    const { data } = await apiClient.post('/prompts', payload);
    return data;
  },

  async createVersion(payload: CreateVersionPayload): Promise<PromptVersion> {
    const { data } = await apiClient.post(`/prompts/${payload.promptId}/versions`, payload);
    return data;
  },

  async deletePrompt(id: string): Promise<void> {
    await apiClient.delete(`/prompts/${id}`);
  },
};
