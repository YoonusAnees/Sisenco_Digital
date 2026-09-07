export const REPORT_STATUSES = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  NEEDS_CORRECTION: 'needs_correction',
  APPROVED: 'approved',
} as const;

export type ReportStatus = typeof REPORT_STATUSES[keyof typeof REPORT_STATUSES];

export const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export type TaskPriority = typeof TASK_PRIORITIES[keyof typeof TASK_PRIORITIES];

export const HOURS_CATEGORIES = {
  DEVELOPMENT: 'development',
  TESTING: 'testing',
  DESIGN: 'design',
  MEETINGS: 'meetings',
  RESEARCH: 'research',
  DOCUMENTATION: 'documentation',
  SUPPORT: 'support',
  OTHER: 'other',
} as const;

export type HoursCategory = typeof HOURS_CATEGORIES[keyof typeof HOURS_CATEGORIES];

export const HOURS_CATEGORY_LABELS: Record<HoursCategory, string> = {
  [HOURS_CATEGORIES.DEVELOPMENT]: 'Development',
  [HOURS_CATEGORIES.TESTING]: 'Testing',
  [HOURS_CATEGORIES.DESIGN]: 'Design',
  [HOURS_CATEGORIES.MEETINGS]: 'Meetings',
  [HOURS_CATEGORIES.RESEARCH]: 'Research',
  [HOURS_CATEGORIES.DOCUMENTATION]: 'Documentation',
  [HOURS_CATEGORIES.SUPPORT]: 'Support',
  [HOURS_CATEGORIES.OTHER]: 'Other',
};
