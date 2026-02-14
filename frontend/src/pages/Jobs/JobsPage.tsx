import React, { useState } from 'react'
import { useAppSelector } from '../../store/hooks'
import { useNavigate } from 'react-router-dom'
import styles from './Jobs.module.css'

/**
 * Jobs Page Component
 * Displays list of all evaluation jobs for the current project
 */
const JobsPage: React.FC = () => {
  const navigate = useNavigate()
  
  const { jobs, isLoading, error } = useAppSelector(state => state.job)
  const { selectedProject } = useAppSelector(state => state.project)
  
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [jobName, setJobName] = useState('')

  const handleCreateJob = async () => {
    if (!selectedProject || !jobName.trim()) {
      alert('Please enter a job name')
      return
    }

    setJobName('')
    setShowCreateForm(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📊 Evaluation Jobs</h1>
        <button 
          className={styles.createBtn}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? '✖️ Cancel' : '➕ New Job'}
        </button>
      </div>

      {showCreateForm && (
        <div className={styles.createForm}>
          <input
            type="text"
            placeholder="Enter job name"
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
            className={styles.input}
          />
          <button 
            className={styles.submitBtn}
            onClick={handleCreateJob}
            disabled={isLoading}
          >
            {isLoading ? '⏳ Creating...' : '✓ Create Job'}
          </button>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          ❌ Error: {error}
        </div>
      )}

      {isLoading && !showCreateForm && (
        <div className={styles.loading}>⏳ Loading jobs...</div>
      )}

      {!isLoading && jobs.length === 0 && (
        <div className={styles.empty}>
          <p>No jobs yet. Create one to get started!</p>
        </div>
      )}

      <div className={styles.jobsList}>
        {jobs.map((job) => (
          <div 
            key={job.id} 
            className={`${styles.jobCard} ${styles[job.status]}`}
            onClick={() => navigate(`/jobs/${job.id}`)}
          >
            <div className={styles.jobHeader}>
              <h3>{job.name}</h3>
              <span className={styles.status}>{job.status?.toUpperCase()}</span>
            </div>
            
            <div className={styles.jobDetails}>
              <p><strong>Status:</strong> {job.status}</p>
              <p><strong>Created:</strong> {new Date(job.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default JobsPage
