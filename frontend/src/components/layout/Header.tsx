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

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs px-3 sm:px-6 flex items-center justify-between">
      {/* Desktop Left: Global Search */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 w-72 text-xs">
          <Search className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400">Search reports, projects...</span>
        </div>
      </div>

      {/* Mobile App Header (Visible on mobile < lg) */}
      <div className="flex lg:hidden items-center gap-2.5 min-w-0">
        <div
          onClick={() => navigate('/settings')}
          className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#62242F] to-[#8E3544] text-white flex items-center justify-center text-xs font-bold shadow-xs shrink-0 cursor-pointer active:scale-95 transition-transform"
          title="View profile settings"
        >
          {getInitials(user?.name)}
        </div>
        <div className="leading-tight min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-xs font-bold text-slate-900 truncate">
              Hi, {firstName} 👋
            </h1>
            <span className="text-[9px] font-semibold text-[#62242F] bg-[#F7EBEF] px-1.5 py-0.5 rounded-full capitalize shrink-0">
              {roleLabel}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Sisenco Digital</p>
        </div>
      </div>

      {/* Right section: Notifications, Profile, and Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notification Bell Icon */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#62242F] active:scale-95"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#B7872A] text-[9px] font-bold text-white shadow-xs animate-pulse">
              {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
            </span>
          )}
        </button>

        <div className="h-5 w-px bg-slate-200" />

        {/* Desktop User Info & Avatar */}
        <div
          onClick={() => navigate('/settings')}
          className="hidden lg:flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity"
          title="View profile settings"
        >
          <div className="w-8 h-8 rounded-full bg-[#62242F] text-white flex items-center justify-center text-xs font-bold shadow-xs">
            {getInitials(user?.name)}
          </div>
          <div className="text-left space-y-0.5">
            <p className="text-xs font-semibold text-slate-900 leading-none">
              {user?.name || 'User'}
            </p>
            <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold text-[#62242F] bg-[#F7EBEF] rounded-full">
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Mobile Full Menu Toggle */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden text-slate-600 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#62242F] active:scale-95"
          aria-label="Toggle navigation menu"
          title="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Logout Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
          className="hidden lg:inline-flex text-slate-500 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </div>
    </header>
  );
};
