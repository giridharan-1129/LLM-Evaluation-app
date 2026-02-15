import { apiClient } from '../client'

export const datasetService = {
  /**
   * Upload Excel file for a project
   * POST /api/v1/datasets/upload?project_id=UUID
   */
  async uploadDataset(
    projectId: string,
    file: File,
    onProgress?: (progress: any) => void
  ) {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await apiClient.post(
      `/datasets/upload?project_id=${projectId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress,
      }
    )
    return data
  },

  /**
   * Get dataset by ID
   * GET /api/v1/datasets/{dataset_id}
   */
  async getDatasetById(datasetId: string) {
    const { data } = await apiClient.get(`/datasets/${datasetId}`)
    return data
  },

  /**
   * List all datasets for a project
   * GET /api/v1/datasets/project/{project_id}/list
   */
  async getDatasetsByProject(projectId: string) {
    const { data } = await apiClient.get(`/datasets/project/${projectId}/list`)
    return data
  },

  /**
   * Preview dataset rows
   * POST /api/v1/datasets/{dataset_id}/preview?rows=5
   */
  async previewDataset(datasetId: string, rows: number = 5) {
    const { data } = await apiClient.post(
      `/datasets/${datasetId}/preview?rows=${rows}`
    )
    return data
  },

  /**
   * Delete dataset
   * DELETE /api/v1/datasets/{dataset_id}
   */
  async deleteDataset(datasetId: string) {
    const { data } = await apiClient.delete(`/datasets/${datasetId}`)
    return data
  },
}
