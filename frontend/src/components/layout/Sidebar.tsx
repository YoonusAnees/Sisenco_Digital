import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { USER_ROLES } from "@/constants/roles";
import { cn } from "@/utils/cn";
import {
  LayoutDashboard,
  FileCheck,
  ClipboardList,
  FolderKanban,
  Users,
  Bell,
  Settings,
  FileText,
  X,
} from "lucide-react";

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen = false,
  onMobileClose,
}) => {
  const { user } = useAuth();
  const role = user?.role || USER_ROLES.MEMBER;

  const navItems = [
    {
      label: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
      roles: [USER_ROLES.MEMBER, USER_ROLES.MANAGER, USER_ROLES.ADMIN],
    },
    {
      label: "Weekly Reports",
      path: "/reports",
      icon: FileCheck,
      roles: [USER_ROLES.MEMBER],
    },
    {
      label: "Review Queue",
      path: "/reviews",
      icon: ClipboardList,
      roles: [USER_ROLES.MANAGER, USER_ROLES.ADMIN],
    },
    {
      label: "Projects",
      path: "/projects",
      icon: FolderKanban,
      roles: [USER_ROLES.MEMBER, USER_ROLES.MANAGER, USER_ROLES.ADMIN],
    },
    {
      label: "Users",
      path: "/users",
      icon: Users,
      roles: [USER_ROLES.MANAGER, USER_ROLES.ADMIN],
    },
    {
      label: "Notifications",
      path: "/notifications",
      icon: Bell,
      roles: [USER_ROLES.MEMBER, USER_ROLES.MANAGER, USER_ROLES.ADMIN],
    },
    {
      label: "Settings",
      path: "/settings",
      icon: Settings,
      roles: [USER_ROLES.MEMBER, USER_ROLES.MANAGER, USER_ROLES.ADMIN],
    },
  ];

  const filteredNavItems = navItems.filter((item) => item.roles.includes(role));

  const content = (
    <div className="flex flex-col h-full bg-[#2A171A] text-slate-200">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-[#3D2327]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#62242F] text-[#B7872A] border border-[#B7872A]/40 flex items-center justify-center shadow-inner">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Sisenco
            </h2>
            <p className="text-[10px] text-[#B7872A] uppercase tracking-wider font-semibold">
              Weekly Report
            </p>
          </div>
        </div>
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg focus:outline-none"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              end={item.path === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all group",
                  isActive
                    ? "bg-[#62242F] text-white shadow-sm border-l-4 border-[#B7872A]"
                    : "text-slate-300 hover:bg-[#3D2327] hover:text-white",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive
                        ? "text-[#B7872A]"
                        : "text-slate-400 group-hover:text-slate-200",
                    )}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-[#3D2327]">
        <div className="px-3 py-2 rounded-lg bg-[#351E22] border border-[#48282D]">
          <p className="text-[11px] font-medium text-slate-400">
            Sisenco Digital v1.0
          </p>
          <p className="text-[10px] text-slate-500">
            Internal Reporting System
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 bottom-0 w-64 z-30 shadow-xl">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <aside className="relative w-64 max-w-xs bg-[#2A171A] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </aside>
        </div>
      )}
    </>
  );
};
