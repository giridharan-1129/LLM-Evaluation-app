/**
 * Job State Types
 * Manages evaluation job execution and tracking
 */

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface EvaluationEntry {
  id: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  isCorrect: boolean;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  latency: number;
  createdAt: string;
}

export interface EvaluationJob {
  id: string;
  projectId: string;
  promptVersionId: string;
  modelId: string;
  name: string;
  description: string;
  status: JobStatus;
  totalEntries: number;
  processedEntries: number;
  failedEntries: number;
  progress: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobState {
  jobs: EvaluationJob[];
  selectedJob: EvaluationJob | null;
  jobEntries: EvaluationEntry[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface CreateJobPayload {
  projectId: string;
  promptVersionId: string;
  modelId: string;
  name: string;
  description: string;
  dataFile: File;
}

export interface UpdateJobProgressPayload {
  jobId: string;
  processedEntries: number;
  totalEntries: number;
}
