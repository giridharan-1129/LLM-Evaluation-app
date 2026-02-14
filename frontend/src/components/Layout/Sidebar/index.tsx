import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Sidebar.module.css'

/**
 * Sidebar Component
 * Navigation menu
 */
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
          className={`${styles.navItem} ${isActive('/') && styles.active}`}
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
          to="/testing"
          className={`${styles.navItem} ${isActive('/testing') && styles.active}`}
        >
          🧪 Testing
        </Link>
      </nav>

      <div className={styles.footer}>
        <p>v1.0.0</p>
      </div>
    </aside>
  )
}

export default Sidebar
