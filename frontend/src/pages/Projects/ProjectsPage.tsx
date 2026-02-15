import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchProjects } from '../../store/thunks'
import styles from './Projects.module.css'

interface LocalProject {
  id: string
  name: string
  description: string
  created_at: string
  total_evaluations: number
}

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { } = useAppSelector(state => state.project)

  const [localProjects, setLocalProjects] = useState<LocalProject[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')

  useEffect(() => {
    dispatch(fetchProjects())
  }, [dispatch])

  useEffect(() => {
    // Load projects from localStorage
    const savedProjects = localStorage.getItem('projects')
    if (savedProjects) {
      try {
        setLocalProjects(JSON.parse(savedProjects))
      } catch (e) {
        console.log('Error loading projects')
      }
    }
  }, [])

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      alert('Please enter project name')
      return
    }

    const newProject: LocalProject = {
      id: Date.now().toString(),
      name: newProjectName,
      description: newProjectDesc,
      created_at: new Date().toLocaleDateString(),
      total_evaluations: 0
    }

    const updated = [...localProjects, newProject]
    setLocalProjects(updated)
    localStorage.setItem('projects', JSON.stringify(updated))
    
    setNewProjectName('')
    setNewProjectDesc('')
    setShowCreateForm(false)
    alert('✅ Project created successfully!')
  }

  const handleDeleteProject = (projectId: string) => {
    const projectName = localProjects.find(p => p.id === projectId)?.name
    if (window.confirm(`Delete project "${projectName}"? This cannot be undone.`)) {
      const updated = localProjects.filter(p => p.id !== projectId)
      setLocalProjects(updated)
      localStorage.setItem('projects', JSON.stringify(updated))
      
      // Clear selected project if it was deleted
      if (localStorage.getItem('selectedProjectId') === projectId) {
        localStorage.removeItem('selectedProjectId')
      }
      alert('✅ Project deleted successfully')
    }
  }

  const handleOpenProject = (projectId: string) => {
    localStorage.setItem('selectedProjectId', projectId)
    navigate('/playground')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📁 Projects</h1>
        <p>Manage your LLM evaluation projects</p>
      </div>

      <div className={styles.actionBar}>
        <button 
          className={styles.createBtn}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? '✕ Cancel' : '➕ Create New Project'}
        </button>
      </div>

      {showCreateForm && (
        <div className={styles.createForm}>
          <h3>Create New Project</h3>
          
          <div className={styles.formGroup}>
            <label htmlFor="project-name">Project Name *</label>
            <input
              id="project-name"
              type="text"
              placeholder="e.g., ML Model Comparison"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="project-desc">Description</label>
            <textarea
              id="project-desc"
              placeholder="Describe your project..."
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              rows={3}
              className={styles.textarea}
            />
          </div>

          <div className={styles.formButtons}>
            <button 
              className={styles.submitBtn} 
              onClick={handleCreateProject}
            >
              Create Project
            </button>
            <button 
              className={styles.cancelBtn}
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className={styles.projectsGrid}>
        {localProjects.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No projects yet. Create one to get started!</p>
          </div>
        ) : (
          localProjects.map((project) => (
            <div 
              key={project.id}
              className={styles.projectCard}
            >
              <div className={styles.cardHeader}>
                <h3>{project.name}</h3>
                <span className={styles.date}>{project.created_at}</span>
              </div>

              <p className={styles.description}>{project.description || 'No description'}</p>

              <div className={styles.cardFooter}>
                <span className={styles.stat}>
                  📊 {project.total_evaluations} evaluations
                </span>
                <div className={styles.cardButtons}>
                  <button 
                    className={styles.openBtn}
                    onClick={() => handleOpenProject(project.id)}
                  >
                    Open →
                  </button>
                  <button 
                    className={styles.deleteBtn}
                    onClick={() => handleDeleteProject(project.id)}
                    title="Delete project"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ProjectsPage
