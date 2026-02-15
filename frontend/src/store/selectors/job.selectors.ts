import { RootState } from '../store'

export const selectJobs = (state: RootState) => state.job.jobs

export const selectCurrentJob = (state: RootState) => state.job.currentJob

export const selectSelectedJob = (state: RootState) => state.job.selectedJob

export const selectJobEntries = (state: RootState) => state.job.jobEntries

export const selectJobIsLoading = (state: RootState) => state.job.loading || state.job.isLoading

export const selectJobError = (state: RootState) => state.job.error

export const selectJobPagination = (state: RootState) => state.job.pagination
