import { apiClient } from '../client';
import type { LoginCredentials, RegisterCredentials, AuthResponse } from '../../store/types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await apiClient.post('/auth/login', credentials);
    return data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { data } = await apiClient.post('/auth/register', credentials);
    return data;
  },

  async refreshToken(token: string): Promise<AuthResponse> {
    const { data } = await apiClient.post('/auth/refresh', { token });
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },
};
