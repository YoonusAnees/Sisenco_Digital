import { apiClient } from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { User } from '@/types/user';

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  department?: string;
  jobTitle?: string;
}

export interface RegisterAdminPayload extends RegisterPayload {
  adminSetupSecret?: string;
}

export const authApi = {
  async login(payload: LoginPayload): Promise<{ user: User }> {
    const response = await apiClient.post<ApiResponse<{ user: User }>>('/auth/login', payload);
    return response.data.data!;
  },

  async register(payload: RegisterPayload): Promise<{ user: User }> {
    const response = await apiClient.post<ApiResponse<{ user: User }>>('/auth/register', payload);
    return response.data.data!;
  },

  async registerAdmin(payload: RegisterAdminPayload): Promise<{ user: User }> {
    const { adminSetupSecret, ...body } = payload;
    const response = await apiClient.post<ApiResponse<{ user: User }>>(
      '/auth/register-admin',
      body,
      {
        headers: adminSetupSecret ? { 'x-admin-setup-secret': adminSetupSecret } : {},
      }
    );
    return response.data.data!;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async getCurrentUser(): Promise<{ user: User }> {
    const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data.data!;
  },
};
