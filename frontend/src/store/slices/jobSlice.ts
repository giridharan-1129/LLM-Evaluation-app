import { createSlice } from '@reduxjs/toolkit'
import { fetchJobsByProject, fetchJobById, createJob, cancelJob } from '../thunks'
import type { JobState } from '../types'

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
    selectJob: (state, action) => {
      state.selectedJob = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobsByProject.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchJobsByProject.fulfilled, (state, action) => {
        state.isLoading = false
        state.jobs = action.payload.jobs || []
      })
      .addCase(fetchJobsByProject.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(fetchJobById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedJob = action.payload
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(createJob.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.isLoading = false
        state.jobs.push(action.payload)
      })
      .addCase(createJob.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(cancelJob.pending, (state) => {
        state.isLoading = true
      })
      .addCase(cancelJob.fulfilled, (state, action) => {
        state.isLoading = false
        if (state.selectedJob?.id === action.payload.id) {
          state.selectedJob = action.payload
        }
      })
      .addCase(cancelJob.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { selectJob } = jobSlice.actions
export default jobSlice.reducer
