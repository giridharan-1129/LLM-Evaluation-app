import React, { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import Footer from './Footer'
import styles from './Layout.module.css'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.mainContent} style={{ marginLeft: '200px' }}>
        <Header />
        <main className={styles.content}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default Layout
