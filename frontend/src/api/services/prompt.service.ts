import { API_BASE_URL } from '../endpoints'

export interface PromptCreate {
  name: string
  description: string
  content?: string
}

export interface PromptVersionCreate {
  content: string
  description: string
  status?: string
}

class PromptService {
  /**
   * Get prompts by project
   */
  async getPromptsByProject(projectId: string, page = 1, limit = 10) {
    const response = await fetch(
      `${API_BASE_URL}/prompts/project/${projectId}?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch prompts')
    }

    return response.json()
  }

  /**
   * Get prompt by ID
   */
  async getPromptById(promptId: string) {
    const response = await fetch(`${API_BASE_URL}/prompts/${promptId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch prompt')
    }

    return response.json()
  }

  /**
   * Create a new prompt
   * Note: projectId is passed separately, not in the payload
   */
  async createPrompt(projectId: string, data: PromptCreate) {
    const response = await fetch(`${API_BASE_URL}/prompts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        project_id: projectId,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create prompt')
    }

    return response.json()
  }

  /**
   * Create a new prompt version
   * Note: version_number is auto-generated from content
   */
  async createPromptVersion(promptId: string, data: PromptVersionCreate) {
    const response = await fetch(`${API_BASE_URL}/prompts/${promptId}/versions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create prompt version')
    }

    return response.json()
  }

  /**
   * Delete a prompt
   */
  async deletePrompt(promptId: string) {
    const response = await fetch(`${API_BASE_URL}/prompts/${promptId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to delete prompt')
    }

    return response.json()
  }

  /**
   * Improve a prompt using DeepSeek
   */
  async improvePrompt(promptText: string) {
    const response = await fetch(`${API_BASE_URL}/prompts/improve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt_text: promptText,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to improve prompt')
    }

    return response.json()
  }
}

export default new PromptService()
