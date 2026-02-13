import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProject, useAppDispatch } from '../../store'
import { createProject, fetchProjects } from '../../store/thunks'
import styles from './Projects.module.css'

/**
 * Projects Page Component
 * Manage projects and view project details
 */
const ProjectsPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { projects, isLoading, error } = useProject()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  // Fetch projects on mount
  useEffect(() => {
    dispatch(fetchProjects(undefined))
  }, [dispatch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Project name is required')
      return
    }

    try {
      await dispatch(createProject(formData)).unwrap()
      setFormData({ name: '', description: '' })
      setShowCreateForm(false)
    } catch (err) {
      alert('Failed to create project: ' + (typeof err === 'string' ? err : 'Unknown error'))
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Projects</h1>
        <button
          className={styles.createBtn}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ New Project'}
        </button>
      </div>

      {showCreateForm && (
        <form className={styles.createForm} onSubmit={handleCreateProject}>
          <input
            type="text"
            name="name"
            placeholder="Project name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="description"
            placeholder="Project description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
          />
          <button type="submit" className={styles.submitBtn}>
            Create Project
          </button>
        </form>
      )}

      {isLoading && <p>Loading projects...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {projects.length === 0 ? (
        <p className={styles.emptyState}>
          No projects yet. Create one to get started!
        </p>
      ) : (
        <div className={styles.projectsList}>
          {projects.map((project) => (
            <div
              key={project.id}
              className={styles.projectCard}
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <h2>{project.name}</h2>
              <p>{project.description}</p>
              <small>Created {new Date(project.created_at).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProjectsPage
