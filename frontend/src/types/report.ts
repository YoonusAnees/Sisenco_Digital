import { ReportStatus, TaskPriority, HoursCategory } from '@/constants/reports';
import { User } from './user';
import { Project } from './project';

export interface CompletedTask {
  _id?: string;
  title: string;
  description?: string;
  project: string | Project;
  hoursSpent: number;
  completedAt?: string | null;
}

export interface NextWeekTask {
  _id?: string;
  title: string;
  description?: string;
  project: string | Project;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface Blocker {
  _id?: string;
  title: string;
  description: string;
  project: string | Project;
  impact?: string;
  assistanceNeeded?: string;
  isResolved?: boolean;
}

export interface Achievement {
  _id?: string;
  title: string;
  description?: string;
  project?: string | Project | null;
}

export interface HoursBreakdown {
  _id?: string;
  project: string | Project;
  category: HoursCategory;
  hours: number;
  notes?: string;
}

export interface SupportingLink {
  _id?: string;
  label: string;
  url: string;
}

export interface WeeklyReport {
  _id: string;
  id: string;
  ownerId: string | User;
  weekStart: string;
  weekEnd: string;
  year: number;
  weekNumber: number;
  status: ReportStatus;
  summary?: string;
  completedTasks: CompletedTask[];
  nextWeekTasks: NextWeekTask[];
  blockers: Blocker[];
  achievements: Achievement[];
  hoursBreakdown: HoursBreakdown[];
  totalHours: number;
  links: SupportingLink[];
  submittedAt?: string;
  approvedAt?: string;
  lastCorrectionNote?: string;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReportVersion {
  _id: string;
  id: string;
  reportId: string;
  versionNumber: number;
  snapshot: Omit<WeeklyReport, '_id' | 'id'>;
  submittedBy: string | User;
  submittedAt: string;
  createdAt: string;
}

export interface ReportListResponseData {
  reports: WeeklyReport[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ReportVersionListResponseData {
  versions: ReportVersion[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateReportPayload {
  weekStart: string;
  summary?: string;
  completedTasks?: CompletedTask[];
  nextWeekTasks?: NextWeekTask[];
  blockers?: Blocker[];
  achievements?: Achievement[];
  hoursBreakdown?: HoursBreakdown[];
  links?: SupportingLink[];
}

export type UpdateReportPayload = Partial<Omit<CreateReportPayload, 'weekStart'>>;
