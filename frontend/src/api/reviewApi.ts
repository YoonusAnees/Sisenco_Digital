import { apiClient } from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { Review } from '@/types/review';

export interface ReviewQueueParams {
  page?: number;
  limit?: number;
  status?: string;
  projectId?: string;
}

export interface ReviewHistoryParams {
  page?: number;
  limit?: number;
}

export const reviewApi = {
  async getReviewQueue(params: ReviewQueueParams = {}): Promise<{
    reports: Review[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const response = await apiClient.get<
      ApiResponse<{
        reports: Review[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      }>
    >('/reviews/queue', { params });
    return response.data.data!;
  },

  async getReviewHistory(
    reportId: string,
    params: ReviewHistoryParams = {}
  ): Promise<{
    history: Review[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const response = await apiClient.get<
      ApiResponse<{
        history: Review[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      }>
    >(`/reviews/${reportId}/history`, { params });
    return response.data.data!;
  },

  async requestChanges(reportId: string, note: string): Promise<void> {
    await apiClient.post(`/reviews/${reportId}/request-changes`, { note });
  },

  async approveReport(reportId: string, note?: string): Promise<void> {
    await apiClient.post(`/reviews/${reportId}/approve`, note ? { note } : {});
  },
};
