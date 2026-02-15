// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

// Auth Endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  REFRESH: `${API_BASE_URL}/auth/refresh`,
  ME: `${API_BASE_URL}/auth/me`,
}

// Project Endpoints
export const PROJECT_ENDPOINTS = {
  LIST: `${API_BASE_URL}/projects`,
  CREATE: `${API_BASE_URL}/projects`,
  GET: (id: string) => `${API_BASE_URL}/projects/${id}`,
  UPDATE: (id: string) => `${API_BASE_URL}/projects/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/projects/${id}`,
}

// Prompt Endpoints
export const PROMPT_ENDPOINTS = {
  LIST: (projectId: string) => `${API_BASE_URL}/prompts/project/${projectId}`,
  GET: (id: string) => `${API_BASE_URL}/prompts/${id}`,
  CREATE: `${API_BASE_URL}/prompts`,
  UPDATE: (id: string) => `${API_BASE_URL}/prompts/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/prompts/${id}`,
  IMPROVE: (id: string) => `${API_BASE_URL}/prompts/${id}/improve`,
}

// Evaluation Endpoints
export const EVALUATION_ENDPOINTS = {
  STORE: `${API_BASE_URL}/evaluation-results/store`,
  GET_PROJECT: (projectId: string) => `${API_BASE_URL}/evaluation-results/project/${projectId}`,
}

// Dataset Endpoints
export const DATASET_ENDPOINTS = {
  UPLOAD: `${API_BASE_URL}/datasets/upload`,
  LIST: (projectId: string) => `${API_BASE_URL}/datasets/project/${projectId}`,
  GET: (id: string) => `${API_BASE_URL}/datasets/${id}`,
}

// Metrics Endpoints
export const METRICS_ENDPOINTS = {
  GET: (projectId: string) => `${API_BASE_URL}/metrics/project/${projectId}`,
  COMPARE: `${API_BASE_URL}/metrics/compare`,
}

export { API_BASE_URL }
