import { apiClient } from '../client';
import type { Project, CreateProjectPayload } from '../../store/types';

export const projectService = {
  async getProjects(page: number, limit: number): Promise<{ projects: Project[]; total: number }> {
    const { data } = await apiClient.get('/projects', { params: { page, limit } });
    return data;
  },

  async getProjectById(id: string): Promise<Project> {
    const { data } = await apiClient.get(`/projects/${id}`);
    return data;
  },

  async createProject(payload: CreateProjectPayload): Promise<Project> {
    const { data } = await apiClient.post('/projects', payload);
    return data;
  },

  async updateProject(id: string, payload: Partial<CreateProjectPayload>): Promise<Project> {
    const { data } = await apiClient.put(`/projects/${id}`, payload);
    return data;
  },

  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  },
};
