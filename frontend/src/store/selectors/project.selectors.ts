import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../store'

const selectProjectState = (state: RootState) => state.project

export const selectAllProjects = createSelector(
  [selectProjectState],
  (project) => project.projects,
)

export const selectSelectedProject = createSelector(
  [selectProjectState],
  (project) => project.selectedProject,
)

export const selectProjectIsLoading = createSelector(
  [selectProjectState],
  (project) => project.isLoading,
)

export const selectProjectError = createSelector([selectProjectState], (project) => project.error)

export const selectProjectPagination = createSelector(
  [selectProjectState],
  (project) => project.pagination,
)

export const selectProjectById = (projectId: string) =>
  createSelector([selectAllProjects], (projects) =>
    projects.find((p) => p.id === projectId),
  )

export const selectActiveProjects = createSelector([selectAllProjects], (projects) =>
  projects.filter((p) => p.is_active),
)
