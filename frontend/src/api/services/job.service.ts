import { apiClient } from '../client'
import type { CreateJobPayload } from '../../store/types'

export const jobService = {
  async getJobsByProject(projectId: string, page: number = 1, limit: number = 10) {
    const { data } = await apiClient.get(`/jobs/project/${projectId}`, {
      params: { page, limit },
    })
    return data
  },

  async getJobById(jobId: string) {
    const { data } = await apiClient.get(`/jobs/${jobId}`)
    return data
  },

  async createJob(payload: CreateJobPayload) {
    const { data } = await apiClient.post('/jobs', payload)
    return data
  },

  async cancelJob(jobId: string) {
    const { data } = await apiClient.post(`/jobs/${jobId}/cancel`)
    return data
  },

  async getJobEntries(jobId: string) {
    const { data } = await apiClient.get(`/jobs/${jobId}/entries`)
    return data
  },
}
