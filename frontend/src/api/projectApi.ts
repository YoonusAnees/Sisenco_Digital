import { apiClient } from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import {
  Project,
  ProjectListResponseData,
  ProjectMembersResponseData,
  CreateProjectPayload,
  AddProjectMemberPayload,
} from '@/types/project';
import { ProjectStatus } from '@/constants/projects';

export interface GetProjectsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProjectStatus;
  category?: string;
  sortBy?: 'name' | 'code' | 'createdAt' | 'startDate';
  sortOrder?: 'asc' | 'desc';
}

export const projectApi = {
  async getProjects(params: GetProjectsQueryParams = {}): Promise<ProjectListResponseData> {
    const response = await apiClient.get<ApiResponse<ProjectListResponseData>>('/projects', { params });
    return response.data.data!;
  },

  async getProjectById(projectId: string): Promise<{ project: Project }> {
    const response = await apiClient.get<ApiResponse<{ project: Project }>>(`/projects/${projectId}`);
    return response.data.data!;
  },

  async createProject(payload: CreateProjectPayload): Promise<{ project: Project }> {
    const response = await apiClient.post<ApiResponse<{ project: Project }>>('/projects', payload);
    return response.data.data!;
  },

  async updateProject(projectId: string, payload: Partial<CreateProjectPayload>): Promise<{ project: Project }> {
    const response = await apiClient.patch<ApiResponse<{ project: Project }>>(`/projects/${projectId}`, payload);
    return response.data.data!;
  },

  async changeProjectStatus(projectId: string, status: ProjectStatus): Promise<{ project: Project }> {
    const response = await apiClient.patch<ApiResponse<{ project: Project }>>(`/projects/${projectId}/status`, { status });
    return response.data.data!;
  },

  async getProjectMembers(projectId: string, params?: { page?: number; limit?: number }): Promise<ProjectMembersResponseData> {
    const response = await apiClient.get<ApiResponse<ProjectMembersResponseData>>(`/projects/${projectId}/members`, { params });
    return response.data.data!;
  },

  async addProjectMember(projectId: string, payload: AddProjectMemberPayload): Promise<{ member: unknown }> {
    const response = await apiClient.post<ApiResponse<{ member: unknown }>>(`/projects/${projectId}/members`, payload);
    return response.data.data!;
  },

  async removeProjectMember(projectId: string, userId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/members/${userId}`);
  },
};
