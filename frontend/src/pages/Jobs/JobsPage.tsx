import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchJobsByProject, createJob } from '../../store/thunks'
import { useNavigate } from 'react-router-dom'
import styles from './Jobs.module.css'

const JobsPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  
  const { jobs, isLoading, error } = useAppSelector(state => state.job)
  const { selectedProject } = useAppSelector(state => state.project)
  
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [jobName, setJobName] = useState('')

  useEffect(() => {
    if (selectedProject?.id) {
      dispatch(fetchJobsByProject({ 
        projectId: selectedProject.id,
        page: 1,
        limit: 10
      }))
    }
  }, [selectedProject, dispatch])

  const handleCreateJob = async () => {
    if (!selectedProject || !jobName.trim()) {
      alert('Please enter a job name')
      return
    }

    try {
      await dispatch(createJob({
        project_id: selectedProject.id,
        name: jobName,
      })).unwrap()

      setJobName('')
      setShowCreateForm(false)
      
      dispatch(fetchJobsByProject({ 
        projectId: selectedProject.id,
        page: 1,
        limit: 10
      }))
    } catch (err) {
      alert(`Error creating job: ${String(err)}`)
    }
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

      {error && <div className={styles.error}>❌ Error: {error}</div>}
      {isLoading && !showCreateForm && <div className={styles.loading}>⏳ Loading jobs...</div>}
      {!isLoading && jobs.length === 0 && <div className={styles.empty}><p>No jobs yet. Create one to get started!</p></div>}

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
