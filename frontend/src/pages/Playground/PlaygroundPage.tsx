import React, { useState, useEffect } from 'react'
import { ExcelUpload } from '../../components/Jobs/ExcelUpload'
import { LLMConfig, DualLLMConfiguration } from '../../components/Jobs/LLMConfig'
import evaluationService from '../../api/services/evaluation.service'
import promptService from '../../api/services/prompt.service'
import styles from './Playground.module.css'

interface Project {
  id: string
  name: string
  description: string
}

interface APIKeys {
  openai: string
  deepseek: string
  anthropic: string
}

interface PromptVersion {
  id: string
  version: string
  system_prompt: string
  user_prompt: string
  created_at: string
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
  status: 'pending' | 'streaming' | 'complete'
}

interface EvaluationRun {
  id: string
  version: string
  created_at: string
  rows: StreamingRow[]
  system_prompt: string
  user_prompt: string
  model_a: string
  model_b: string
  total_tokens: number
  total_cost: number
}

const PlaygroundPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [apiKeys, setApiKeys] = useState<APIKeys>({ openai: '', deepseek: '', anthropic: '' })

  const [activeTab, setActiveTab] = useState<'setup' | 'evaluate' | 'results'>('setup')
  const [uploadedDataset, setUploadedDataset] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [evaluationRuns, setEvaluationRuns] = useState<EvaluationRun[]>([])
  const [progress, setProgress] = useState(0)
  const [currentStreamingRow, setCurrentStreamingRow] = useState<number | null>(null)
  const [llmConfig, setLlmConfig] = useState<DualLLMConfiguration | null>(null)

  const [promptVersions, setPromptVersions] = useState<PromptVersion[]>([
    {
      id: '1',
      version: '1.0',
      system_prompt: 'You are a helpful AI assistant.',
      user_prompt: 'Answer this question: {Question}',
      created_at: '2024-01-01'
    }
  ])
  const [selectedPromptVersions, setSelectedPromptVersions] = useState<string[]>(['1'])
  const [systemPrompt, setSystemPrompt] = useState(promptVersions[0].system_prompt)
  const [userPrompt, setUserPrompt] = useState(promptVersions[0].user_prompt)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [isImprovingPrompt, setIsImprovingPrompt] = useState(false)

  useEffect(() => {
    // Load projects
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
          }
        }
      } catch (e) {
        console.log('Error loading projects')
      }
    }

    // Load API keys from Settings
    const savedKeys = localStorage.getItem('llm_api_keys')
    if (savedKeys) {
      try {
        const keys = JSON.parse(savedKeys)
        setApiKeys(keys)
      } catch (e) {
        console.log('Error loading API keys')
      }
    }
  }, [])

  const handleProjectChange = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (project) {
      setSelectedProjectId(projectId)
      localStorage.setItem('selectedProjectId', projectId)
    }
  }

  const handleUploadSuccess = (dataset: any) => {
    setUploadedDataset(dataset)
  }

  const handleSavePromptVersion = () => {
    const newVersion = (parseFloat(promptVersions[promptVersions.length - 1].version) + 0.1).toFixed(1)
    const newPromptVersion: PromptVersion = {
      id: Date.now().toString(),
      version: newVersion,
      system_prompt: systemPrompt,
      user_prompt: userPrompt,
      created_at: new Date().toLocaleDateString()
    }
    
    const updated = [...promptVersions, newPromptVersion]
    setPromptVersions(updated)
    setSelectedPromptVersions([newPromptVersion.id])
    alert(`✅ Prompt saved as version ${newVersion}`)
  }

  const handleDeletePromptVersion = (versionId: string) => {
    const updated = promptVersions.filter(p => p.id !== versionId)
    setPromptVersions(updated)
    setSelectedPromptVersions(prev => prev.filter(id => id !== versionId))
  }

  const handleLoadPromptVersion = (version: PromptVersion) => {
    setSystemPrompt(version.system_prompt)
    setUserPrompt(version.user_prompt)
  }

  const handleTogglePromptVersion = (versionId: string) => {
    setSelectedPromptVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId)
      } else {
        return [...prev, versionId]
      }
    })
  }

  const handleImprovePrompt = async () => {
    setIsImprovingPrompt(true)
    try {
      const result = await promptService.improvePrompt(systemPrompt)
      if (result.improved) {
        setSystemPrompt(result.improved)
        alert('✅ Prompt improved!')
      }
    } catch (error) {
      alert('Error improving prompt: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsImprovingPrompt(false)
    }
  }

  const handleRunEvaluation = async () => {
    if (!selectedProjectId) {
      alert('❌ Select a project')
      return
    }
    if (!llmConfig) {
      alert('❌ Configure both models')
      return
    }
    if (!uploadedDataset) {
      alert('❌ Upload dataset')
      return
    }
    if (selectedPromptVersions.length === 0) {
      alert('❌ Select at least one prompt version')
      return
    }

    // Check if API keys are configured
    if (!apiKeys.openai || !apiKeys.deepseek) {
      alert('❌ Configure API keys in Settings → API Keys')
      return
    }

    setIsRunning(true)
    setProgress(0)
    setActiveTab('results')
    setEvaluationRuns([])
    setCurrentStreamingRow(null)

    try {
      for (const versionId of selectedPromptVersions) {
        const version = promptVersions.find(p => p.id === versionId)
        if (!version) continue

        // Initialize rows with pending status
        const initialRows: StreamingRow[] = uploadedDataset.data.map((row: any, idx: number) => ({
          id: idx + 1,
          question: row.Question,
          expected_answer: row['Expected Answer'],
          model_a_response: '⏳ Waiting...',
          model_a_latency: 0,
          model_a_tokens: 0,
          model_a_cost: 0,
          model_a_accuracy: 0,
          model_b_response: '⏳ Waiting...',
          model_b_latency: 0,
          model_b_tokens: 0,
          model_b_cost: 0,
          model_b_accuracy: 0,
          winner: '',
          status: 'pending' as const
        }))

        const newRun: EvaluationRun = {
          id: Date.now().toString() + versionId,
          version: version.version,
          created_at: new Date().toLocaleString(),
          rows: initialRows,
          system_prompt: version.system_prompt,
          user_prompt: version.user_prompt,
          model_a: llmConfig.modelA.model,
          model_b: llmConfig.modelB.model,
          total_tokens: 0,
          total_cost: 0
        }

        setEvaluationRuns([newRun])

        // Call backend with streaming fetch
        try {
          const response = await fetch('http://localhost:8000/api/v1/evaluate/rows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_prompt: version.system_prompt,
              user_prompt_template: version.user_prompt,
              rows: uploadedDataset.data.map((row: any) => ({
                question: row.Question,
                expected_answer: row['Expected Answer']
              })),
              model_a: llmConfig.modelA.model,
              model_b: llmConfig.modelB.model,
              openai_key: apiKeys.openai,
              deepseek_key: apiKeys.deepseek,
              anthropic_key: apiKeys.anthropic
            })
          })

          if (!response.ok) {
            throw new Error(`Evaluation failed: ${response.statusText}`)
          }

          // Read the stream
          const reader = response.body?.getReader()
          if (!reader) throw new Error('No response body')

          const decoder = new TextDecoder()
          let buffer = ''
          let totalTokens = 0
          let totalCost = 0

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })

            // Process complete lines
            const lines = buffer.split('\n')
            buffer = lines.pop() || '' // Keep incomplete line in buffer

            for (const line of lines) {
              if (!line.trim()) continue

              try {
                const data = JSON.parse(line)

                if (data.type === 'start') {
                  console.log(`Starting evaluation with ${data.total_rows} rows`)
                  setProgress(5)
                } else if (data.type === 'row_complete') {
                  const result = data.result
                  const rowIdx = data.row_number - 1

                  // Update the row with completed data
                  setEvaluationRuns(prev => {
                    const updated = [...prev]
                    updated[0].rows[rowIdx] = {
                      id: data.row_number,
                      question: result.question,
                      expected_answer: result.expected_answer,
                      model_a_response: result.model_a_response,
                      model_a_latency: result.model_a_latency,
                      model_a_tokens: result.model_a_tokens,
                      model_a_cost: result.model_a_cost,
                      model_a_accuracy: result.model_a_accuracy,
                      model_b_response: result.model_b_response,
                      model_b_latency: result.model_b_latency,
                      model_b_tokens: result.model_b_tokens,
                      model_b_cost: result.model_b_cost,
                      model_b_accuracy: result.model_b_accuracy,
                      winner: result.winner,
                      status: 'complete' as const
                    }
                    
                    totalTokens = updated[0].rows.reduce((sum, r) => sum + r.model_a_tokens + r.model_b_tokens, 0)
                    totalCost = parseFloat(updated[0].rows.reduce((sum, r) => sum + r.model_a_cost + r.model_b_cost, 0).toFixed(4))
                    
                    updated[0].total_tokens = totalTokens
                    updated[0].total_cost = totalCost

                    return updated
                  })

                  setCurrentStreamingRow(data.row_number)
                  setProgress(data.progress)
                  console.log(`Row ${data.row_number} complete - ${data.progress}%`)
                } else if (data.type === 'row_error') {
                  console.error(`Error in row ${data.row_number}: ${data.error}`)
                } else if (data.type === 'complete') {
                  console.log('✅ Evaluation complete')
                  setProgress(100)
                  setCurrentStreamingRow(null)

                  // Store in backend
                  const evaluationRuns_current = evaluationRuns[0]
                  if (evaluationRuns_current) {
                    try {
                      evaluationService.storeEvaluationResults({
                        project_id: selectedProjectId,
                        prompt_version: version.version,
                        model_a: llmConfig.modelA.model,
                        model_b: llmConfig.modelB.model,
                        rows: evaluationRuns_current.rows
                      }).catch(err => console.error('Error storing:', err))
                    } catch (err) {
                      console.error('Error storing results:', err)
                    }
                  }
                } else if (data.type === 'error') {
                  alert('❌ Error: ' + data.error)
                  throw new Error(data.error)
                }
              } catch (e) {
                console.error('Error parsing line:', line, e)
              }
            }
          }

          setIsRunning(false)
        } catch (err) {
          alert('Evaluation error: ' + (err instanceof Error ? err.message : 'Unknown error'))
          setIsRunning(false)
        }
      }
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
      setIsRunning(false)
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
        {(!apiKeys.openai || !apiKeys.deepseek) && (
          <div className={styles.apiKeyWarning}>
            ⚠️ Configure API keys in Settings
          </div>
        )}
      </div>

      <div className={styles.header}>
        <h1>🎮 Prompt Playground</h1>
        <p>Upload Excel, configure models, compare prompt versions</p>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'setup' ? styles.active : ''}`} onClick={() => setActiveTab('setup')}>
          1️⃣ Setup
        </button>
        <button className={`${styles.tab} ${activeTab === 'evaluate' ? styles.active : ''}`} onClick={() => setActiveTab('evaluate')}>
          2️⃣ Evaluate
        </button>
        <button className={`${styles.tab} ${activeTab === 'results' ? styles.active : ''}`} onClick={() => setActiveTab('results')}>
          3️⃣ Results
        </button>
      </div>

      {activeTab === 'setup' && (
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <h3>Step 1: Upload Excel Dataset</h3>
            <p className={styles.hint}>Upload Excel with: Question, Expected Answer columns</p>
            <ExcelUpload onUploadSuccess={handleUploadSuccess} />
            {uploadedDataset && (
              <div className={styles.success}>✅ {uploadedDataset.data.length} rows loaded</div>
            )}
          </div>

          <div className={styles.section}>
            <h3>Step 2: Manage Prompt Versions</h3>
            <div className={styles.versionManager}>
              <div className={styles.promptEditor}>
                <label>System Prompt:</label>
                <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={3} />
              </div>

              <div className={styles.promptEditor}>
                <label>User Prompt Template (use {'{Question}'}):</label>
                <textarea value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} rows={3} />
              </div>

              <div className={styles.buttonGroup}>
                <button className={styles.saveVersionBtn} onClick={handleSavePromptVersion}>
                  💾 Save as New Version
                </button>
                <button className={styles.improveBtn} onClick={handleImprovePrompt} disabled={isImprovingPrompt}>
                  {isImprovingPrompt ? '⏳ Improving...' : '✨ Improve Prompt'}
                </button>
                <button className={styles.historyBtn} onClick={() => setShowVersionHistory(!showVersionHistory)}>
                  📜 Versions ({promptVersions.length})
                </button>
              </div>

              {showVersionHistory && (
                <div className={styles.versionHistory}>
                  {promptVersions.map((v) => (
                    <div key={v.id} className={styles.versionItem}>
                      <input
                        type="checkbox"
                        checked={selectedPromptVersions.includes(v.id)}
                        onChange={() => handleTogglePromptVersion(v.id)}
                      />
                      <span onClick={() => handleLoadPromptVersion(v)}>v{v.version} - {v.created_at}</span>
                      {promptVersions.length > 1 && (
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

          <div className={styles.section}>
            <h3>Step 3: Configure Dual LLM Models</h3>
            <LLMConfig onConfigChange={setLlmConfig} />
          </div>
        </div>
      )}

      {activeTab === 'evaluate' && (
        <div className={styles.tabContent}>
          <div className={styles.evaluateCard}>
            {uploadedDataset && llmConfig && selectedPromptVersions.length > 0 && apiKeys.openai && apiKeys.deepseek ? (
              <>
                <h3>Ready to Evaluate</h3>
                <p>📊 Dataset: {uploadedDataset.data.length} questions</p>
                <p>📝 Prompt Versions: {selectedPromptVersions.length}</p>
                <p>🤖 Models: {llmConfig.modelA.model} vs {llmConfig.modelB.model}</p>
                <button className={styles.evaluateBtn} onClick={handleRunEvaluation} disabled={isRunning}>
                  {isRunning ? `⏳ ${progress}%` : '▶️ Start Evaluation'}
                </button>
              </>
            ) : (
              <p className={styles.warning}>❌ Complete Setup first (including API Keys in Settings)</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'results' && (
        <div className={styles.tabContent}>
          {evaluationRuns.length === 0 && !isRunning ? (
            <p>No results yet</p>
          ) : (
            evaluationRuns.map((run, runIdx) => (
              <div key={runIdx} className={styles.evaluationRun}>
                <div className={styles.promptSection}>
                  <h3>📊 Prompt v{run.version} Results</h3>
                  <div className={styles.promptDisplay}>
                    <div className={styles.promptBox}>
                      <p className={styles.promptLabel}>System Prompt:</p>
                      <p className={styles.promptText}>{run.system_prompt}</p>
                    </div>
                    <div className={styles.promptBox}>
                      <p className={styles.promptLabel}>User Prompt:</p>
                      <p className={styles.promptText}>{run.user_prompt}</p>
                    </div>
                  </div>
                  <div className={styles.summaryStats}>
                    <span>⏱️ Total Tokens: {run.total_tokens}</span>
                    <span>💰 Total Cost: ${run.total_cost.toFixed(4)}</span>
                  </div>
                </div>

                {isRunning && (
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
                    <span className={styles.progressText}>{progress}%</span>
                  </div>
                )}

                <div className={styles.resultsTableWrapper}>
                  <table className={styles.resultsTable}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Question</th>
                        <th colSpan={5} style={{textAlign: 'center'}}>{run.model_a}</th>
                        <th colSpan={5} style={{textAlign: 'center'}}>{run.model_b}</th>
                        <th>Winner</th>
                      </tr>
                      <tr>
                        <th></th>
                        <th></th>
                        <th>Response</th>
                        <th>Latency</th>
                        <th>Tokens</th>
                        <th>Cost</th>
                        <th>Accuracy</th>
                        <th>Response</th>
                        <th>Latency</th>
                        <th>Tokens</th>
                        <th>Cost</th>
                        <th>Accuracy</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {run.rows.map((row) => (
                        <tr 
                          key={row.id} 
                          className={`
                            ${currentStreamingRow === row.id ? styles.streaming : ''}
                            ${row.status === 'complete' ? styles.complete : ''}
                            ${row.status === 'pending' ? styles.pending : ''}
                          `}
                        >
                          <td>{row.id}</td>
                          <td className={styles.questionCell}>{row.question}</td>
                          <td className={styles.responseCell}>
                            <div className={styles.responseText}>{row.model_a_response}</div>
                          </td>
                          <td>{row.model_a_latency.toFixed(2)}s</td>
                          <td>{row.model_a_tokens}</td>
                          <td>${row.model_a_cost.toFixed(4)}</td>
                          <td>{(row.model_a_accuracy * 100).toFixed(1)}%</td>
                          <td className={styles.responseCell}>
                            <div className={styles.responseText}>{row.model_b_response}</div>
                          </td>
                          <td>{row.model_b_latency.toFixed(2)}s</td>
                          <td>{row.model_b_tokens}</td>
                          <td>${row.model_b_cost.toFixed(4)}</td>
                          <td>{(row.model_b_accuracy * 100).toFixed(1)}%</td>
                          <td>{row.winner && `🏆 ${row.winner === run.model_a ? 'A' : 'B'}`}</td>
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
