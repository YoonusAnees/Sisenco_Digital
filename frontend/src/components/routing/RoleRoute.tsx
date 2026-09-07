import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/constants/roles';
import { UnauthorizedPage } from '@/pages/auth/UnauthorizedPage';

export interface RoleRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <UnauthorizedPage />;
  }

  return <>{children}</>;
};
