import { apiClient } from '../client'
import type { PromptCreate, PromptVersionCreate } from '../../store/types'

export const promptService = {
  async getPromptsByProject(projectId: string, page: number = 1, limit: number = 10) {
    const { data } = await apiClient.get(`/prompts/project/${projectId}`, {
      params: { page, limit },
    })
    return data
  },

  async getPromptById(promptId: string) {
    const { data } = await apiClient.get(`/prompts/${promptId}`)
    return data
  },

  async createPrompt(projectId: string, payload: PromptCreate) {
    const { data } = await apiClient.post('/prompts/', {
      project_id: projectId,
      ...payload,
    })
    return data
  },

  async updatePrompt(promptId: string, payload: any) {
    const { data } = await apiClient.put(`/prompts/${promptId}`, payload)
    return data
  },

  async deletePrompt(promptId: string) {
    const { data } = await apiClient.delete(`/prompts/${promptId}`)
    return data
  },

  async createPromptVersion(promptId: string, payload: PromptVersionCreate) {
    const { data } = await apiClient.post(`/prompts/${promptId}/versions`, payload)
    return data
  },

  async getPromptVersions(promptId: string) {
    const { data } = await apiClient.get(`/prompts/${promptId}/versions`)
    return data
  },
}
