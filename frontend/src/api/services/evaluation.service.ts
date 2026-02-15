import { API_BASE_URL } from '../endpoints'

export interface EvaluationRowResult {
  question: string
  expected_answer: string
  model_a_response: string
  model_a_latency: number
  model_a_tokens: number
  model_a_cost: number
  model_a_accuracy: number
  model_b_response: string
  model_b_latency: number
  model_b_tokens: number
  model_b_cost: number
  model_b_accuracy: number
  winner: string
}

export interface EvaluationResultCreate {
  project_id: string
  prompt_version: string
  model_a: string
  model_b: string
  rows: EvaluationRowResult[]
}

class EvaluationService {
  /**
   * Store evaluation results
   */
  async storeEvaluationResults(data: EvaluationResultCreate) {
    const response = await fetch(`${API_BASE_URL}/evaluation-results/store`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to store evaluation results')
    }

    return response.json()
  }

  /**
   * Get evaluations by project
   */
  async getProjectEvaluations(projectId: string) {
    const response = await fetch(
      `${API_BASE_URL}/evaluation-results/project/${projectId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch evaluations')
    }

    return response.json()
  }
}

export default new EvaluationService()
