import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './store/hooks'
import Layout from './components/Layout'
import { LoginPage } from './pages/Auth'
import { RegisterPage } from './pages/Auth'
import { DashboardPage } from './pages/Dashboard'
import { ProjectsPage } from './pages/Projects'
import { PlaygroundPage } from './pages/Playground'
import { JobsPage } from './pages/Jobs'
import { MetricsPage } from './pages/Metrics'
import { SettingsPage } from './pages/Settings'
import { NotFoundPage } from './pages/NotFound'
import { initializeApp } from './utils/initializeApp'
import './App.css'

const App: React.FC = () => {
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector(state => state.auth)

  useEffect(() => {
    // Initialize app data structures
    initializeApp()
  }, [dispatch])

  const AuthRoutes = (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )

  const AppRoutes = (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/playground" element={<PlaygroundPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/metrics" element={<MetricsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </Router>
  )

  return isAuthenticated ? AppRoutes : AuthRoutes
}

export default App
