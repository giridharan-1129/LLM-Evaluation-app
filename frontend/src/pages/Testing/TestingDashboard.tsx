import React, { useState } from 'react'
import { useAppDispatch, useAuth, useProject, usePrompt } from '../../store'
import { fetchProjects, createProject } from '../../store/thunks'
import { fetchPromptsByProject, createPrompt } from '../../store/thunks'
import styles from './Testing.module.css'

interface TestResult {
  id: string
  name: string
  status: 'pending' | 'success' | 'failed'
  message: string
  timestamp: string
}

/**
 * Testing Dashboard Component
 * Complete flow testing from UI
 */
const TestingDashboard: React.FC = () => {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const { projects } = useProject()
  const { prompts } = usePrompt()

  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [isRunning, setIsRunning] = useState(false)

  // Helper function to add test result
  const addResult = (name: string, status: 'success' | 'failed', message: string) => {
    const result: TestResult = {
      id: Date.now().toString(),
      name,
      status,
      message,
      timestamp: new Date().toLocaleTimeString(),
    }
    setTestResults((prev) => [result, ...prev])
    console.log(`[${status.toUpperCase()}] ${name}: ${message}`)
  }

  // TEST 1: Check User Authentication
  const testAuthentication = async () => {
    try {
      if (!user) {
        addResult('Authentication', 'failed', 'No user logged in')
        return false
      }
      addResult('Authentication', 'success', `User: ${user.name} (${user.email})`)
      return true
    } catch (error) {
      addResult('Authentication', 'failed', String(error))
      return false
    }
  }

  // TEST 2: Fetch Projects
  const testFetchProjects = async () => {
    try {
      await dispatch(fetchProjects(undefined)).unwrap()
      addResult('Fetch Projects', 'success', `Found ${projects.length} projects`)
      return projects.length >= 0
    } catch (error) {
      addResult('Fetch Projects', 'failed', String(error))
      return false
    }
  }

  // TEST 3: Create Project
  const testCreateProject = async () => {
    try {
      const newProject = await dispatch(
        createProject({
          name: `Test Project ${Date.now()}`,
          description: 'Automated test project',
        }),
      ).unwrap()

      addResult('Create Project', 'success', `Created: ${newProject.name} (${newProject.id})`)
      setSelectedProjectId(newProject.id)
      return newProject.id
    } catch (error) {
      addResult('Create Project', 'failed', String(error))
      return null
    }
  }

  // TEST 4: Fetch Prompts for Project
  const testFetchPrompts = async (projectId: string) => {
    try {
      if (!projectId) {
        addResult('Fetch Prompts', 'failed', 'No project selected')
        return false
      }

      await dispatch(fetchPromptsByProject({ projectId })).unwrap()
      addResult('Fetch Prompts', 'success', `Found ${prompts.length} prompts`)
      return true
    } catch (error) {
      addResult('Fetch Prompts', 'failed', String(error))
      return false
    }
  }

  // TEST 5: Create Prompt
  const testCreatePrompt = async (projectId: string) => {
    try {
      if (!projectId) {
        addResult('Create Prompt', 'failed', 'No project selected')
        return null
      }

      const newPrompt = await dispatch(
        createPrompt({
          projectId,
          payload: {
            name: `Test Prompt ${Date.now()}`,
            description: 'Automated test prompt',
            content: 'Summarize the following text:\n\n{text}',
          },
        }),
      ).unwrap()

      addResult('Create Prompt', 'success', `Created: ${newPrompt.name}`)
      return newPrompt.id
    } catch (error) {
      addResult('Create Prompt', 'failed', String(error))
      return null
    }
  }

  // MAIN TEST FLOW
  const runFullTestFlow = async () => {
    setIsRunning(true)
    setTestResults([])

    console.log('🚀 Starting full test flow...')

    // Step 1: Check auth
    console.log('Step 1: Testing authentication...')
    const authOk = await testAuthentication()
    if (!authOk) {
      setIsRunning(false)
      return
    }

    // Step 2: Fetch existing projects
    console.log('Step 2: Fetching projects...')
    await testFetchProjects()

    // Step 3: Create new project
    console.log('Step 3: Creating project...')
    const projectId = await testCreateProject()
    if (!projectId) {
      setIsRunning(false)
      return
    }

    // Step 4: Fetch prompts
    console.log('Step 4: Fetching prompts...')
    await testFetchPrompts(projectId)

    // Step 5: Create prompt
    console.log('Step 5: Creating prompt...')
    const promptId = await testCreatePrompt(projectId)
    if (!promptId) {
      addResult('Test Flow', 'failed', 'Failed to create prompt')
      setIsRunning(false)
      return
    }

    setIsRunning(false)
    addResult('Test Flow', 'success', 'All tests completed!')
  }

  // QUICK TEST: Just check API connectivity
  const runQuickTest = async () => {
    setIsRunning(true)
    setTestResults([])

    await testAuthentication()
    await testFetchProjects()

    setIsRunning(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🧪 Frontend Testing Dashboard</h1>
        <p>Test the entire application flow from the UI</p>
      </div>

      <div className={styles.controls}>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={runFullTestFlow}
          disabled={isRunning}
        >
          {isRunning ? '⏳ Running...' : '▶️ Run Full Test Flow'}
        </button>

        <button
          className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={runQuickTest}
          disabled={isRunning}
        >
          {isRunning ? '⏳ Running...' : '⚡ Quick Test'}
        </button>

        <button
          className={`${styles.btn} ${styles.btnDanger}`}
          onClick={() => setTestResults([])}
          disabled={isRunning}
        >
          🗑️ Clear Results
        </button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.stat}>
          <h3>Total Tests</h3>
          <p className={styles.statValue}>{testResults.length}</p>
        </div>
        <div className={styles.stat}>
          <h3>Passed</h3>
          <p className={`${styles.statValue} ${styles.success}`}>
            {testResults.filter((r) => r.status === 'success').length}
          </p>
        </div>
        <div className={styles.stat}>
          <h3>Failed</h3>
          <p className={`${styles.statValue} ${styles.failed}`}>
            {testResults.filter((r) => r.status === 'failed').length}
          </p>
        </div>
        <div className={styles.stat}>
          <h3>User</h3>
          <p className={styles.statValue}>{user?.name || 'Not logged in'}</p>
        </div>
      </div>

      <div className={styles.manualTests}>
        <h2>Manual Tests</h2>

        <div className={styles.testCard}>
          <h3>Test: Fetch Projects</h3>
          <button className={styles.btn} onClick={() => testFetchProjects()}>
            Test Now
          </button>
          <p>Projects found: <strong>{projects.length}</strong></p>
          {projects.length > 0 && (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className={styles.select}
            >
              <option value="">Select a project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className={styles.testCard}>
          <h3>Test: Create Project</h3>
          <button className={styles.btn} onClick={() => testCreateProject()}>
            Create Test Project
          </button>
          {selectedProjectId && (
            <p>
              Selected Project: <strong>{selectedProjectId}</strong>
            </p>
          )}
        </div>

        {selectedProjectId && (
          <>
            <div className={styles.testCard}>
              <h3>Test: Fetch Prompts</h3>
              <button className={styles.btn} onClick={() => testFetchPrompts(selectedProjectId)}>
                Fetch Prompts
              </button>
              <p>Prompts found: <strong>{prompts.length}</strong></p>
            </div>

            <div className={styles.testCard}>
              <h3>Test: Create Prompt</h3>
              <button className={styles.btn} onClick={() => testCreatePrompt(selectedProjectId)}>
                Create Test Prompt
              </button>
            </div>
          </>
        )}
      </div>

      <div className={styles.resultsContainer}>
        <h2>Test Results</h2>
        {testResults.length === 0 ? (
          <p className={styles.emptyResults}>No tests run yet. Click a button above to start testing.</p>
        ) : (
          <div className={styles.resultsList}>
            {testResults.map((result) => (
              <div key={result.id} className={`${styles.result} ${styles[result.status]}`}>
                <div className={styles.resultHeader}>
                  <span className={styles.resultStatus}>
                    {result.status === 'success' ? '✅' : '❌'}
                  </span>
                  <span className={styles.resultName}>{result.name}</span>
                  <span className={styles.resultTime}>{result.timestamp}</span>
                </div>
                <div className={styles.resultMessage}>{result.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.debugInfo}>
        <h2>Debug Information</h2>
        <div className={styles.debugItem}>
          <strong>Backend URL:</strong> <code>http://localhost:8000</code>
        </div>
        <div className={styles.debugItem}>
          <strong>Frontend URL:</strong> <code>http://localhost:5173</code>
        </div>
        <div className={styles.debugItem}>
          <strong>Authenticated:</strong> <code>{user ? 'Yes' : 'No'}</code>
        </div>
        <div className={styles.debugItem}>
          <strong>User Email:</strong> <code>{user?.email || 'N/A'}</code>
        </div>
        <div className={styles.debugItem}>
          <strong>Projects:</strong> <code>{projects.length}</code>
        </div>
        <div className={styles.debugItem}>
          <strong>Prompts:</strong> <code>{prompts.length}</code>
        </div>
      </div>

      <div className={styles.instructions}>
        <h2>How to Use</h2>
        <ol>
          <li><strong>Quick Test:</strong> Click "⚡ Quick Test" to verify basic API connectivity</li>
          <li><strong>Full Flow:</strong> Click "▶️ Run Full Test Flow" to test the entire workflow</li>
          <li><strong>Manual Tests:</strong> Use individual buttons to test specific features</li>
          <li><strong>Results:</strong> Check the "Test Results" section for detailed output</li>
          <li><strong>Debug:</strong> Check the "Debug Information" section for system status</li>
          <li><strong>Browser Console:</strong> Open F12 → Console to see detailed logs</li>
        </ol>
      </div>
    </div>
  )
}

export default TestingDashboard
