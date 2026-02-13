import { createSlice } from '@reduxjs/toolkit'
import { fetchProjects, fetchProjectById, createProject, updateProject, deleteProject } from '../thunks'
import type { ProjectState } from '../types'

const initialState: ProjectState = {
  projects: [],
  selectedProject: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
}

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    selectProject: (state, action) => {
      state.selectedProject = action.payload
    },
  },
  extraReducers: (builder) => {
    // Fetch Projects
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false
        state.projects = action.payload.projects || []
        state.pagination = action.payload.pagination || state.pagination
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch Project By ID
    builder
      .addCase(fetchProjectById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedProject = action.payload
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Create Project
    builder
      .addCase(createProject.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isLoading = false
        state.projects.push(action.payload)
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Update Project
    builder
      .addCase(updateProject.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.projects.findIndex((p) => p.id === action.payload.id)
        if (index !== -1) {
          state.projects[index] = action.payload
        }
        if (state.selectedProject?.id === action.payload.id) {
          state.selectedProject = action.payload
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Delete Project
    builder
      .addCase(deleteProject.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.isLoading = false
        state.projects = state.projects.filter((p) => p.id !== action.payload)
        if (state.selectedProject?.id === action.payload) {
          state.selectedProject = null
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { selectProject } = projectSlice.actions
export default projectSlice.reducer
