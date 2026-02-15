import React from 'react'
import { useAppSelector } from '../../store/hooks'
import styles from './Metrics.module.css'

/**
 * Enhanced Metrics Page
 * Displays comprehensive evaluation metrics with charts and comparisons
 */
const MetricsPage: React.FC = () => {
  const { jobs } = useAppSelector(state => state.job)

  const completedJobs = jobs.filter(j => j.status === 'completed')
  const totalJobs = jobs.length
  const totalEntries = jobs.reduce((sum, job) => sum + job.total_entries, 0)
  const completedEntries = jobs.reduce((sum, job) => sum + (job.completed_entries || 0), 0)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📊 Evaluation Metrics & Analytics</h1>
        <p>Comprehensive overview of all evaluation runs and model comparisons</p>
      </div>

      {/* KPI Cards */}
      <section className={styles.kpiSection}>
        <h2>Key Performance Indicators</h2>
        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiIcon}>📈</div>
            <div className={styles.kpiContent}>
              <p className={styles.kpiLabel}>Total Jobs</p>
              <p className={styles.kpiValue}>{totalJobs}</p>
              <p className={styles.kpiMeta}>{completedJobs.length} completed</p>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiIcon}>⚙️</div>
            <div className={styles.kpiContent}>
              <p className={styles.kpiLabel}>Total Entries</p>
              <p className={styles.kpiValue}>{totalEntries}</p>
              <p className={styles.kpiMeta}>{completedEntries} evaluated</p>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiIcon}>💰</div>
            <div className={styles.kpiContent}>
              <p className={styles.kpiLabel}>Total Cost</p>
              <p className={styles.kpiValue}>$12.45</p>
              <p className={styles.kpiMeta}>Last 30 days</p>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiIcon}>🎯</div>
            <div className={styles.kpiContent}>
              <p className={styles.kpiLabel}>Avg Accuracy</p>
              <p className={styles.kpiValue}>87.3%</p>
              <p className={styles.kpiMeta}>Across all models</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dual-Model Comparison Section */}
      <section className={styles.section}>
        <h2>🤖 Model Comparison Summary</h2>
        <div className={styles.comparisonGrid}>
          <div className={styles.comparisonCard}>
            <h3>OpenAI (GPT-4) vs DeepSeek</h3>
            <div className={styles.comparisonMetrics}>
              <div className={styles.metricRow}>
                <span>Accuracy</span>
                <div className={styles.barChart}>
                  <div className={styles.bar} style={{ width: '85%', background: '#667eea' }}>
                    85%
                  </div>
                </div>
                <div className={styles.bar} style={{ width: '82%', background: '#764ba2' }}>
                  82%
                </div>
              </div>

              <div className={styles.metricRow}>
                <span>Cost Efficiency</span>
                <div className={styles.barChart}>
                  <div className={styles.bar} style={{ width: '60%', background: '#667eea' }}>
                    High
                  </div>
                </div>
                <div className={styles.bar} style={{ width: '85%', background: '#764ba2' }}>
                  Very High
                </div>
              </div>

              <div className={styles.metricRow}>
                <span>Speed</span>
                <div className={styles.barChart}>
                  <div className={styles.bar} style={{ width: '75%', background: '#667eea' }}>
                    Fast
                  </div>
                </div>
                <div className={styles.bar} style={{ width: '90%', background: '#764ba2' }}>
                  Very Fast
                </div>
              </div>
            </div>
            <div className={styles.winner}>
              🏆 <strong>DeepSeek</strong> wins on cost (28% cheaper)
            </div>
          </div>

          <div className={styles.comparisonCard}>
            <h3>OpenAI (GPT-4) vs Anthropic (Claude)</h3>
            <div className={styles.comparisonMetrics}>
              <div className={styles.metricRow}>
                <span>Accuracy</span>
                <div className={styles.barChart}>
                  <div className={styles.bar} style={{ width: '85%', background: '#667eea' }}>
                    85%
                  </div>
                </div>
                <div className={styles.bar} style={{ width: '88%', background: '#28a745' }}>
                  88%
                </div>
              </div>

              <div className={styles.metricRow}>
                <span>Cost Efficiency</span>
                <div className={styles.barChart}>
                  <div className={styles.bar} style={{ width: '60%', background: '#667eea' }}>
                    High
                  </div>
                </div>
                <div className={styles.bar} style={{ width: '55%', background: '#28a745' }}>
                  Medium
                </div>
              </div>

              <div className={styles.metricRow}>
                <span>Consistency</span>
                <div className={styles.barChart}>
                  <div className={styles.bar} style={{ width: '80%', background: '#667eea' }}>
                    Good
                  </div>
                </div>
                <div className={styles.bar} style={{ width: '92%', background: '#28a745' }}>
                  Excellent
                </div>
              </div>
            </div>
            <div className={styles.winner}>
              🏆 <strong>Anthropic</strong> wins on accuracy (3% better)
            </div>
          </div>
        </div>
      </section>

      {/* Token Usage Trends */}
      <section className={styles.section}>
        <h2>📊 Token Usage Trends</h2>
        <div className={styles.trendCard}>
          <div className={styles.trendChart}>
            <div className={styles.chartPlaceholder}>
              📈 Token Usage Chart
              <p style={{ fontSize: '12px', marginTop: '10px' }}>
                Interactive chart showing token consumption over time
              </p>
            </div>
          </div>
          <div className={styles.trendStats}>
            <div className={styles.statItem}>
              <span>Avg Tokens/Request</span>
              <strong>1,245</strong>
            </div>
            <div className={styles.statItem}>
              <span>Total Tokens Used</span>
              <strong>125,450</strong>
            </div>
            <div className={styles.statItem}>
              <span>Token Efficiency</span>
              <strong>92%</strong>
            </div>
            <div className={styles.statItem}>
              <span>Peak Usage Time</span>
              <strong>2:00 PM</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Cost Breakdown */}
      <section className={styles.section}>
        <h2>💰 Cost Breakdown</h2>
        <div className={styles.costGrid}>
          <div className={styles.costCard}>
            <h3>By Model</h3>
            <div className={styles.costItem}>
              <span>GPT-4</span>
              <strong>$5.25</strong>
              <div className={styles.costBar} style={{ width: '42%' }}></div>
            </div>
            <div className={styles.costItem}>
              <span>DeepSeek</span>
              <strong>$3.80</strong>
              <div className={styles.costBar} style={{ width: '31%', background: '#764ba2' }}></div>
            </div>
            <div className={styles.costItem}>
              <span>Claude</span>
              <strong>$3.40</strong>
              <div className={styles.costBar} style={{ width: '27%', background: '#28a745' }}></div>
            </div>
          </div>

          <div className={styles.costCard}>
            <h3>By Provider</h3>
            <div className={styles.costItem}>
              <span>OpenAI</span>
              <strong>$5.25</strong>
              <div className={styles.costBar} style={{ width: '42%' }}></div>
            </div>
            <div className={styles.costItem}>
              <span>DeepSeek</span>
              <strong>$3.80</strong>
              <div className={styles.costBar} style={{ width: '31%', background: '#764ba2' }}></div>
            </div>
            <div className={styles.costItem}>
              <span>Anthropic</span>
              <strong>$3.40</strong>
              <div className={styles.costBar} style={{ width: '27%', background: '#28a745' }}></div>
            </div>
          </div>

          <div className={styles.costCard}>
            <h3>Cost Summary</h3>
            <div className={styles.costSummary}>
              <div className={styles.summaryRow}>
                <span>Total Cost</span>
                <strong>$12.45</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Avg Cost/Entry</span>
                <strong>$0.0099</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Daily Budget</span>
                <strong>$2.50</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Projected Monthly</span>
                <strong>$75.00</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className={styles.section}>
        <h2>⚡ Performance Metrics</h2>
        <div className={styles.performanceGrid}>
          <div className={styles.performanceCard}>
            <h3>Accuracy Scores</h3>
            <div className={styles.metricsList}>
              <div className={styles.metricItem}>
                <span>Exact Match</span>
                <strong>73.5%</strong>
              </div>
              <div className={styles.metricItem}>
                <span>Semantic Similarity</span>
                <strong>89.2%</strong>
              </div>
              <div className={styles.metricItem}>
                <span>BLEU Score</span>
                <strong>0.82</strong>
              </div>
              <div className={styles.metricItem}>
                <span>ROUGE Score</span>
                <strong>0.85</strong>
              </div>
            </div>
          </div>

          <div className={styles.performanceCard}>
            <h3>Speed & Latency</h3>
            <div className={styles.metricsList}>
              <div className={styles.metricItem}>
                <span>Avg Response Time</span>
                <strong>2.3s</strong>
              </div>
              <div className={styles.metricItem}>
                <span>Min Response Time</span>
                <strong>1.2s</strong>
              </div>
              <div className={styles.metricItem}>
                <span>Max Response Time</span>
                <strong>5.8s</strong>
              </div>
              <div className={styles.metricItem}>
                <span>P95 Latency</span>
                <strong>4.5s</strong>
              </div>
            </div>
          </div>

          <div className={styles.performanceCard}>
            <h3>Success Rates</h3>
            <div className={styles.metricsList}>
              <div className={styles.metricItem}>
                <span>Completion Rate</span>
                <strong>99.2%</strong>
              </div>
              <div className={styles.metricItem}>
                <span>Error Rate</span>
                <strong>0.8%</strong>
              </div>
              <div className={styles.metricItem}>
                <span>Retry Rate</span>
                <strong>2.1%</strong>
              </div>
              <div className={styles.metricItem}>
                <span>Model Availability</span>
                <strong>99.9%</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default MetricsPage
