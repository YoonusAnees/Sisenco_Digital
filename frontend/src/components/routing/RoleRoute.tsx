import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/constants/roles';
import { UnauthorizedPage } from '@/pages/auth/UnauthorizedPage';

export interface RoleRouteProps {
  allowedRoles?: UserRole[];
  roles?: UserRole[];
  children?: React.ReactNode;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles, roles, children }) => {
  const { user } = useAuth();
  const effectiveRoles = allowedRoles || roles || [];

  if (!user || !effectiveRoles.includes(user.role)) {
    return <UnauthorizedPage />;
  }

  return children ? <>{children}</> : <Outlet />;
};
