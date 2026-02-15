import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './store'

// Pages
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import ProjectsPage from './pages/Projects/ProjectsPage'
import PromptsPage from './pages/Prompts/PromptsPage'
import JobsPage from './pages/Jobs/JobsPage'
import JobDetailPage from './pages/Jobs/JobDetailPage'
import MetricsPage from './pages/Metrics/MetricsPage'
import SettingsPage from './pages/Settings/SettingsPage'
import PlaygroundPage from './pages/Playground/PlaygroundPage'
import TestingDashboard from './pages/Testing/TestingDashboard'

// Components
import Layout from './components/Layout'

// Styles
import './App.css'

const App: React.FC = () => {
  const { isAuthenticated } = useAuth()

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {isAuthenticated ? (
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId/prompts" element={<PromptsPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:jobId" element={<JobDetailPage />} />
            <Route path="/metrics" element={<MetricsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/playground" element={<PlaygroundPage />} />
            <Route path="/testing" element={<TestingDashboard />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
