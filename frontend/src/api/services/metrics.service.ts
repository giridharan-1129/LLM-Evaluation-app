import { apiClient } from '../client';
import type { JobMetrics, ProjectMetricsAggregate } from '../../store/types';

export const metricsService = {
  async getJobMetrics(jobId: string): Promise<JobMetrics> {
    const { data } = await apiClient.get(`/jobs/${jobId}/metrics`);
    return data;
  },

  async getProjectMetrics(projectId: string): Promise<ProjectMetricsAggregate> {
    const { data } = await apiClient.get(`/projects/${projectId}/metrics`);
    return data;
  },
};
