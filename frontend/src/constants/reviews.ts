export const REVIEW_ACTIONS = {
  CHANGES_REQUESTED: 'changes_requested',
  APPROVED: 'approved',
} as const;

export type ReviewAction = typeof REVIEW_ACTIONS[keyof typeof REVIEW_ACTIONS];
