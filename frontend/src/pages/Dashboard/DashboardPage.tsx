import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchProjects } from '../../store/thunks'
import styles from './Dashboard.module.css'

/**
 * Dashboard Page
 * Main landing page with quick actions and recent activity
 */
const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { user } = useAppSelector(state => state.auth)
  const { projects } = useAppSelector(state => state.project)
  const { jobs } = useAppSelector(state => state.job)

  useEffect(() => {
    dispatch(fetchProjects())
  }, [dispatch])

  const recentJobs = jobs.slice(0, 5)
  const completedJobs = jobs.filter(j => j.status === 'completed').length
  const runningJobs = jobs.filter(j => j.status === 'running').length

  return (
    <div className={styles.container}>
      {/* Welcome Section */}
      <div className={styles.welcome}>
        <div className={styles.welcomeContent}>
          <h1>Welcome back, {user?.name || 'User'}! 👋</h1>
          <p>Let's evaluate and compare your LLM outputs</p>
        </div>
        <div className={styles.welcomeStats}>
          <div className={styles.stat}>
            <span className={styles.statIcon}>📊</span>
            <div className={styles.statContent}>
              <p className={styles.statValue}>{projects.length}</p>
              <p className={styles.statLabel}>Projects</p>
            </div>
          </div>
          <div className={styles.stat}>
            <span className={styles.statIcon}>⚙️</span>
            <div className={styles.statContent}>
              <p className={styles.statValue}>{jobs.length}</p>
              <p className={styles.statLabel}>Total Jobs</p>
            </div>
          </div>
          <div className={styles.stat}>
            <span className={styles.statIcon}>✅</span>
            <div className={styles.statContent}>
              <p className={styles.statValue}>{completedJobs}</p>
              <p className={styles.statLabel}>Completed</p>
            </div>
          </div>
          <div className={styles.stat}>
            <span className={styles.statIcon}>⏳</span>
            <div className={styles.statContent}>
              <p className={styles.statValue}>{runningJobs}</p>
              <p className={styles.statLabel}>Running</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <section className={styles.section}>
        <h2>🚀 Quick Actions</h2>
        <div className={styles.actionsGrid}>
          <div className={styles.actionCard}>
            <div className={styles.actionIcon}>🎮</div>
            <h3>Prompt Playground</h3>
            <p>Test and compare prompts side-by-side</p>
            <button
              className={styles.actionBtn}
              onClick={() => navigate('/playground')}
            >
              Go to Playground →
            </button>
          </div>

          <div className={styles.actionCard}>
            <div className={styles.actionIcon}>📁</div>
            <h3>Create Project</h3>
            <p>Start a new evaluation project</p>
            <button
              className={styles.actionBtn}
              onClick={() => navigate('/projects')}
            >
              Create Project →
            </button>
          </div>

          <div className={styles.actionCard}>
            <div className={styles.actionIcon}>📤</div>
            <h3>Upload Dataset</h3>
            <p>Upload Excel file for evaluation</p>
            <button
              className={styles.actionBtn}
              onClick={() => navigate('/jobs')}
            >
              Upload Data →
            </button>
          </div>

          <div className={styles.actionCard}>
            <div className={styles.actionIcon}>📈</div>
            <h3>View Metrics</h3>
            <p>See evaluation results and analytics</p>
            <button
              className={styles.actionBtn}
              onClick={() => navigate('/metrics')}
            >
              View Metrics →
            </button>
          </div>
        </div>
      </section>

      {/* Recent Jobs */}
      {recentJobs.length > 0 && (
        <section className={styles.section}>
          <h2>⚡ Recent Jobs</h2>
          <div className={styles.jobsList}>
            {recentJobs.map(job => (
              <div
                key={job.id}
                className={`${styles.jobItem} ${styles[job.status]}`}
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <div className={styles.jobInfo}>
                  <h4>{job.name}</h4>
                  <p className={styles.jobMeta}>
                    {new Date(job.created_at).toLocaleDateString()} •{' '}
                    {job.total_entries} entries
                  </p>
                </div>
                <div className={styles.jobStatus}>
                  <span className={styles.badge}>{job.status}</span>
                  <span className={styles.progress}>{job.progress}%</span>
                </div>
              </div>
            ))}
          </div>
          <button className={styles.viewAllBtn} onClick={() => navigate('/jobs')}>
            View All Jobs →
          </button>
        </section>
      )}

      {/* Projects Overview */}
      {projects.length > 0 && (
        <section className={styles.section}>
          <h2>📁 Your Projects</h2>
          <div className={styles.projectsGrid}>
            {projects.slice(0, 3).map(project => (
              <div
                key={project.id}
                className={styles.projectCard}
                onClick={() => navigate(`/projects/${project.id}/prompts`)}
              >
                <div className={styles.projectHeader}>
                  <h4>{project.name}</h4>
                  <span className={styles.projectIcon}>📂</span>
                </div>
                <p className={styles.projectDesc}>{project.description}</p>
                <p className={styles.projectDate}>
                  Created {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
          {projects.length > 3 && (
            <button className={styles.viewAllBtn} onClick={() => navigate('/projects')}>
              View All Projects →
            </button>
          )}
        </section>
      )}

      {/* Get Started */}
      {projects.length === 0 && (
        <section className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎯</div>
          <h2>Get Started with LLM Evaluation</h2>
          <p>Create your first project to begin evaluating LLM outputs</p>
          <button className={styles.primaryBtn} onClick={() => navigate('/projects')}>
            Create Your First Project
          </button>
        </section>
      )}
    </div>
  )
}

export default DashboardPage
