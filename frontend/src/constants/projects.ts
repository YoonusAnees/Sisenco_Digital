export const PROJECT_CATEGORIES = {
  DEVELOPMENT: 'development',
  DESIGN: 'design',
  MARKETING: 'marketing',
  OPERATIONS: 'operations',
  RESEARCH: 'research',
  OTHER: 'other',
} as const;

export type ProjectCategory = typeof PROJECT_CATEGORIES[keyof typeof PROJECT_CATEGORIES];

export const PROJECT_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export type ProjectStatus = typeof PROJECT_STATUSES[keyof typeof PROJECT_STATUSES];

export const PROJECT_MEMBER_ROLES = {
  MEMBER: 'member',
  LEAD: 'lead',
} as const;

export type ProjectMemberRole = typeof PROJECT_MEMBER_ROLES[keyof typeof PROJECT_MEMBER_ROLES];
