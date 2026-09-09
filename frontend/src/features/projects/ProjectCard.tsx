import React from 'react';
import { Project } from '@/types/project';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { PROJECT_STATUSES } from '@/constants/projects';
import { USER_ROLES } from '@/constants/roles';
import { useAuth } from '@/contexts/AuthContext';
import { Pencil, Users, ToggleLeft, ToggleRight, FolderOpen } from 'lucide-react';
import { formatDate } from '@/utils/date';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onToggleStatus: (project: Project) => void;
  onViewMembers: (project: Project) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  development: 'bg-blue-100 text-blue-800',
  design: 'bg-purple-100 text-purple-800',
  marketing: 'bg-pink-100 text-pink-800',
  operations: 'bg-orange-100 text-orange-800',
  research: 'bg-teal-100 text-teal-800',
  other: 'bg-slate-100 text-slate-800',
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onToggleStatus,
  onViewMembers,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === USER_ROLES.ADMIN;
  const isActive = project.status === PROJECT_STATUSES.ACTIVE;

  const isAssignedManager = Boolean(
    user &&
      ((typeof project.manager === 'object' &&
        project.manager !== null &&
        ((project.manager as any)._id === user.id ||
          (project.manager as any).id === user.id)) ||
        (typeof project.manager === 'string' && project.manager === user.id) ||
        project.managerId === user.id)
  );

  const canManageMembers = isAdmin || (user?.role === USER_ROLES.MANAGER && isAssignedManager);
  const managerObj = typeof project.manager === 'object' && project.manager !== null ? project.manager : null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#62242F]/10 text-[#62242F] flex items-center justify-center shrink-0">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 truncate leading-tight">{project.name}</h3>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">{project.code}</p>
          </div>
        </div>
        <Badge
          variant={isActive ? 'active' : 'inactive'}
          className="shrink-0"
        >
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{project.description}</p>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-2 items-center">
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
            CATEGORY_COLORS[project.category] || 'bg-slate-100 text-slate-700'
          }`}
        >
          {project.category}
        </span>

        {managerObj?.name && (
          <span className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
            <span className="w-4 h-4 rounded-full bg-[#62242F] text-white text-[8px] font-bold flex items-center justify-center shrink-0">
              {managerObj.name.charAt(0).toUpperCase()}
            </span>
            <span className="font-medium text-slate-700">{managerObj.name}</span>
            <span className="text-slate-400 text-[10px]">· In-Charge</span>
            {isAssignedManager && (
              <span className="ml-0.5 inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                You
              </span>
            )}
          </span>
        )}

        {project.startDate && (
          <span className="text-xs text-slate-400">
            Started {formatDate(project.startDate)}
          </span>
        )}
        {project.endDate && (
          <span className="text-xs text-slate-400">
            · Due {formatDate(project.endDate)}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Users className="w-3.5 h-3.5" />}
          onClick={() => onViewMembers(project)}
          className="text-slate-600"
        >
          {canManageMembers ? 'Manage Members' : 'Members'}
        </Button>

        {isAdmin && (
          <>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Pencil className="w-3.5 h-3.5" />}
              onClick={() => onEdit(project)}
              className="text-slate-600"
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={
                isActive ? (
                  <ToggleLeft className="w-3.5 h-3.5" />
                ) : (
                  <ToggleRight className="w-3.5 h-3.5 text-green-600" />
                )
              }
              onClick={() => onToggleStatus(project)}
              className={isActive ? 'text-red-600' : 'text-green-600'}
            >
              {isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};