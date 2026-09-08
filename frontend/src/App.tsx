import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ProtectedRoute } from '@/components/routing/ProtectedRoute';
import { RoleRoute } from '@/components/routing/RoleRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { USER_ROLES } from '@/constants/roles';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { RegisterAdminPage } from '@/pages/auth/RegisterAdminPage';
import { UnauthorizedPage } from '@/pages/auth/UnauthorizedPage';
import { NotFoundPage } from '@/pages/auth/NotFoundPage';

// Main Feature Pages
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { MyReportsPage } from '@/pages/reports/MyReportsPage';
import { ProjectsPage } from '@/pages/projects/ProjectsPage';
import { ReviewQueuePage } from '@/pages/reviews/ReviewQueuePage';
import { UsersPage } from '@/pages/users/UsersPage';
import { NotificationsPage } from '@/pages/notifications/NotificationsPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/register-admin" element={<RegisterAdminPage />} />

              {/* Protected App Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/reports" element={<MyReportsPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<ProfilePage />} />

                  {/* Manager & Admin Only Routes */}
                  <Route
                    element={
                      <RoleRoute allowedRoles={[USER_ROLES.MANAGER, USER_ROLES.ADMIN]} />
                    }
                  >
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/reviews" element={<ReviewQueuePage />} />
                  </Route>
                </Route>
              </Route>

              {/* Fallback & Status Routes */}
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
