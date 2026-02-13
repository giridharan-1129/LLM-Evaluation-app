import React, { useEffect } from 'react';
import { useAppDispatch } from '../../store';
import { useAuth, useProject, useJob, useMetrics } from '../../store';
import styles from './Dashboard.module.css';

/**
 * Dashboard Page Component
 * Shows overview of projects, recent jobs, and key metrics
 */
const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { projects } = useProject();
  const { jobs } = useJob();
  const { projectMetrics } = useMetrics();

  useEffect(() => {
    // TODO: Fetch projects on mount
  }, [dispatch]);

  const recentJobs = jobs.slice(0, 5);
  const totalProjects = projects.length;
  const completedJobs = jobs.filter((j) => j.status === 'completed').length;

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Welcome back, {user?.name}! 👋</h1>
        <p>Here&apos;s what&apos;s happening with your evaluation platform.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Projects</h3>
          <p className={styles.statValue}>{totalProjects}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Completed Jobs</h3>
          <p className={styles.statValue}>{completedJobs}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Avg Accuracy</h3>
          <p className={styles.statValue}>{projectMetrics?.averageAccuracy.toFixed(1)}%</p>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Recent Jobs</h2>
        {recentJobs.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.name}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[job.status]}`}>{job.status}</span>
                  </td>
                  <td>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progress}
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className={styles.empty}>No jobs yet. Create one to get started!</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
