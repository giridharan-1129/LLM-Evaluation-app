import { apiClient } from '../client'
import type { CreateProjectPayload } from '../../store/types'

export const projectService = {
  async getProjects(page: number = 1, limit: number = 10) {
    const { data } = await apiClient.get('/projects', {
      params: { page, limit },
    })
    return data
  },

  async getProjectById(projectId: string) {
    const { data } = await apiClient.get(`/projects/${projectId}`)
    return data
  },

  async createProject(payload: CreateProjectPayload) {
    const { data } = await apiClient.post('/projects', payload)
    return data
  },

  async updateProject(projectId: string, payload: Partial<CreateProjectPayload>) {
    const { data } = await apiClient.put(`/projects/${projectId}`, payload)
    return data
  },

  async deleteProject(projectId: string) {
    const { data } = await apiClient.delete(`/projects/${projectId}`)
    return data
  },
}
