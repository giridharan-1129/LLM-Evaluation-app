/**
 * Metrics State Types
 * Manages evaluation metrics and analytics
 */

export interface MetricsData {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export interface CostMetrics {
  totalCost: number;
  averageCostPerEntry: number;
  costByModel: Record<string, number>;
  costByPrompt: Record<string, number>;
}

export interface TokenMetrics {
  totalTokensUsed: number;
  averageTokensPerEntry: number;
  tokensByModel: Record<string, number>;
  tokensByPrompt: Record<string, number>;
}

export interface PerformanceMetrics {
  averageLatency: number;
  minLatency: number;
  maxLatency: number;
  latencyByModel: Record<string, number>;
}

export interface JobMetrics {
  jobId: string;
  projectId: string;
  metrics: MetricsData;
  cost: CostMetrics;
  tokens: TokenMetrics;
  performance: PerformanceMetrics;
  createdAt: string;
}

export interface MetricsState {
  jobMetrics: JobMetrics[];
  selectedJobMetrics: JobMetrics | null;
  projectMetrics: ProjectMetricsAggregate | null;
  isLoading: boolean;
  error: string | null;
}

export interface ProjectMetricsAggregate {
  projectId: string;
  totalJobs: number;
  averageAccuracy: number;
  totalCost: number;
  totalTokensUsed: number;
  topPerformingModel: string | null;
  topPerformingPrompt: string | null;
}
