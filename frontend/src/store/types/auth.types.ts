export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'user' | 'viewer'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: AuthUser
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  name: string
  confirm_password: string
}

export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: AuthUser | null
  token: string | null
  refreshToken: string | null
  error: string | null
  expiresIn: number | null
  sessionExpiredAt: number | null
}

// Export User as alias for AuthUser (for backwards compatibility)
export type User = AuthUser
