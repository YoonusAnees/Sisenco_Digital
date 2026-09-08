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
import { User } from '@/types/user';
import { PROJECT_MEMBER_ROLES } from '@/constants/projects';
import { USER_ROLES } from '@/constants/roles';
import { useAuth } from '@/contexts/AuthContext';
import { extractErrorMessage } from '@/utils/error';
import { toast } from 'sonner';
import { UserMinus, Users, Crown } from 'lucide-react';
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
  const isManagerOrAdmin =
    currentUser?.role === USER_ROLES.MANAGER || currentUser?.role === USER_ROLES.ADMIN;

  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>(PROJECT_MEMBER_ROLES.MEMBER);
  const [removingMember, setRemovingMember] = useState<ProjectMember | null>(null);

  const projectId = project?._id || project?.id || '';

  const { data: membersData, isLoading } = useQuery({
    queryKey: ['projectMembers', projectId],
    queryFn: () => projectApi.getProjectMembers(projectId, { limit: 50 }),
    enabled: isOpen && !!projectId,
  });

  const { data: usersData } = useQuery({
    queryKey: ['users', { limit: 200, isActive: true }],
    queryFn: () => userApi.getUsers({ limit: 200, isActive: true }),
    enabled: isOpen && isManagerOrAdmin,
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
    membersData?.members.map((m) => (m.userId as User)?._id || (m.userId as User)?.id) || []
  );

  const availableUsers =
    usersData?.users.filter((u) => !existingMemberIds.has(u._id || u.id)) || [];

  const userOptions = [
    { value: '', label: 'Select a user...' },
    ...availableUsers.map((u) => ({ value: u._id || u.id, label: `${u.name} (${u.email})` })),
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
        title={`Members — ${project?.name}`}
        maxWidth="lg"
      >
        <div className="space-y-5">
          {/* Add Member Form (Manager/Admin only) */}
          {isManagerOrAdmin && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Add Member</p>
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
              description="Add team members to this project."
            />
          )}
          {!isLoading && membersData && membersData.members.length > 0 && (
            <div className="divide-y divide-slate-100">
              {membersData.members.map((member) => {
                const memberUser = member.userId as User;
                return (
                  <div key={member._id} className="flex items-center gap-3 py-3">
                    <div className="w-8 h-8 rounded-full bg-[#62242F] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {memberUser?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{memberUser?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{memberUser?.email}</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-medium text-slate-500 capitalize">
                      {member.projectRole === PROJECT_MEMBER_ROLES.LEAD && (
                        <Crown className="w-3 h-3 text-[#B7872A]" />
                      )}
                      {member.projectRole}
                    </span>
                    {isManagerOrAdmin && (
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
          const memberUser = removingMember?.userId as User;
          const uid = memberUser?._id || memberUser?.id;
          removeMemberMutation.mutate(uid);
        }}
        title="Remove Member"
        message={`Remove "${(removingMember?.userId as User)?.name}" from this project?`}
        confirmText="Remove"
        variant="danger"
        isLoading={removeMemberMutation.isPending}
      />
    </>
  );
};
