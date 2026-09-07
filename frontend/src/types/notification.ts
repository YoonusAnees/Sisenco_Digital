import { NotificationType } from '@/constants/notifications';

export interface NotificationItem {
  _id: string;
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  reportId?: string;
  reviewId?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationListResponseData {
  notifications: NotificationItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
