import { ReviewAction } from '@/constants/reviews';
import { User } from './user';

export interface ReportReviewHistory {
  _id: string;
  id: string;
  reportId: string;
  reviewerId: User;
  action: ReviewAction;
  comment?: string;
  reportVersion: number;
  createdAt: string;
}

export interface ReviewHistoryResponseData {
  history: ReportReviewHistory[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
