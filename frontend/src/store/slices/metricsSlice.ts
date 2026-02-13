import { createSlice } from '@reduxjs/toolkit'
import { fetchJobMetrics, fetchProjectMetrics, fetchMultipleJobMetrics } from '../thunks'
import type { MetricsState } from '../types'

const initialState: MetricsState = {
  jobMetrics: [],
  selectedJobMetrics: null,
  projectMetrics: null,
  isLoading: false,
  error: null,
}

const metricsSlice = createSlice({
  name: 'metrics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobMetrics.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchJobMetrics.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedJobMetrics = action.payload
      })
      .addCase(fetchJobMetrics.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(fetchProjectMetrics.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProjectMetrics.fulfilled, (state, action) => {
        state.isLoading = false
        state.projectMetrics = action.payload
      })
      .addCase(fetchProjectMetrics.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(fetchMultipleJobMetrics.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMultipleJobMetrics.fulfilled, (state, action) => {
        state.isLoading = false
        state.jobMetrics = action.payload.metrics || []
      })
      .addCase(fetchMultipleJobMetrics.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export default metricsSlice.reducer
