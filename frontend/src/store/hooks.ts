import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();

export const useAppSelector = <T>(selector: (state: RootState) => T): T => {
  return useSelector<RootState, T>(selector);
};

export const useAuth = () => {
  return {
    isAuthenticated: useAppSelector((state) => state.auth.isAuthenticated),
    user: useAppSelector((state) => state.auth.user),
    token: useAppSelector((state) => state.auth.token),
    error: useAppSelector((state) => state.auth.error),
    isLoading: useAppSelector((state) => state.auth.isLoading),
  };
};

export const useProject = () => {
  return {
    projects: useAppSelector((state) => state.project.projects),
    selectedProject: useAppSelector((state) => state.project.selectedProject),
    isLoading: useAppSelector((state) => state.project.isLoading),
    error: useAppSelector((state) => state.project.error),
  };
};

export const usePrompt = () => {
  return {
    prompts: useAppSelector((state) => state.prompt.prompts),
    selectedPrompt: useAppSelector((state) => state.prompt.selectedPrompt),
    selectedVersion: useAppSelector((state) => state.prompt.selectedVersion),
    isLoading: useAppSelector((state) => state.prompt.isLoading),
    error: useAppSelector((state) => state.prompt.error),
  };
};

export const useJob = () => {
  return {
    jobs: useAppSelector((state) => state.job.jobs),
    selectedJob: useAppSelector((state) => state.job.selectedJob),
    jobEntries: useAppSelector((state) => state.job.jobEntries),
    isLoading: useAppSelector((state) => state.job.isLoading),
    error: useAppSelector((state) => state.job.error),
  };
};

export const useMetrics = () => {
  return {
    jobMetrics: useAppSelector((state) => state.metrics.jobMetrics),
    selectedJobMetrics: useAppSelector((state) => state.metrics.selectedJobMetrics),
    projectMetrics: useAppSelector((state) => state.metrics.projectMetrics),
    isLoading: useAppSelector((state) => state.metrics.isLoading),
    error: useAppSelector((state) => state.metrics.error),
  };
};

export const useUI = () => {
  return {
    notifications: useAppSelector((state) => state.ui.notifications),
    modals: useAppSelector((state) => state.ui.modals),
    sidebarOpen: useAppSelector((state) => state.ui.sidebarOpen),
    theme: useAppSelector((state) => state.ui.theme),
    loading: useAppSelector((state) => state.ui.loading),
  };
};
