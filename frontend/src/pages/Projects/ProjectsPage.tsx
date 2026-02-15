import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Projects.module.css'

interface Project {
  id: string
  name: string
  description: string
  created_at: string
  total_evaluations: number
}

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Machine Learning Evaluation',
      description: 'Comparing GPT-4 vs DeepSeek for ML questions',
      created_at: '2024-02-15',
      total_evaluations: 0
    }
  ])
  
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')

  // Load projects from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects')
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects))
      } catch (e) {
        console.log('Could not load saved projects')
      }
    }
  }, [])

  // Save projects to localStorage
  const saveProjects = (updatedProjects: Project[]) => {
    setProjects(updatedProjects)
    localStorage.setItem('projects', JSON.stringify(updatedProjects))
  }

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      alert('Please enter project name')
      return
    }

    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName,
      description: newProjectDesc,
      created_at: new Date().toLocaleDateString(),
      total_evaluations: 0
    }

    const updated = [...projects, newProject]
    saveProjects(updated)
    setNewProjectName('')
    setNewProjectDesc('')
    setShowCreateForm(false)
    alert('✅ Project created successfully!')
  }

  const handleDeleteProject = (projectId: string) => {
    const projectName = projects.find(p => p.id === projectId)?.name
    if (window.confirm(`Delete project "${projectName}"? This cannot be undone.`)) {
      const updated = projects.filter(p => p.id !== projectId)
      saveProjects(updated)
      // If deleted project was selected, clear it
      if (localStorage.getItem('selectedProjectId') === projectId) {
        localStorage.removeItem('selectedProjectId')
      }
      alert('✅ Project deleted successfully')
    }
  }

  const handleSelectProject = (projectId: string) => {
    // Store selected project in localStorage
    localStorage.setItem('selectedProjectId', projectId)
    console.log('Selected project:', projectId)
    // Navigate to playground
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
            <label>Project Name *</label>
            <input
              type="text"
              placeholder="e.g., ML Model Comparison"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              placeholder="Describe your project..."
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              rows={3}
            />
          </div>
          <div className={styles.formButtons}>
            <button className={styles.submitBtn} onClick={handleCreateProject}>
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
        {projects.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No projects yet. Create one to get started!</p>
          </div>
        ) : (
          projects.map((project) => (
            <div 
              key={project.id}
              className={styles.projectCard}
            >
              <div className={styles.cardHeader}>
                <h3>{project.name}</h3>
                <span className={styles.date}>{project.created_at}</span>
              </div>
              <p className={styles.description}>{project.description}</p>
              <div className={styles.cardFooter}>
                <span className={styles.stat}>
                  📊 {project.total_evaluations} evaluations
                </span>
                <div className={styles.cardButtons}>
                  <button 
                    className={styles.selectBtn}
                    onClick={() => handleSelectProject(project.id)}
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
