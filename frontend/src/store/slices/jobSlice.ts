import { createSlice } from '@reduxjs/toolkit'
import { fetchJobsByProject, fetchJobById, createJob, cancelJob } from '../thunks'
import type { JobState } from '../types'

const initialState: JobState = {
  jobs: [],
  currentJob: null,
  selectedJob: null,
  jobEntries: [],
  loading: false,
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
    selectJob: (state, action) => {
      state.selectedJob = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobsByProject.pending, (state) => {
        state.isLoading = true
        state.loading = true
        state.error = null
      })
      .addCase(fetchJobsByProject.fulfilled, (state, action) => {
        state.isLoading = false
        state.loading = false
        state.jobs = action.payload.jobs || []
      })
      .addCase(fetchJobsByProject.rejected, (state, action) => {
        state.isLoading = false
        state.loading = false
        state.error = action.payload as string
      })

    builder
      .addCase(fetchJobById.pending, (state) => {
        state.isLoading = true
        state.loading = true
        state.error = null
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.isLoading = false
        state.loading = false
        state.currentJob = action.payload
        state.selectedJob = action.payload
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.isLoading = false
        state.loading = false
        state.error = action.payload as string
      })

    builder
      .addCase(createJob.pending, (state) => {
        state.isLoading = true
        state.loading = true
        state.error = null
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.isLoading = false
        state.loading = false
        state.jobs.push(action.payload)
      })
      .addCase(createJob.rejected, (state, action) => {
        state.isLoading = false
        state.loading = false
        state.error = action.payload as string
      })

    builder
      .addCase(cancelJob.pending, (state) => {
        state.isLoading = true
        state.loading = true
      })
      .addCase(cancelJob.fulfilled, (state, action) => {
        state.isLoading = false
        state.loading = false
        if (state.selectedJob?.id === action.payload.id) {
          state.selectedJob = action.payload
        }
        if (state.currentJob?.id === action.payload.id) {
          state.currentJob = action.payload
        }
      })
      .addCase(cancelJob.rejected, (state, action) => {
        state.isLoading = false
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { selectJob } = jobSlice.actions
export default jobSlice.reducer
