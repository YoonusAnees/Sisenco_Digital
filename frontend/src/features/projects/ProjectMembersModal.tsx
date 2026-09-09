import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '@/api/projectApi';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { TableSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { Project, ProjectMember } from '@/types/project';
import { PROJECT_MEMBER_ROLES } from '@/constants/projects';
import { USER_ROLES } from '@/constants/roles';
import { useAuth } from '@/contexts/AuthContext';
import { extractErrorMessage } from '@/utils/error';
import { toast } from 'sonner';
import { UserMinus, Users, Crown, ShieldAlert } from 'lucide-react';
import { userApi } from '@/api/userApi';

interface ProjectMembersModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectMembersModal: React.FC<ProjectMembersModalProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const isAssignedManager = Boolean(
    project &&
      ((typeof project.manager === 'object' &&
        project.manager !== null &&
        ((project.manager as any)._id === currentUser?.id ||
          (project.manager as any).id === currentUser?.id)) ||
        (typeof project.manager === 'string' && project.manager === currentUser?.id) ||
        project.managerId === currentUser?.id)
  );

  const canManageMembers =
    currentUser?.role === USER_ROLES.ADMIN ||
    (currentUser?.role === USER_ROLES.MANAGER && isAssignedManager);

  const managerName =
    project && typeof project.manager === 'object' && project.manager !== null && project.manager.name
      ? project.manager.name
      : 'the assigned manager';

  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>(PROJECT_MEMBER_ROLES.MEMBER);
  const [removingMember, setRemovingMember] = useState<ProjectMember | null>(null);

  const projectId = project?._id || project?.id || '';

  const { data: membersData, isLoading } = useQuery({
    queryKey: ['projectMembers', projectId],
    queryFn: () => projectApi.getProjectMembers(projectId, { limit: 50 }),
    enabled: isOpen && !!projectId,
  });

  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ['users', { limit: 100, isActive: true, role: USER_ROLES.MEMBER }],
    queryFn: () => userApi.getUsers({ limit: 100, isActive: true, role: USER_ROLES.MEMBER }),
    enabled: isOpen && canManageMembers,
  });

  const addMemberMutation = useMutation({
    mutationFn: () =>
      projectApi.addProjectMember(projectId, {
        userId: selectedUserId,
        projectRole: selectedRole as typeof PROJECT_MEMBER_ROLES[keyof typeof PROJECT_MEMBER_ROLES],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectMembers', projectId] });
      toast.success('Member added to project');
      setSelectedUserId('');
      setSelectedRole(PROJECT_MEMBER_ROLES.MEMBER);
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Failed to add member'));
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => projectApi.removeProjectMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectMembers', projectId] });
      toast.success('Member removed from project');
      setRemovingMember(null);
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Failed to remove member'));
    },
  });

  const existingMemberIds = new Set(
    membersData?.members
      ?.map((m) => {
        if (typeof m.user === 'object' && m.user) {
          return m.user._id || m.user.id;
        }
        return typeof m.user === 'string' ? m.user : '';
      })
      .filter(Boolean) || []
  );

  const availableUsers =
    usersData?.users.filter((u) => {
      const uid = u._id || u.id;
      return u.role === USER_ROLES.MEMBER && uid && !existingMemberIds.has(uid);
    }) || [];

  const userOptions = [
    {
      value: '',
      label: isUsersLoading
        ? 'Loading active members...'
        : availableUsers.length === 0
        ? 'No available active members to add'
        : 'Select an active member...',
    },
    ...availableUsers.map((u) => ({
      value: u._id || u.id,
      label: `${u.name} (${u.email})`,
    })),
  ];

  const roleOptions = [
    { value: PROJECT_MEMBER_ROLES.MEMBER, label: 'Member' },
    { value: PROJECT_MEMBER_ROLES.LEAD, label: 'Lead' },
  ];

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Members – ${project?.name || 'Project'}`}
        maxWidth="lg"
      >
        <div className="space-y-5">
          {/* Informative notice for non-manager viewers */}
          {currentUser?.role === USER_ROLES.MANAGER && !isAssignedManager && (
            <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
              <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-700">View-Only Project</p>
                <p className="text-slate-500 mt-0.5">
                  Only the assigned project manager ({managerName}) or an administrator can add or remove members for this project.
                </p>
              </div>
            </div>
          )}

          {/* Add Member Form (Assigned Manager or Admin only) */}
          {canManageMembers && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Add Member to Project
                </p>
                <span className="text-[11px] text-slate-400">
                  Only users with 'member' role can be added
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <Select
                    options={userOptions}
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  />
                </div>
                <div className="w-32">
                  <Select
                    options={roleOptions}
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  />
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!selectedUserId}
                  isLoading={addMemberMutation.isPending}
                  onClick={() => addMemberMutation.mutate()}
                >
                  Add
                </Button>
              </div>
            </div>
          )}

          {/* Members List */}
          {isLoading && <TableSkeleton rows={4} columns={3} />}
          {!isLoading && (!membersData || membersData.members.length === 0) && (
            <EmptyState
              icon={<Users className="w-6 h-6" />}
              title="No members yet"
              description={
                canManageMembers
                  ? 'Assign members from your team to this project above.'
                  : 'No team members have been assigned to this project yet.'
              }
            />
          )}
          {!isLoading && membersData && membersData.members.length > 0 && (
            <div className="divide-y divide-slate-100">
              {membersData.members.map((member, idx) => {
                const memberUser = typeof member.user === 'object' && member.user ? member.user : null;
                const displayName = memberUser?.name || 'Unknown User';
                const displayEmail = memberUser?.email || '';
                const initial = displayName.charAt(0).toUpperCase() || '?';
                const memberKey = member.id || member._id || `member-${idx}`;

                return (
                  <div key={memberKey} className="flex items-center gap-3 py-3">
                    <div className="w-8 h-8 rounded-full bg-[#62242F] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{displayName}</p>
                      {displayEmail && <p className="text-xs text-slate-400 truncate">{displayEmail}</p>}
                    </div>
                    <span className="flex items-center gap-1 text-xs font-medium text-slate-500 capitalize">
                      {member.projectRole === PROJECT_MEMBER_ROLES.LEAD && (
                        <Crown className="w-3 h-3 text-[#B7872A]" />
                      )}
                      {member.projectRole}
                    </span>
                    {canManageMembers && (
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<UserMinus className="w-3.5 h-3.5" />}
                        className="text-red-500 hover:text-red-700"
                        onClick={() => setRemovingMember(member)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      <ConfirmationDialog
        isOpen={!!removingMember}
        onClose={() => setRemovingMember(null)}
        onConfirm={() => {
          const memberUser = typeof removingMember?.user === 'object' && removingMember?.user ? removingMember.user : null;
          const uid = memberUser?._id || memberUser?.id || (typeof removingMember?.user === 'string' ? removingMember.user : '');
          if (uid) removeMemberMutation.mutate(uid);
        }}
        title="Remove Member"
        message={`Remove "${(typeof removingMember?.user === 'object' && removingMember?.user?.name) || 'this user'}" from this project?`}
        confirmText="Remove"
        variant="danger"
        isLoading={removeMemberMutation.isPending}
      />
    </>
  );
};