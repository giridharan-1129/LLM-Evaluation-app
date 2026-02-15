import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Sidebar.module.css'

const Sidebar: React.FC = () => {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path)

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <h2>🧪 LLM Eval</h2>
      </div>

      <nav className={styles.nav}>
        <Link
          to="/"
          className={`${styles.navItem} ${
            location.pathname === '/' && !location.pathname.includes('/projects') && !location.pathname.includes('/jobs') && !location.pathname.includes('/playground')
              ? styles.active
              : ''
          }`}
        >
          📊 Dashboard
        </Link>
        <Link
          to="/projects"
          className={`${styles.navItem} ${isActive('/projects') && styles.active}`}
        >
          📁 Projects
        </Link>
        <Link
          to="/playground"
          className={`${styles.navItem} ${isActive('/playground') && styles.active}`}
        >
          🎮 Playground
        </Link>
        <Link
          to="/jobs"
          className={`${styles.navItem} ${isActive('/jobs') && styles.active}`}
        >
          📊 Running Jobs
        </Link>
        <Link
          to="/metrics"
          className={`${styles.navItem} ${isActive('/metrics') && styles.active}`}
        >
          📈 Metrics & Analytics
        </Link>
        <Link
          to="/settings"
          className={`${styles.navItem} ${isActive('/settings') && styles.active}`}
        >
          🔑 API Keys
        </Link>
      </nav>

      <div className={styles.footer}>
        <p>v1.0.0</p>
      </div>
    </aside>
  )
}

export default Sidebar
