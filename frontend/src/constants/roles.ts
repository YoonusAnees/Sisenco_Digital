export const USER_ROLES = {
  MEMBER: 'member',
  MANAGER: 'manager',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.MEMBER]: 'Member',
  [USER_ROLES.MANAGER]: 'Manager',
  [USER_ROLES.ADMIN]: 'Administrator',
};
