import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './store'

// Pages
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import ProjectsPage from './pages/Projects/ProjectsPage'
import PromptsPage from './pages/Prompts/PromptsPage'
import TestingDashboard from './pages/Testing/TestingDashboard'

// Components
import Layout from './components/Layout'

// Styles
import './App.css'

/**
 * Main App Component
 * Routes and layout setup
 */
const App: React.FC = () => {
  const { isAuthenticated } = useAuth()

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes with Layout */}
        {isAuthenticated ? (
          <Route
            element={<Layout />}
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId/prompts" element={<PromptsPage />} />
            <Route path="/testing" element={<TestingDashboard />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
