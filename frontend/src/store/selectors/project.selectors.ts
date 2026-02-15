import { RootState } from '../store'

export const selectProjects = (state: RootState) => state.project.projects

export const selectCurrentProject = (state: RootState) => state.project.currentProject

export const selectSelectedProject = (state: RootState) => state.project.selectedProject

export const selectProjectIsLoading = (state: RootState) => state.project.loading || state.project.isLoading

export const selectProjectError = (state: RootState) => state.project.error

export const selectProjectPagination = (state: RootState) => state.project.pagination

export const selectActiveProjects = (state: RootState) =>
  state.project.projects.filter((p) => p.is_active !== false)
