export interface User {
  id: string
  email: string
  name: string
  created_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  access_token: string
  refresh_token: string
  expires_in: number
  token?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  isLoading: boolean
  error: string | null
  token: string | null
  refreshToken: string | null
  expiresIn: number | null
  sessionExpiredAt: number | null
}
