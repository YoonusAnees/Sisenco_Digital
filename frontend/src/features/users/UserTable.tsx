import React from 'react';
import { User } from '@/types/user';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { USER_ROLES, USER_ROLE_LABELS, UserRole } from '@/constants/roles';
import { formatDate } from '@/utils/date';
import { Edit2, Shield, Power } from 'lucide-react';

export interface UserTableProps {
  users: User[];
  currentUserId?: string;
  currentUserRole?: UserRole;
  onEdit: (user: User) => void;
  onChangeRole: (user: User) => void;
  onToggleStatus: (user: User) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  currentUserId,
  currentUserRole,
  onEdit,
  onChangeRole,
  onToggleStatus,
}) => {
  const isAdmin = currentUserRole === USER_ROLES.ADMIN;

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return 'approved';
      case USER_ROLES.MANAGER:
        return 'submitted';
      default:
        return 'default';
    }
  };

  const renderActions = (user: User) => {
    const uId = user._id || user.id;
    const isSelf = uId === currentUserId;
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(user)}
          title="Edit user details"
          className="h-8 w-8 p-0"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChangeRole(user)}
          title="Change role"
          disabled={isSelf}
          className="h-8 w-8 p-0 text-[#B7872A] hover:bg-amber-50"
        >
          <Shield className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleStatus(user)}
          title={user.isActive ? 'Deactivate user' : 'Activate user'}
          disabled={isSelf}
          className={`h-8 w-8 p-0 ${
            user.isActive
              ? 'text-red-600 hover:bg-red-50'
              : 'text-emerald-600 hover:bg-emerald-50'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
        </Button>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Table view for md+ */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-xs">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Department & Job</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Joined Date</th>
              {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {users.map((user) => {
              const uId = user._id || user.id;
              const isSelf = uId === currentUserId;
              return (
                <tr key={uId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <span>{user.name}</span>
                      {isSelf && <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">You</span>}
                    </div>
                    <div className="text-[11px] text-slate-500">{user.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={getRoleBadgeVariant(user.role)}>{USER_ROLE_LABELS[user.role] || user.role}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{user.department || '—'}</div>
                    <div className="text-[11px] text-slate-500">{user.jobTitle || '—'}</div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={user.isActive ? 'active' : 'inactive'}>{user.isActive ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{formatDate(user.createdAt)}</td>
                  {isAdmin && <td className="py-3 px-4 text-right">{renderActions(user)}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Card list for mobile */}
      <div className="md:hidden space-y-3">
        {users.map((user) => (
          <div key={user._id || user.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-slate-900">{user.name}</div>
                <div className="text-xs text-slate-500">{user.email}</div>
              </div>
              {isAdmin && <div>{renderActions(user)}</div>}
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant={getRoleBadgeVariant(user.role)}>{USER_ROLE_LABELS[user.role] || user.role}</Badge>
              <Badge variant={user.isActive ? 'active' : 'inactive'}>{user.isActive ? 'Active' : 'Inactive'}</Badge>
            </div>
            <div className="text-xs text-slate-600">
              {user.department || '—'} • {user.jobTitle || '—'}
            </div>
            <div className="text-[10px] text-slate-400">Joined {formatDate(user.createdAt)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
