import { apiClient } from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import {
  WeeklyReport,
  ReportVersion,
  ReportListResponseData,
  ReportVersionListResponseData,
  CreateReportPayload,
  UpdateReportPayload,
} from '@/types/report';

export interface GetMyReportsQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  year?: number;
  weekNumber?: number;
  sortOrder?: 'asc' | 'desc';
}

export const reportApi = {
  async getMyReports(params: GetMyReportsQueryParams = {}): Promise<ReportListResponseData> {
    const response = await apiClient.get<ApiResponse<ReportListResponseData>>('/reports/me', { params });
    return response.data.data!;
  },

  async getReportById(reportId: string): Promise<{ report: WeeklyReport }> {
    const response = await apiClient.get<ApiResponse<{ report: WeeklyReport }>>(`/reports/${reportId}`);
    return response.data.data!;
  },

  async createReport(payload: CreateReportPayload): Promise<{ report: WeeklyReport }> {
    const response = await apiClient.post<ApiResponse<{ report: WeeklyReport }>>('/reports', payload);
    return response.data.data!;
  },

  async updateReport(reportId: string, payload: UpdateReportPayload): Promise<{ report: WeeklyReport }> {
    const response = await apiClient.patch<ApiResponse<{ report: WeeklyReport }>>(`/reports/${reportId}`, payload);
    return response.data.data!;
  },

  async submitReport(reportId: string): Promise<{ report: WeeklyReport }> {
    const response = await apiClient.post<ApiResponse<{ report: WeeklyReport }>>(`/reports/${reportId}/submit`);
    return response.data.data!;
  },

  async requestCorrection(reportId: string, note: string): Promise<{ report: WeeklyReport }> {
    const response = await apiClient.post<ApiResponse<{ report: WeeklyReport }>>(
      `/reports/${reportId}/request-correction`,
      { note }
    );
    return response.data.data!;
  },

  async approveReport(reportId: string, note?: string): Promise<{ report: WeeklyReport }> {
    const response = await apiClient.post<ApiResponse<{ report: WeeklyReport }>>(
      `/reports/${reportId}/approve`,
      note ? { note } : {}
    );
    return response.data.data!;
  },

  async getReportVersions(
    reportId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ReportVersionListResponseData> {
    const response = await apiClient.get<ApiResponse<ReportVersionListResponseData>>(
      `/reports/${reportId}/versions`,
      { params }
    );
    return response.data.data!;
  },

  async getReportVersion(reportId: string, versionNumber: number): Promise<{ version: ReportVersion }> {
    const response = await apiClient.get<ApiResponse<{ version: ReportVersion }>>(
      `/reports/${reportId}/versions/${versionNumber}`
    );
    return response.data.data!;
  },
};
