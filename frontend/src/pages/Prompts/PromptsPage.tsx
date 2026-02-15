import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { usePrompt, useAppDispatch } from '../../store'
import { fetchPromptsByProject, createPrompt, createPromptVersion } from '../../store/thunks'
import styles from './Prompts.module.css'

/**
 * Prompts Page Component
 * Manage prompts and versions for a project
 */
const PromptsPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { projectId } = useParams<{ projectId: string }>()
  const { prompts, selectedPrompt, selectedVersion, isLoading, error } = usePrompt()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showVersionForm, setShowVersionForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
  })
  const [versionData, setVersionData] = useState({
    content: '',
    description: '',
    status: 'draft' as const,
  })

  // Fetch prompts on mount
  useEffect(() => {
    if (projectId) {
      dispatch(fetchPromptsByProject({ projectId }))
    }
  }, [projectId, dispatch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleVersionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setVersionData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreatePrompt = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.name.trim()) {
      alert('Prompt name and content are required')
      return
    }

    try {
      if (projectId) {
        await dispatch(
          createPrompt({
            projectId,
            payload: {
              name: formData.name,
              description: formData.description,
              content: formData.name,
            },
          }),
        ).unwrap()
        setFormData({ name: '', description: '', content: '' })
        setShowCreateForm(false)
      }
    } catch (err) {
      alert('Failed to create prompt: ' + (typeof err === 'string' ? err : 'Unknown error'))
    }
  }

  const handleCreateVersion = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!versionData.content.trim()) {
      alert('Version content is required')
      return
    }

    try {
      if (selectedPrompt) {
        await dispatch(
          createPromptVersion({
            promptId: selectedPrompt.id,
            payload: {
              content: versionData.content,
              description: versionData.description,
              status: versionData.status,
            },
          }),
        ).unwrap()
        setVersionData({ content: '', description: '', status: 'draft' })
        setShowVersionForm(false)
      }
    } catch (err) {
      alert('Failed to create version: ' + (typeof err === 'string' ? err : 'Unknown error'))
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Prompts</h1>
        <button
          className={styles.createBtn}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ New Prompt'}
        </button>
      </div>

      {showCreateForm && (
        <form className={styles.createForm} onSubmit={handleCreatePrompt}>
          <input
            type="text"
            name="name"
            placeholder="Prompt name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="description"
            placeholder="Prompt description"
            value={formData.description}
            onChange={handleInputChange}
            rows={2}
          />
          <textarea
            name="content"
            placeholder="Prompt content (what you send to the LLM)"
            value={formData.name}
            onChange={handleInputChange}
            rows={5}
            required
          />
          <button type="submit" className={styles.submitBtn}>
            Create Prompt
          </button>
        </form>
      )}

      {isLoading && <p>Loading prompts...</p>}
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.content}>
        <div className={styles.promptsList}>
          <h2>All Prompts</h2>
          {prompts.length === 0 ? (
            <p className={styles.emptyState}>No prompts yet. Create one to get started!</p>
          ) : (
            <ul>
              {prompts.map((prompt) => (
                <li
                  key={prompt.id}
                  className={selectedPrompt?.id === prompt.id ? styles.selected : ''}
                  onClick={() => {
                    // TODO: dispatch action to select prompt
                  }}
                >
                  <h3>{prompt.name}</h3>
                  <p>{prompt.description}</p>
                  <small>{prompt.versions?.length || 0} versions</small>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedPrompt && (
          <div className={styles.promptDetail}>
            <h2>{selectedPrompt.name}</h2>
            <p>{selectedPrompt.description}</p>

            <div className={styles.versions}>
              <h3>Versions ({selectedPrompt.versions?.length || 0})</h3>
              <button
                className={styles.versionBtn}
                onClick={() => setShowVersionForm(!showVersionForm)}
              >
                {showVersionForm ? 'Cancel' : '+ New Version'}
              </button>

              {showVersionForm && (
                <form className={styles.versionForm} onSubmit={handleCreateVersion}>
                  <textarea
                    name="content"
                    placeholder="Version content"
                    value={versionData.content}
                    onChange={handleVersionChange}
                    rows={4}
                    required
                  />
                  <textarea
                    name="description"
                    placeholder="Version description"
                    value={versionData.description}
                    onChange={handleVersionChange}
                    rows={2}
                  />
                  <select name="status" value={versionData.status} onChange={handleVersionChange}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                  <button type="submit" className={styles.submitBtn}>
                    Create Version
                  </button>
                </form>
              )}

              {selectedPrompt.versions && selectedPrompt.versions.length > 0 ? (
                <ul className={styles.versionList}>
                  {selectedPrompt.versions.map((version) => (
                    <li key={version.id} className={selectedVersion?.id === version.id ? styles.selectedVersion : ''}>
                      <h4>Version {version.version_number}</h4>
                      <p>{version.description}</p>
                      <code>{version.content}</code>
                      <small>Status: {version.status}</small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No versions yet. Create one to get started!</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PromptsPage
