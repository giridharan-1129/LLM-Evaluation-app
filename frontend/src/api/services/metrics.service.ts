import { apiClient } from '../client'

export const metricsService = {
  async getJobMetrics(jobId: string) {
    const { data } = await apiClient.get(`/metrics/job/${jobId}`)
    return data
  },

  async getProjectMetrics(projectId: string) {
    const { data } = await apiClient.get(`/metrics/project/${projectId}`)
    return data
  },

  async getMultipleJobMetrics(jobIds: string[]) {
    const { data } = await apiClient.post('/metrics/jobs', { job_ids: jobIds })
    return data
  },
}
