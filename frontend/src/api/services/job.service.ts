import { apiClient } from '../client';
import type { EvaluationJob, EvaluationEntry, CreateJobPayload } from '../../store/types';

export const jobService = {
  async getJobsByProject(
    projectId: string,
    page: number,
    limit: number
  ): Promise<{ jobs: EvaluationJob[]; total: number }> {
    const { data } = await apiClient.get(`/projects/${projectId}/jobs`, {
      params: { page, limit },
    });
    return data;
  },

  async getJob(id: string): Promise<EvaluationJob> {
    const { data } = await apiClient.get(`/jobs/${id}`);
    return data;
  },

  async createJob(payload: CreateJobPayload): Promise<EvaluationJob> {
    const { data } = await apiClient.post('/jobs', payload);
    return data;
  },

  async getJobEntries(jobId: string, page: number, limit: number): Promise<EvaluationEntry[]> {
    const { data } = await apiClient.get(`/jobs/${jobId}/entries`, {
      params: { page, limit },
    });
    return data;
  },

  async cancelJob(id: string): Promise<EvaluationJob> {
    const { data } = await apiClient.post(`/jobs/${id}/cancel`);
    return data;
  },
};
