import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import styles from './Layout.module.css'

/**
 * Layout Component
 * Main application layout with header and sidebar
 */
const Layout: React.FC = () => {
  return (
    <div className={styles.layoutContainer}>
      <Sidebar />
      <div className={styles.main}>
        <Header />
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Layout
