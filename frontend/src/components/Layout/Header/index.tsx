import React from 'react'
import { useAuth, useAppDispatch } from '../../../store'
import { logoutUser } from '../../../store/thunks'
import styles from './Header.module.css'

/**
 * Header Component
 * Top navigation bar
 */
const Header: React.FC = () => {
  const dispatch = useAppDispatch()
  const { user } = useAuth()

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <h1 className={styles.title}>LLM Evaluation Platform</h1>
        <div className={styles.userMenu}>
          {user && (
            <>
              <span className={styles.userName}>{user.name}</span>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
