/**
 * App Initialization
 * Sets up required data structures on first load
 */

export const initializeApp = () => {
  // Initialize empty arrays if they don't exist
  if (!localStorage.getItem('projects')) {
    localStorage.setItem('projects', JSON.stringify([]))
  }

  if (!localStorage.getItem('evaluation_jobs')) {
    localStorage.setItem('evaluation_jobs', JSON.stringify([]))
  }

  if (!localStorage.getItem('evaluations')) {
    localStorage.setItem('evaluations', JSON.stringify([]))
  }

  if (!localStorage.getItem('llm_api_keys')) {
    localStorage.setItem('llm_api_keys', JSON.stringify({
      openai: '',
      deepseek: '',
      anthropic: ''
    }))
  }
}
