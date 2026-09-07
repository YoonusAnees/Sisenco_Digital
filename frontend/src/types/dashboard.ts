export interface DashboardSummaryData {
  totalReports: number;
  submittedReports: number;
  pendingReviews: number;
  needsCorrectionReports: number;
  approvedReports: number;
  openBlockers: number;
  complianceRate: number;
  lateReports: number;
}

export interface TaskTrendItem {
  period: string;
  completedTasks: number;
  plannedTasks: number;
  hoursSpent: number;
}

export interface MemberStatusItem {
  userId: string;
  name: string;
  email: string;
  role: string;
  draftCount: number;
  submittedCount: number;
  needsCorrectionCount: number;
  approvedCount: number;
}

export interface ProjectWorkloadItem {
  projectId: string;
  projectName: string;
  projectCode: string;
  hoursSpent: number;
  completedTaskCount: number;
}

export interface TimeDistributionCategory {
  category: string;
  hours: number;
  percentage: number;
}

export interface ActivityFeedItem {
  id: string;
  type: string;
  title: string;
  user: {
    id: string;
    name: string;
  };
  timestamp: string;
  details?: string;
}

export interface SectionComparisonData {
  completedTasksCount: number;
  nextWeekTasksCount: number;
  blockersCount: number;
  achievementsCount: number;
}
