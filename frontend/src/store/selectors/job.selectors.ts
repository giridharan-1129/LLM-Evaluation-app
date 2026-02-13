import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../store'

export const selectAllJobs = (state: RootState) => state.job.jobs
export const selectSelectedJob = (state: RootState) => state.job.selectedJob
export const selectJobEntries = (state: RootState) => state.job.jobEntries
export const selectJobIsLoading = (state: RootState) => state.job.isLoading
export const selectJobError = (state: RootState) => state.job.error
export const selectJobPagination = (state: RootState) => state.job.pagination

export const selectJobsByProject = (projectId: string) =>
  createSelector([selectAllJobs], (jobs) =>
    jobs.filter((j) => j.project_id === projectId)
  )

export const selectJobById = (jobId: string) =>
  createSelector([selectAllJobs], (jobs) =>
    jobs.find((j) => j.id === jobId)
  )
