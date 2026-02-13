import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';

const selectJobState = (state: RootState) => state.job;

export const selectAllJobs = createSelector([selectJobState], (job) => job.jobs);

export const selectSelectedJob = createSelector([selectJobState], (job) => job.selectedJob);

export const selectJobEntries = createSelector([selectJobState], (job) => job.jobEntries);

export const selectJobIsLoading = createSelector([selectJobState], (job) => job.isLoading);

export const selectJobError = createSelector([selectJobState], (job) => job.error);

export const selectJobPagination = createSelector([selectJobState], (job) => job.pagination);

export const selectJobsByProjectId = (projectId: string) =>
  createSelector([selectAllJobs], (jobs) => jobs.filter((j) => j.projectId === projectId));

export const selectJobsByStatus = (status: string) =>
  createSelector([selectAllJobs], (jobs) => jobs.filter((j) => j.status === status));

export const selectJobProgress = createSelector([selectSelectedJob], (job) => job?.progress ?? 0);

export const selectJobEntryCount = createSelector([selectJobEntries], (entries) => entries.length);
