import React, { useState, useEffect } from 'react'
import styles from './Playground.module.css'

interface Project {
  id: string
  name: string
  description: string
}

interface StreamingRow {
  id: number
  question: string
  expected_answer: string
  model_a_response: string
  model_a_latency: number
  model_a_tokens: number
  model_a_cost: number
  model_a_accuracy: number
  model_b_response: string
  model_b_latency: number
  model_b_tokens: number
  model_b_cost: number
  model_b_accuracy: number
  winner: string
}

interface PromptVersion {
  id: string
  version: string
  system_prompt: string
  user_prompt: string
  created_at: string
}

interface EvaluationRun {
  version: string
  created_at: string
  rows: StreamingRow[]
}

const PlaygroundPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const [activeTab, setActiveTab] = useState<'setup' | 'test' | 'results'>('setup')
  const [uploadedDataset, setUploadedDataset] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [evaluationRuns, setEvaluationRuns] = useState<EvaluationRun[]>([])
  const [progress, setProgress] = useState(0)
  const [currentStreamingRow, setCurrentStreamingRow] = useState<StreamingRow | null>(null)

  const [promptVersions, setPromptVersions] = useState<PromptVersion[]>([
    {
      id: '1',
      version: '1.0',
      system_prompt: 'You are a helpful AI assistant specialized in machine learning.',
      user_prompt: 'Answer this question: {Question}',
      created_at: '2024-01-01'
    }
  ])

  const [selectedPromptVersion, setSelectedPromptVersion] = useState<PromptVersion>(promptVersions[0])
  const [systemPrompt, setSystemPrompt] = useState(selectedPromptVersion.system_prompt)
  const [userPrompt, setUserPrompt] = useState(selectedPromptVersion.user_prompt)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [isImprovingPrompt, setIsImprovingPrompt] = useState(false)
  const [improvedPrompt, setImprovedPrompt] = useState('')

  // Load projects from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects')
    if (savedProjects) {
      try {
        const loaded = JSON.parse(savedProjects)
        setProjects(loaded)
        
        const storedProjectId = localStorage.getItem('selectedProjectId')
        if (storedProjectId) {
          const project = loaded.find((p: Project) => p.id === storedProjectId)
          if (project) {
            setSelectedProjectId(storedProjectId)
            setSelectedProject(project)
          }
        }
      } catch (e) {
        console.log('Error loading projects')
      }
    }
  }, [])

  const handleProjectChange = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (project) {
      setSelectedProjectId(projectId)
      setSelectedProject(project)
      localStorage.setItem('selectedProjectId', projectId)
    }
  }

  const handleUploadSuccess = (dataset: any) => {
    setUploadedDataset(dataset)
  }

  const handleSavePromptVersion = () => {
    const newVersion = (parseFloat(selectedPromptVersion.version) + 0.1).toFixed(1)
    const newPromptVersion: PromptVersion = {
      id: Date.now().toString(),
      version: newVersion,
      system_prompt: systemPrompt,
      user_prompt: userPrompt,
      created_at: new Date().toLocaleDateString()
    }
    
    setPromptVersions([...promptVersions, newPromptVersion])
    setSelectedPromptVersion(newPromptVersion)
    alert(`✅ Prompt saved as version ${newVersion}`)
  }

  const handleDeletePromptVersion = (versionId: string) => {
    if (selectedPromptVersion.id === versionId) {
      alert('❌ Cannot delete current version. Switch to another version first.')
      return
    }
    
    const updated = promptVersions.filter(p => p.id !== versionId)
    setPromptVersions(updated)
    alert('✅ Version deleted')
  }

  const handleLoadPromptVersion = (version: PromptVersion) => {
    setSelectedPromptVersion(version)
    setSystemPrompt(version.system_prompt)
    setUserPrompt(version.user_prompt)
    setShowVersionHistory(false)
  }

  const handleImprovePrompt = async () => {
    setIsImprovingPrompt(true)
    try {
      // In production, call DeepSeek API to improve prompt
      const improvePrompt = `You are a prompt engineering expert. Improve this prompt:
System Prompt: ${systemPrompt}
User Template: ${userPrompt}

Make it clearer, more specific, and more effective. Return ONLY the improved prompt.`

      // Mock improvement
      const improved = `${systemPrompt} Be precise and concise in your answers.`
      setImprovedPrompt(improved)
      alert('✅ Suggested improvement:\n\n' + improved)
    } catch (error) {
      alert('Error improving prompt')
    } finally {
      setIsImprovingPrompt(false)
    }
  }

  const handleRunEvaluation = async () => {
    if (!selectedProjectId) {
      alert('❌ Select a project')
      return
    }
    if (!uploadedDataset) {
      alert('❌ Upload dataset')
      return
    }

    setIsRunning(true)
    setProgress(0)
    setEvaluationRuns([])
    setCurrentStreamingRow(null)

    try {
      const evaluationRows: StreamingRow[] = []

      // Stream each row one by one
      for (let i = 0; i < uploadedDataset.data.length; i++) {
        const row = uploadedDataset.data[i]
        
        // Simulate API call streaming
        await new Promise(resolve => setTimeout(resolve, 2000))

        const streamedRow: StreamingRow = {
          id: i + 1,
          question: row.Question,
          expected_answer: row['Expected Answer'],
          model_a_response: `This is a detailed response from GPT-4 about ${row.Question}. GPT-4 provides: ${row['Expected Answer'].substring(0, 100)}...`,
          model_a_latency: (Math.random() * 2 + 0.5).toFixed(2) as any,
          model_a_tokens: Math.round(Math.random() * 200 + 100),
          model_a_cost: (Math.random() * 0.01 + 0.001).toFixed(4) as any,
          model_a_accuracy: Math.random() * 0.3 + 0.65,
          model_b_response: `DeepSeek provides a comprehensive answer to ${row.Question}: ${row['Expected Answer'].substring(0, 100)}...`,
          model_b_latency: (Math.random() * 1.5 + 0.3).toFixed(2) as any,
          model_b_tokens: Math.round(Math.random() * 200 + 100),
          model_b_cost: (Math.random() * 0.008 + 0.0005).toFixed(4) as any,
          model_b_accuracy: Math.random() * 0.3 + 0.65,
          winner: Math.random() > 0.5 ? 'gpt-4' : 'deepseek-chat'
        }

        evaluationRows.push(streamedRow)
        setCurrentStreamingRow(streamedRow)
        setProgress(Math.round(((i + 1) / uploadedDataset.data.length) * 100))
      }

      // Save evaluation run
      const newRun: EvaluationRun = {
        version: selectedPromptVersion.version,
        created_at: new Date().toLocaleString(),
        rows: evaluationRows
      }

      setEvaluationRuns([newRun, ...evaluationRuns])
      setActiveTab('results')
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsRunning(false)
      setCurrentStreamingRow(null)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.projectSelector}>
          <label>📁 Project:</label>
          <select 
            value={selectedProjectId}
            onChange={(e) => handleProjectChange(e.target.value)}
            className={styles.projectDropdown}
          >
            <option value="">-- Select --</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.header}>
        <h1>🎮 Prompt Playground</h1>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'setup' ? styles.active : ''}`} onClick={() => setActiveTab('setup')}>
          1️⃣ Setup
        </button>
        <button className={`${styles.tab} ${activeTab === 'test' ? styles.active : ''}`} onClick={() => setActiveTab('test')}>
          2️⃣ Evaluate
        </button>
        <button className={`${styles.tab} ${activeTab === 'results' ? styles.active : ''}`} onClick={() => setActiveTab('results')}>
          3️⃣ Results
        </button>
      </div>

      {activeTab === 'setup' && (
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <h3>Step 1: Upload Dataset</h3>
            {uploadedDataset ? (
              <div className={styles.success}>✅ {uploadedDataset.data.length} rows loaded</div>
            ) : (
              <p>Upload Excel with: Question, Expected Answer columns</p>
            )}
          </div>

          <div className={styles.section}>
            <h3>Step 2: Manage Prompt Versions</h3>
            <div className={styles.versionManager}>
              <div className={styles.currentVersion}>
                <p>Current Version: <strong>v{selectedPromptVersion.version}</strong></p>
              </div>

              <div className={styles.promptEditor}>
                <label>System Prompt:</label>
                <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={3} />
              </div>

              <div className={styles.promptEditor}>
                <label>User Prompt Template (use {'{Question}'}  for placeholder):</label>
                <textarea value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} rows={3} />
              </div>

              <div className={styles.buttonGroup}>
                <button className={styles.saveVersionBtn} onClick={handleSavePromptVersion}>
                  💾 Save as New Version
                </button>
                <button className={styles.improveBtn} onClick={handleImprovePrompt} disabled={isImprovingPrompt}>
                  ✨ Improve Prompt (DeepSeek)
                </button>
                <button className={styles.historyBtn} onClick={() => setShowVersionHistory(!showVersionHistory)}>
                  📜 History ({promptVersions.length})
                </button>
              </div>

              {showVersionHistory && (
                <div className={styles.versionHistory}>
                  {promptVersions.map((v) => (
                    <div key={v.id} className={`${styles.versionItem} ${selectedPromptVersion.id === v.id ? styles.selected : ''}`}>
                      <span onClick={() => handleLoadPromptVersion(v)}>v{v.version} - {v.created_at}</span>
                      {selectedPromptVersion.id !== v.id && (
                        <button className={styles.deleteVersionBtn} onClick={() => handleDeletePromptVersion(v.id)}>
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'test' && (
        <div className={styles.tabContent}>
          <div className={styles.evaluateCard}>
            {uploadedDataset ? (
              <>
                <h3>Ready to Evaluate {uploadedDataset.data.length} questions?</h3>
                <p>Prompt v{selectedPromptVersion.version}</p>
                <button className={styles.evaluateBtn} onClick={handleRunEvaluation} disabled={isRunning}>
                  {isRunning ? `⏳ ${progress}% - Streaming...` : '▶️ Start Evaluation'}
                </button>
                {isRunning && (
                  <div>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
                    </div>
                    {currentStreamingRow && (
                      <div className={styles.streamingCard}>
                        <p><strong>Row {currentStreamingRow.id}: {currentStreamingRow.question}</strong></p>
                        <div className={styles.streamingResponses}>
                          <div className={styles.response}>
                            <p className={styles.modelName}>🤖 GPT-4</p>
                            <p>{currentStreamingRow.model_a_response}</p>
                            <p className={styles.metrics}>⏱️ {currentStreamingRow.model_a_latency}s | 🎯 {(currentStreamingRow.model_a_accuracy * 100).toFixed(1)}%</p>
                          </div>
                          <div className={styles.response}>
                            <p className={styles.modelName}>🤖 DeepSeek</p>
                            <p>{currentStreamingRow.model_b_response}</p>
                            <p className={styles.metrics}>⏱️ {currentStreamingRow.model_b_latency}s | 🎯 {(currentStreamingRow.model_b_accuracy * 100).toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p>❌ Upload dataset first</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'results' && (
        <div className={styles.tabContent}>
          {evaluationRuns.length === 0 ? (
            <p>No results yet</p>
          ) : (
            evaluationRuns.map((run, idx) => (
              <div key={idx} className={styles.evaluationRun}>
                <h3>📊 Prompt v{run.version} Evaluation</h3>
                <p className={styles.runMeta}>{run.created_at}</p>

                <div className={styles.resultsTable}>
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Question</th>
                        <th>GPT-4 Response</th>
                        <th>Latency</th>
                        <th>Tokens</th>
                        <th>Cost</th>
                        <th>Accuracy</th>
                        <th>DeepSeek Response</th>
                        <th>Latency</th>
                        <th>Tokens</th>
                        <th>Cost</th>
                        <th>Accuracy</th>
                        <th>Winner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {run.rows.map((row) => (
                        <tr key={row.id}>
                          <td>{row.id}</td>
                          <td className={styles.question}>{row.question}</td>
                          <td className={styles.fullResponse}>{row.model_a_response}</td>
                          <td>{row.model_a_latency}s</td>
                          <td>{row.model_a_tokens}</td>
                          <td>${row.model_a_cost}</td>
                          <td>{(row.model_a_accuracy * 100).toFixed(1)}%</td>
                          <td className={styles.fullResponse}>{row.model_b_response}</td>
                          <td>{row.model_b_latency}s</td>
                          <td>{row.model_b_tokens}</td>
                          <td>${row.model_b_cost}</td>
                          <td>{(row.model_b_accuracy * 100).toFixed(1)}%</td>
                          <td className={styles.winner}>🏆 {row.winner === 'gpt-4' ? 'A' : 'B'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default PlaygroundPage
