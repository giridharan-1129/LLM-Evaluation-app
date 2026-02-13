import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { JobState, EvaluationJob, EvaluationEntry, UpdateJobProgressPayload } from '../types'

const initialState: JobState = {
  jobs: [],
  selectedJob: null,
  jobEntries: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
}

const jobSlice = createSlice({
  name: 'job',
  initialState,
  reducers: {
    setJobs: (state, action: PayloadAction<EvaluationJob[]>) => {
      state.jobs = action.payload
    },

    selectJob: (state, action: PayloadAction<EvaluationJob>) => {
      state.selectedJob = action.payload
    },

    addJob: (state, action: PayloadAction<EvaluationJob>) => {
      state.jobs.push(action.payload)
    },

    updateJobProgress: (state, action: PayloadAction<UpdateJobProgressPayload>) => {
      const job = state.jobs.find((j) => j.id === action.payload.job_id)
      if (job) {
        job.progress = action.payload.progress
        job.completed_entries = action.payload.completed_entries
      }
    },

    setJobEntries: (state, action: PayloadAction<EvaluationEntry[]>) => {
      state.jobEntries = action.payload
    },

    setJobLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },

    setJobError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },

    setPagination: (
      state,
      action: PayloadAction<{ page: number; limit: number; total: number }>
    ) => {
      state.pagination = action.payload
    },
  },
})

export const {
  setJobs,
  selectJob,
  addJob,
  updateJobProgress,
  setJobEntries,
  setJobLoading,
  setJobError,
  setPagination,
} = jobSlice.actions

export default jobSlice.reducer
