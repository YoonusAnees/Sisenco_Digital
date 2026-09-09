import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { USER_ROLES } from '@/constants/roles';
import { cn } from '@/utils/cn';
import {
  LayoutDashboard,
  FileCheck,
  ClipboardList,
  FolderKanban,
  Bell,
  Settings,
  Menu,
  type LucideIcon,
} from 'lucide-react';

interface BottomNavProps {
  onOpenMobileMenu: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  badge: string | number | null;
  isAction?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenMobileMenu }) => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const isManagerOrAdmin =
    user?.role === USER_ROLES.MANAGER || user?.role === USER_ROLES.ADMIN;

  const memberNavItems: NavItem[] = [
    {
      label: 'Home',
      path: '/',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: 'Reports',
      path: '/reports',
      icon: FileCheck,
      badge: null,
    },
    {
      label: 'Projects',
      path: '/projects',
      icon: FolderKanban,
      badge: null,
    },
    {
      label: 'Alerts',
      path: '/notifications',
      icon: Bell,
      badge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : null,
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: Settings,
      badge: null,
    },
  ];

  const managerNavItems: NavItem[] = [
    {
      label: 'Home',
      path: '/',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: 'Reports',
      path: '/reports',
      icon: FileCheck,
      badge: null,
    },
    {
      label: 'Reviews',
      path: '/reviews',
      icon: ClipboardList,
      badge: null,
    },
    {
      label: 'Projects',
      path: '/projects',
      icon: FolderKanban,
      badge: null,
    },
    {
      label: 'More',
      path: '#more',
      icon: Menu,
      isAction: true,
      badge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : null,
    },
  ];

  const items = isManagerOrAdmin ? managerNavItems : memberNavItems;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={onOpenMobileMenu}
                className="flex-1 flex flex-col items-center justify-center py-1 px-1 text-slate-500 hover:text-slate-900 active:scale-90 transition-transform select-none relative"
              >
                <div className="relative">
                  <Icon className="w-5 h-5 text-slate-600" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#B7872A] text-[9px] font-bold text-white flex items-center justify-center shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium mt-1 tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'flex-1 flex flex-col items-center justify-center py-1 px-1 transition-all select-none relative group active:scale-90',
                  isActive
                    ? 'text-[#62242F] font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                        isActive
                          ? 'bg-[#F7EBEF] text-[#62242F] scale-105 shadow-xs'
                          : 'text-slate-600 group-hover:bg-slate-100'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#B7872A] text-[9px] font-bold text-white flex items-center justify-center shadow-xs">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-[10px] mt-0.5 tracking-tight',
                      isActive
                        ? 'text-[#62242F] font-bold'
                        : 'text-slate-500 font-medium'
                    )}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
