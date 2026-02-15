import React, { useEffect, useState } from 'react'
import styles from './Jobs.module.css'

interface Job {
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

const JobsPage: React.FC = () => {
  const [localJobs, setLocalJobs] = useState<Job[]>([])
  const [filterStatus, setFilterStatus] = useState<'all' | 'running' | 'completed' | 'failed'>('all')

  // Load jobs from localStorage
  useEffect(() => {
    const savedJobs = localStorage.getItem('evaluation_jobs')
    if (savedJobs) {
      try {
        setLocalJobs(JSON.parse(savedJobs))
      } catch (e) {
        console.log('Error loading jobs')
      }
    }
  }, [])

  const filteredJobs = filterStatus === 'all' 
    ? localJobs 
    : localJobs.filter(j => j.status === filterStatus)

  const runningJobs = localJobs.filter(j => j.status === 'running')
  const completedJobs = localJobs.filter(j => j.status === 'completed')
  const failedJobs = localJobs.filter(j => j.status === 'failed')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return '#ffc107'
      case 'completed':
        return '#28a745'
      case 'failed':
        return '#dc3545'
      default:
        return '#6c757d'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return '⏳'
      case 'completed':
        return '✅'
      case 'failed':
        return '❌'
      default:
        return '📋'
    }
  }

  const formatDuration = (startDate: string | undefined, endDate: string | undefined) => {
    if (!startDate) return 'Not started'
    const start = new Date(startDate).getTime()
    const end = endDate ? new Date(endDate).getTime() : Date.now()
    const duration = Math.round((end - start) / 1000)
    
    if (duration < 60) return `${duration}s`
    if (duration < 3600) return `${Math.round(duration / 60)}m`
    return `${Math.round(duration / 3600)}h`
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📊 Running Jobs</h1>
        <p>Monitor your active evaluations</p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⏳</div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Running</p>
            <p className={styles.statValue}>{runningJobs.length}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Completed</p>
            <p className={styles.statValue}>{completedJobs.length}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>❌</div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Failed</p>
            <p className={styles.statValue}>{failedJobs.length}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>📋</div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Jobs</p>
            <p className={styles.statValue}>{localJobs.length}</p>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className={styles.filterButtons}>
        {['all', 'running', 'completed', 'failed'].map(status => (
          <button
            key={status}
            className={`${styles.filterBtn} ${filterStatus === status ? styles.active : ''}`}
            onClick={() => setFilterStatus(status as any)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className={styles.count}>
              {status === 'all' ? localJobs.length : localJobs.filter(j => j.status === status).length}
            </span>
          </button>
        ))}
      </div>

      {/* Jobs List */}
      <div className={styles.jobsList}>
        {filteredJobs.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No {filterStatus === 'all' ? 'jobs' : `${filterStatus} jobs`} found</p>
          </div>
        ) : (
          filteredJobs.map(job => (
            <div key={job.id} className={styles.jobCard}>
              <div className={styles.jobHeader}>
                <div className={styles.jobTitle}>
                  <span className={styles.statusIcon} style={{ color: getStatusColor(job.status) }}>
                    {getStatusIcon(job.status)}
                  </span>
                  <div className={styles.jobInfo}>
                    <h3>{job.name}</h3>
                    <p className={styles.jobMeta}>
                      {job.project_name} • {new Date(job.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span 
                  className={styles.statusBadge}
                  style={{ 
                    backgroundColor: getStatusColor(job.status),
                    color: 'white'
                  }}
                >
                  {job.status.toUpperCase()}
                </span>
              </div>

              <div className={styles.jobMetrics}>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Progress</span>
                  <span className={styles.metricValue}>{job.progress}%</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Entries</span>
                  <span className={styles.metricValue}>{job.completed_entries}/{job.total_entries}</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Duration</span>
                  <span className={styles.metricValue}>{formatDuration(job.started_at, job.completed_at)}</span>
                </div>
              </div>

              {job.status === 'running' && (
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${job.progress}%` }}></div>
                </div>
              )}

              {job.status === 'completed' && (
                <div className={styles.completedMessage}>
                  ✅ Evaluation completed successfully
                </div>
              )}

              {job.status === 'failed' && (
                <div className={styles.failedMessage}>
                  ❌ Evaluation failed. Check logs for details.
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default JobsPage
