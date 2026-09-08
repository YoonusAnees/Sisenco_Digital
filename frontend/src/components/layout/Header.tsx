import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { USER_ROLE_LABELS, UserRole } from '@/constants/roles';
import { Button } from '@/components/common/Button';
import { Menu, LogOut, Bell, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useNotifications } from '@/contexts/NotificationContext';

interface HeaderProps {
  onMobileMenuToggle: () => void;
  unreadNotificationCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onMobileMenuToggle,
  unreadNotificationCount: propUnreadCount,
}) => {
  const { user, logout } = useAuth();
  const { unreadCount: contextUnreadCount } = useNotifications();
  const unreadNotificationCount = propUnreadCount !== undefined ? propUnreadCount : contextUnreadCount;
  const navigate = useNavigate();

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const roleLabel = user?.role
    ? USER_ROLE_LABELS[user.role as UserRole] || user.role
    : 'Member';

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200/80 shadow-xs px-4 sm:px-6 flex items-center justify-between">
      {/* Left section: Mobile toggle & Global Search placeholder */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#62242F]"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 w-64 text-xs">
          <Search className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400">Search reports, projects...</span>
        </div>
      </div>

      {/* Right section: Notifications & User profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Bell Icon */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#62242F]"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#B7872A] text-[10px] font-bold text-white shadow-xs">
              {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
            </span>
          )}
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* User Info & Avatar */}
        <div
          onClick={() => navigate('/settings')}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          title="View profile settings"
        >
          <div className="w-8 h-8 rounded-full bg-[#62242F] text-white flex items-center justify-center text-xs font-bold shadow-xs">
            {getInitials(user?.name)}
          </div>
          <div className="hidden sm:block text-left space-y-0.5">
            <p className="text-xs font-semibold text-slate-900 leading-none">
              {user?.name || 'User'}
            </p>
            <span className="inline-block px-1.5 py-0.2 text-[10px] font-semibold text-[#62242F] bg-[#F7EBEF] rounded-full">
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
          className="text-slate-500 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
};
