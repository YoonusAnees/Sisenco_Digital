import { apiClient } from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { User, UserListResponseData, CreateUserPayload, UpdateUserPayload } from '@/types/user';
import { UserRole } from '@/constants/roles';

export interface GetUsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  department?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLoginAt';
  sortOrder?: 'asc' | 'desc';
}

export const userApi = {
  async getUsers(params: GetUsersQueryParams = {}): Promise<UserListResponseData> {
    const response = await apiClient.get<ApiResponse<UserListResponseData>>('/users', {
      params: {
        ...params,
        isActive: params.isActive !== undefined ? String(params.isActive) : undefined,
      },
    });
    return response.data.data!;
  },

  async getUserById(userId: string): Promise<{ user: User }> {
    const response = await apiClient.get<ApiResponse<{ user: User }>>(`/users/${userId}`);
    return response.data.data!;
  },

  async createUser(payload: CreateUserPayload): Promise<{ user: User }> {
    const response = await apiClient.post<ApiResponse<{ user: User }>>('/users', payload);
    return response.data.data!;
  },

  async updateUser(userId: string, payload: UpdateUserPayload): Promise<{ user: User }> {
    const response = await apiClient.patch<ApiResponse<{ user: User }>>(`/users/${userId}`, payload);
    return response.data.data!;
  },

  async changeUserRole(userId: string, role: UserRole): Promise<{ user: User }> {
    const response = await apiClient.patch<ApiResponse<{ user: User }>>(`/users/${userId}/role`, { role });
    return response.data.data!;
  },

  async changeUserStatus(userId: string, isActive: boolean): Promise<{ user: User }> {
    const response = await apiClient.patch<ApiResponse<{ user: User }>>(`/users/${userId}/status`, { isActive });
    return response.data.data!;
  },
};
