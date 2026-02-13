import React, { useEffect } from 'react'
import { useAuth, useProject, useJob, useMetrics, useAppDispatch } from '../../store'
import { fetchProjects } from '../../store/thunks'
import { useNavigate } from 'react-router-dom'
import styles from './Dashboard.module.css'

/**
 * Dashboard Page Component
 * Main landing page showing overview and recent activity
 */
const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { projects } = useProject()
  const { jobs } = useJob()
  const { projectMetrics } = useMetrics()

  useEffect(() => {
    dispatch(fetchProjects(undefined))
  }, [dispatch])

  const recentJobs = jobs.slice(0, 5)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Welcome back, {user?.name}! 👋</h1>
        <p>Here's what's happening with your evaluation platform.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>TOTAL PROJECTS</h3>
          <p className={styles.statValue}>{projects.length}</p>
        </div>

        <div className={styles.statCard}>
          <h3>COMPLETED JOBS</h3>
          <p className={styles.statValue}>{jobs.filter((j) => j.status === 'completed').length}</p>
        </div>

        <div className={styles.statCard}>
          <h3>AVG ACCURACY</h3>
          <p className={styles.statValue}>{projectMetrics?.avg_accuracy.toFixed(1) || 0}%</p>
        </div>
      </div>

      <div className={styles.recentSection}>
        <h2>Recent Jobs</h2>
        {recentJobs.length === 0 ? (
          <p className={styles.emptyState}>No jobs yet. Create one to get started!</p>
        ) : (
          <table className={styles.jobsTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.map((job) => (
                <tr key={job.id} onClick={() => navigate(`/jobs/${job.id}`)}>
                  <td>{job.name}</td>
                  <td>
                    <span className={`${styles.status} ${styles[job.status]}`}>
                      {job.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progress}
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </td>
                  <td>{new Date(job.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
