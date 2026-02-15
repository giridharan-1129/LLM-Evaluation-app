import React, { useEffect, useState } from 'react'
import styles from './Metrics.module.css'

interface EvaluationEntry {
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

interface Evaluation {
  id: string
  project_id: string
  prompt_version: string
  model_a: string
  model_b: string
  created_at: string
  total_entries: number
  entries: EvaluationEntry[]
}

interface Filter {
  project_id: string
  prompt_version: string
}

interface ComparisonStats {
  version: string
  avgAccuracy: number
  totalTokens: number
  totalCost: number
  avgLatency: number
  winRate: { modelA: number; modelB: number }
}

const MetricsPage: React.FC = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [filteredEvaluations, setFilteredEvaluations] = useState<Evaluation[]>([])
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null)
  const [filter, setFilter] = useState<Filter>({ project_id: '', prompt_version: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [comparisonStats, setComparisonStats] = useState<ComparisonStats[]>([])

  // Get selected project from localStorage
  const selectedProjectId = localStorage.getItem('selectedProjectId')

  // Fetch evaluations from backend
  useEffect(() => {
    const fetchEvaluations = async () => {
      if (!selectedProjectId) {
        setEvaluations([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(
          `http://localhost:8000/api/v1/evaluation-results/project/${selectedProjectId}`
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch evaluations')
        }

        const data = await response.json()
        setEvaluations(data)
        setFilteredEvaluations(data)
        
        if (data.length > 0) {
          setSelectedEvaluation(data[0])
        }

        // Calculate comparison stats
        const stats = calculateComparisonStats(data)
        setComparisonStats(stats)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching evaluations')
      } finally {
        setLoading(false)
      }
    }

    fetchEvaluations()
  }, [selectedProjectId])

  // Apply filters
  useEffect(() => {
    let filtered = evaluations

    if (filter.prompt_version) {
      filtered = filtered.filter(e => e.prompt_version === filter.prompt_version)
    }

    setFilteredEvaluations(filtered)
    if (filtered.length > 0 && !filtered.includes(selectedEvaluation!)) {
      setSelectedEvaluation(filtered[0])
    }
  }, [filter, evaluations, selectedEvaluation])

  const calculateComparisonStats = (evals: Evaluation[]): ComparisonStats[] => {
    const statsByVersion: { [key: string]: ComparisonStats } = {}

    evals.forEach(evaluation => {
      const version = evaluation.prompt_version
      
      if (!statsByVersion[version]) {
        statsByVersion[version] = {
          version,
          avgAccuracy: 0,
          totalTokens: 0,
          totalCost: 0,
          avgLatency: 0,
          winRate: { modelA: 0, modelB: 0 }
        }
      }

      const stats = statsByVersion[version]
      const entries = evaluation.entries

      // Calculate averages
      const totalAccuracy = entries.reduce((sum, e) => sum + (e.model_a_accuracy + e.model_b_accuracy) / 2, 0)
      const totalLatency = entries.reduce((sum, e) => sum + (e.model_a_latency + e.model_b_latency) / 2, 0)
      const totalTokens = entries.reduce((sum, e) => sum + e.model_a_tokens + e.model_b_tokens, 0)
      const totalCost = entries.reduce((sum, e) => sum + e.model_a_cost + e.model_b_cost, 0)

      stats.avgAccuracy = totalAccuracy / entries.length
      stats.avgLatency = totalLatency / entries.length
      stats.totalTokens = totalTokens
      stats.totalCost = totalCost

      // Calculate win rates
      const modelAWins = entries.filter(e => e.winner === evaluation.model_a).length
      const modelBWins = entries.filter(e => e.winner === evaluation.model_b).length
      stats.winRate.modelA = (modelAWins / entries.length) * 100
      stats.winRate.modelB = (modelBWins / entries.length) * 100
    })

    return Object.values(statsByVersion)
  }

  const versions = Array.from(new Set(evaluations.map(e => e.prompt_version)))

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading evaluations...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>❌ {error}</div>
      </div>
    )
  }

  if (!selectedProjectId) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p>📁 Select a project in Playground to view metrics</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📊 Metrics & Analytics</h1>
        <p>View and compare metrics from all your evaluations</p>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon}>⚡</div>
          <div className={styles.kpiContent}>
            <p className={styles.kpiLabel}>Total Evaluations</p>
            <p className={styles.kpiValue}>{evaluations.length}</p>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon}>📝</div>
          <div className={styles.kpiContent}>
            <p className={styles.kpiLabel}>Total Rows</p>
            <p className={styles.kpiValue}>{evaluations.reduce((sum, e) => sum + e.total_entries, 0)}</p>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon}>🎯</div>
          <div className={styles.kpiContent}>
            <p className={styles.kpiLabel}>Avg Accuracy</p>
            <p className={styles.kpiValue}>
              {evaluations.length > 0
                ? ((evaluations.reduce((sum, e) => sum + e.entries.reduce((s, en) => s + (en.model_a_accuracy + en.model_b_accuracy) / 2, 0), 0) / evaluations.reduce((sum, e) => sum + e.entries.length, 0)) * 100).toFixed(1)
                : 0}%
            </p>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon}>💰</div>
          <div className={styles.kpiContent}>
            <p className={styles.kpiLabel}>Total Cost</p>
            <p className={styles.kpiValue}>
              ${evaluations.reduce((sum, e) => sum + e.entries.reduce((s, en) => s + en.model_a_cost + en.model_b_cost, 0), 0).toFixed(4)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filterSection}>
        <h2>🔍 Filters</h2>
        <div className={styles.filterGrid}>
          <div className={styles.filterGroup}>
            <label htmlFor="version-filter">Prompt Version</label>
            <select
              id="version-filter"
              value={filter.prompt_version}
              onChange={(e) => setFilter(prev => ({ ...prev, prompt_version: e.target.value }))}
              className={styles.select}
            >
              <option value="">All Versions</option>
              {versions.map(v => (
                <option key={v} value={v}>v{v}</option>
              ))}
            </select>
          </div>

          <button
            className={styles.resetBtn}
            onClick={() => setFilter({ project_id: '', prompt_version: '' })}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Comparison Stats by Version */}
      {comparisonStats.length > 0 && (
        <div className={styles.comparisonSection}>
          <h2>📈 Prompt Version Comparison</h2>
          <div className={styles.comparisonGrid}>
            {comparisonStats.map(stat => (
              <div key={stat.version} className={styles.comparisonCard}>
                <h3>v{stat.version}</h3>
                <div className={styles.statRow}>
                  <span>Avg Accuracy:</span>
                  <span className={styles.value}>{(stat.avgAccuracy * 100).toFixed(1)}%</span>
                </div>
                <div className={styles.statRow}>
                  <span>Avg Latency:</span>
                  <span className={styles.value}>{stat.avgLatency.toFixed(2)}s</span>
                </div>
                <div className={styles.statRow}>
                  <span>Total Tokens:</span>
                  <span className={styles.value}>{stat.totalTokens}</span>
                </div>
                <div className={styles.statRow}>
                  <span>Total Cost:</span>
                  <span className={styles.value}>${stat.totalCost.toFixed(4)}</span>
                </div>
                <div className={styles.statRow}>
                  <span>Model A Win Rate:</span>
                  <span className={styles.value}>{stat.winRate.modelA.toFixed(0)}%</span>
                </div>
                <div className={styles.statRow}>
                  <span>Model B Win Rate:</span>
                  <span className={styles.value}>{stat.winRate.modelB.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evaluations List */}
      <div className={styles.evaluationsSection}>
        <h2>📋 Evaluations</h2>
        {filteredEvaluations.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No evaluations found. Run an evaluation to see results here.</p>
          </div>
        ) : (
          <div className={styles.evaluationsList}>
            {filteredEvaluations.map(evaluation => (
              <div
                key={evaluation.id}
                className={`${styles.evaluationItem} ${selectedEvaluation?.id === evaluation.id ? styles.selected : ''}`}
                onClick={() => setSelectedEvaluation(evaluation)}
              >
                <div className={styles.evalHeader}>
                  <div className={styles.evalInfo}>
                    <h3>v{evaluation.prompt_version} - {evaluation.model_a} vs {evaluation.model_b}</h3>
                    <p className={styles.evalMeta}>{evaluation.created_at}</p>
                  </div>
                  <div className={styles.evalMetrics}>
                    <span className={styles.metric}>📊 {evaluation.total_entries} rows</span>
                    <span className={styles.metric}>🎯 {(evaluation.entries.reduce((sum, e) => sum + (e.model_a_accuracy + e.model_b_accuracy) / 2, 0) / evaluation.entries.length * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Evaluation Details */}
      {selectedEvaluation && (
        <div className={styles.detailsSection}>
          <h2>📋 Details: v{selectedEvaluation.prompt_version}</h2>
          
          <div className={styles.detailsTableWrapper}>
            <table className={styles.detailsTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Question</th>
                  <th colSpan={5} style={{textAlign: 'center'}}>{selectedEvaluation.model_a}</th>
                  <th colSpan={5} style={{textAlign: 'center'}}>{selectedEvaluation.model_b}</th>
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
                {selectedEvaluation.entries.map((entry, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td className={styles.questionCell}>{entry.question}</td>
                    <td className={styles.responseCell}>
                      <div className={styles.responseText}>{entry.model_a_response}</div>
                    </td>
                    <td>{entry.model_a_latency.toFixed(2)}s</td>
                    <td>{entry.model_a_tokens}</td>
                    <td>${entry.model_a_cost.toFixed(4)}</td>
                    <td>{(entry.model_a_accuracy * 100).toFixed(1)}%</td>
                    <td className={styles.responseCell}>
                      <div className={styles.responseText}>{entry.model_b_response}</div>
                    </td>
                    <td>{entry.model_b_latency.toFixed(2)}s</td>
                    <td>{entry.model_b_tokens}</td>
                    <td>${entry.model_b_cost.toFixed(4)}</td>
                    <td>{(entry.model_b_accuracy * 100).toFixed(1)}%</td>
                    <td>🏆 {entry.winner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default MetricsPage
