import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { useProject } from '../../store';
import { selectProject } from '../../store/slices/projectSlice';
import styles from './Projects.module.css';

/**
 * Projects Page Component
 * Shows list of projects with ability to create new ones
 */
const ProjectsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { projects, isLoading } = useProject();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    // TODO: Fetch projects on mount
    // dispatch(fetchProjects())
  }, [dispatch]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call create project thunk
    setShowCreateForm(false);
    setFormData({ name: '', description: '' });
  };

  const handleSelectProject = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      dispatch(selectProject(project));
      navigate(`/projects/${projectId}`);
    }
  };

  return (
    <div className={styles.projectsPage}>
      <div className={styles.header}>
        <h1>Projects</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className={styles.createBtn}
        >
          + New Project
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateProject}
          className={styles.createForm}
        >
          <div className={styles.formGroup}>
            <label>Project Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Customer Support Bot"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your project..."
            />
          </div>
          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.submitBtn}
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className={styles.cancelBtn}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Projects Grid */}
      <div className={styles.projectsGrid}>
        {isLoading ? (
          <p>Loading projects...</p>
        ) : projects.length > 0 ? (
          projects.map((project) => (
            <div
              key={project.id}
              className={styles.projectCard}
              onClick={() => handleSelectProject(project.id)}
            >
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <div className={styles.cardFooter}>
                <small>Created {new Date(project.createdAt).toLocaleDateString()}</small>
              </div>
            </div>
          ))
        ) : (
          <p>No projects yet. Create one to get started!</p>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
