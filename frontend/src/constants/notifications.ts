export const NOTIFICATION_TYPES = {
  REPORT_SUBMITTED: 'report_submitted',
  REPORT_RESUBMITTED: 'report_resubmitted',
  CHANGES_REQUESTED: 'changes_requested',
  REPORT_APPROVED: 'report_approved',
  SYSTEM: 'system',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];
