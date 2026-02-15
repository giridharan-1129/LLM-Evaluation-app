/**
 * Evaluation Manager
 * Manages evaluation data in localStorage
 */

export interface EvaluationData {
  id: string
  project_id: string
  project_name: string
  prompt_version: string
  created_at: string
  total_rows: number
  avg_accuracy: number
  total_cost: number
}

export interface JobData {
  id: string
  name: string
  project_id: string
  project_name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  total_entries: number
  completed_entries: number
  created_at: string
  started_at?: string
  completed_at?: string
}

/**
 * Save evaluation results
 */
export const saveEvaluation = (evaluation: EvaluationData) => {
  try {
    const evaluations = getEvaluations()
    evaluations.push(evaluation)
    localStorage.setItem('evaluations', JSON.stringify(evaluations))
    return true
  } catch (e) {
    console.error('Error saving evaluation:', e)
    return false
  }
}

/**
 * Get all evaluations
 */
export const getEvaluations = (): EvaluationData[] => {
  try {
    const evaluations = localStorage.getItem('evaluations')
    return evaluations ? JSON.parse(evaluations) : []
  } catch (e) {
    console.error('Error getting evaluations:', e)
    return []
  }
}

/**
 * Save job
 */
export const saveJob = (job: JobData) => {
  try {
    const jobs = getJobs()
    const existingIndex = jobs.findIndex(j => j.id === job.id)
    
    if (existingIndex >= 0) {
      jobs[existingIndex] = job
    } else {
      jobs.push(job)
    }
    
    localStorage.setItem('evaluation_jobs', JSON.stringify(jobs))
    return true
  } catch (e) {
    console.error('Error saving job:', e)
    return false
  }
}

/**
 * Get all jobs
 */
export const getJobs = (): JobData[] => {
  try {
    const jobs = localStorage.getItem('evaluation_jobs')
    return jobs ? JSON.parse(jobs) : []
  } catch (e) {
    console.error('Error getting jobs:', e)
    return []
  }
}

/**
 * Get job by ID
 */
export const getJobById = (id: string): JobData | null => {
  const jobs = getJobs()
  return jobs.find(j => j.id === id) || null
}

/**
 * Update job progress
 */
export const updateJobProgress = (jobId: string, progress: number, completedEntries: number) => {
  try {
    const jobs = getJobs()
    const job = jobs.find(j => j.id === jobId)
    
    if (job) {
      job.progress = progress
      job.completed_entries = completedEntries
      job.started_at = job.started_at || new Date().toISOString()
      
      if (progress === 100) {
        job.status = 'completed'
        job.completed_at = new Date().toISOString()
      }
      
      saveJob(job)
      return true
    }
    
    return false
  } catch (e) {
    console.error('Error updating job progress:', e)
    return false
  }
}

/**
 * Delete job
 */
export const deleteJob = (jobId: string) => {
  try {
    const jobs = getJobs()
    const filtered = jobs.filter(j => j.id !== jobId)
    localStorage.setItem('evaluation_jobs', JSON.stringify(filtered))
    return true
  } catch (e) {
    console.error('Error deleting job:', e)
    return false
  }
}

/**
 * Get evaluations by project
 */
export const getEvaluationsByProject = (projectId: string): EvaluationData[] => {
  const evaluations = getEvaluations()
  return evaluations.filter(e => e.project_id === projectId)
}

/**
 * Get evaluations by prompt version
 */
export const getEvaluationsByVersion = (version: string): EvaluationData[] => {
  const evaluations = getEvaluations()
  return evaluations.filter(e => e.prompt_version === version)
}
