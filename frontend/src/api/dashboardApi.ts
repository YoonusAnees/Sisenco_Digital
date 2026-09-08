import { apiClient } from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import {
  DashboardSummaryData,
  TaskTrendItem,
  MemberStatusItem,
  ProjectWorkloadItem,
  TimeDistributionCategory,
  ActivityFeedItem,
  SectionComparisonData,
} from '@/types/dashboard';

export interface DashboardFilterParams {
  projectId?: string;
  year?: number;
  weekStart?: number;
  weekEnd?: number;
  limit?: number;
}

export const dashboardApi = {
  async getSummary(params?: DashboardFilterParams): Promise<DashboardSummaryData> {
    const response = await apiClient.get<ApiResponse<DashboardSummaryData>>('/dashboard/summary', { params });
    return response.data.data!;
  },

  async getTaskTrends(params?: DashboardFilterParams): Promise<{ trends: TaskTrendItem[] }> {
    const response = await apiClient.get<ApiResponse<{ trends: TaskTrendItem[] }>>('/dashboard/task-trends', { params });
    return response.data.data!;
  },

  async getMemberStatuses(params?: DashboardFilterParams): Promise<{ members: MemberStatusItem[] }> {
    const response = await apiClient.get<ApiResponse<{ members: MemberStatusItem[] }>>('/dashboard/status-by-member', { params });
    return response.data.data!;
  },

  async getProjectWorkload(params?: DashboardFilterParams): Promise<{ projects: ProjectWorkloadItem[] }> {
    const response = await apiClient.get<ApiResponse<{ projects: ProjectWorkloadItem[] }>>('/dashboard/project-workload', { params });
    return response.data.data!;
  },

  async getTimeDistribution(params?: DashboardFilterParams): Promise<{ categories: TimeDistributionCategory[] }> {
    const response = await apiClient.get<ApiResponse<{ categories: TimeDistributionCategory[] }>>('/dashboard/time-distribution', { params });
    return response.data.data!;
  },

  async getActivity(params?: DashboardFilterParams): Promise<{ activity: ActivityFeedItem[] }> {
    const response = await apiClient.get<ApiResponse<{ activity: ActivityFeedItem[] }>>('/dashboard/activity', { params });
    return response.data.data!;
  },

  async getSectionComparison(params?: DashboardFilterParams): Promise<{ comparison: SectionComparisonData }> {
    const response = await apiClient.get<ApiResponse<{ comparison: SectionComparisonData }>>('/dashboard/section-comparison', { params });
    return response.data.data!;
  },
};
