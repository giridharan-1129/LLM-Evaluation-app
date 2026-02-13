import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ProjectState, Project } from '../types';

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
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    fetchProjectsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    fetchProjectsSuccess: (
      state,
      action: PayloadAction<{ projects: Project[]; total: number }>
    ) => {
      state.isLoading = false;
      state.projects = action.payload.projects;
      state.pagination.total = action.payload.total;
      state.error = null;
    },

    fetchProjectsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    createProjectStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    createProjectSuccess: (state, action: PayloadAction<Project>) => {
      state.isLoading = false;
      state.projects.unshift(action.payload);
      state.pagination.total += 1;
      state.error = null;
    },

    createProjectFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    selectProject: (state, action: PayloadAction<Project>) => {
      state.selectedProject = action.payload;
    },

    updateProjectSuccess: (state, action: PayloadAction<Project>) => {
      const index = state.projects.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
      if (state.selectedProject?.id === action.payload.id) {
        state.selectedProject = action.payload;
      }
    },

    deleteProjectSuccess: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
      state.pagination.total -= 1;
      if (state.selectedProject?.id === action.payload) {
        state.selectedProject = null;
      }
    },

    setPagination: (state, action: PayloadAction<{ page: number; limit: number }>) => {
      state.pagination.page = action.payload.page;
      state.pagination.limit = action.payload.limit;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchProjectsStart,
  fetchProjectsSuccess,
  fetchProjectsFailure,
  createProjectStart,
  createProjectSuccess,
  createProjectFailure,
  selectProject,
  updateProjectSuccess,
  deleteProjectSuccess,
  setPagination,
  clearError,
} = projectSlice.actions;

export default projectSlice.reducer;
