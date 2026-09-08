import { apiClient } from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { NotificationItem, NotificationListResponseData } from '@/types/notification';

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
}

export const notificationApi = {
  async getNotifications(params: GetNotificationsParams = {}): Promise<NotificationListResponseData> {
    const response = await apiClient.get<ApiResponse<NotificationListResponseData>>('/notifications', {
      params: {
        ...params,
        isRead: params.isRead !== undefined ? String(params.isRead) : undefined,
      },
    });
    return response.data.data!;
  },

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    return response.data.data!;
  },

  async markOneAsRead(notificationId: string): Promise<{ notification: NotificationItem }> {
    const response = await apiClient.patch<ApiResponse<{ notification: NotificationItem }>>(
      `/notifications/${notificationId}/read`
    );
    return response.data.data!;
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/notifications/read-all');
  },
};
