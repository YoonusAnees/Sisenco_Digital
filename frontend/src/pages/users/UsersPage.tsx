import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, GetUsersQueryParams } from '@/api/userApi';
import { useAuth } from '@/contexts/AuthContext';
import { USER_ROLES, USER_ROLE_LABELS, UserRole } from '@/constants/roles';
import { User, CreateUserPayload, UpdateUserPayload } from '@/types/user';
import { PageHeader } from '@/components/common/PageHeader';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { PaginationControls } from '@/components/common/PaginationControls';
import { TableSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { UserTable } from '@/features/users/UserTable';
import { CreateUserModal } from '@/features/users/CreateUserModal';
import { EditUserModal } from '@/features/users/EditUserModal';
import { ChangeRoleModal } from '@/features/users/ChangeRoleModal';
import { extractErrorMessage } from '@/utils/error';
import { UserPlus, Search, ShieldAlert, Users } from 'lucide-react';
import { toast } from 'sonner';

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = currentUser?.role === USER_ROLES.ADMIN;

  const [queryParams, setQueryParams] = useState<GetUsersQueryParams>({
    page: 1,
    limit: 10,
    search: '',
    role: undefined,
    isActive: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [roleChangingUser, setRoleChangingUser] = useState<User | null>(null);
  const [statusTogglingUser, setStatusTogglingUser] = useState<User | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['users', queryParams],
    queryFn: () => userApi.getUsers(queryParams),
  });

  const createUserMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => userApi.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateUserPayload }) =>
      userApi.updateUser(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      userApi.changeUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      userApi.changeUserStatus(userId, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(
        variables.isActive
          ? 'User activated successfully'
          : 'User deactivated successfully'
      );
      setStatusTogglingUser(null);
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Action failed'));
    },
  });

  const handleConfirmToggleStatus = async () => {
    if (!statusTogglingUser) return;
    const uId = statusTogglingUser._id || statusTogglingUser.id;
    await changeStatusMutation.mutateAsync({
      userId: uId,
      isActive: !statusTogglingUser.isActive,
    });
  };

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: USER_ROLES.MEMBER, label: USER_ROLE_LABELS[USER_ROLES.MEMBER] },
    { value: USER_ROLES.MANAGER, label: USER_ROLE_LABELS[USER_ROLES.MANAGER] },
    { value: USER_ROLES.ADMIN, label: USER_ROLE_LABELS[USER_ROLES.ADMIN] },
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'true', label: 'Active Only' },
    { value: 'false', label: 'Inactive Only' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="View team members, manage account status and role assignments."
        actions={
          isAdmin ? (
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Add User
            </Button>
          ) : undefined
        }
      />

      {!isAdmin && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Managers have read-only access to team user records.</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Input
            placeholder="Search by name or email..."
            value={queryParams.search || ''}
            onChange={(e) =>
              setQueryParams((prev) => ({ ...prev, search: e.target.value, page: 1 }))
            }
            className="pl-9"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <Select
          options={roleOptions}
          value={queryParams.role || ''}
          onChange={(e) =>
            setQueryParams((prev) => ({
              ...prev,
              role: (e.target.value as UserRole) || undefined,
              page: 1,
            }))
          }
        />

        <Select
          options={statusOptions}
          value={
            queryParams.isActive === undefined
              ? ''
              : queryParams.isActive
              ? 'true'
              : 'false'
          }
          onChange={(e) =>
            setQueryParams((prev) => ({
              ...prev,
              isActive:
                e.target.value === ''
                  ? undefined
                  : e.target.value === 'true',
              page: 1,
            }))
          }
        />

        <Select
          options={[
            { value: 'createdAt-desc', label: 'Newest First' },
            { value: 'createdAt-asc', label: 'Oldest First' },
            { value: 'name-asc', label: 'Name A-Z' },
            { value: 'name-desc', label: 'Name Z-A' },
          ]}
          value={`${queryParams.sortBy}-${queryParams.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-') as [
              GetUsersQueryParams['sortBy'],
              GetUsersQueryParams['sortOrder']
            ];
            setQueryParams((prev) => ({ ...prev, sortBy, sortOrder }));
          }}
        />
      </div>

      {/* Table Content */}
      {isLoading && <TableSkeleton rows={6} columns={5} />}

      {isError && (
        <ErrorState
          message={extractErrorMessage(error, 'Failed to fetch user list')}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && data && (
        <>
          {data.users.length === 0 ? (
            <EmptyState
              icon={<Users className="w-6 h-6" />}
              title="No users found"
              description="No user records match your selected filters."
            />
          ) : (
            <div className="space-y-4">
              <UserTable
                users={data.users}
                currentUserId={currentUser?._id || currentUser?.id}
                currentUserRole={currentUser?.role}
                onEdit={(u) => setEditingUser(u)}
                onChangeRole={(u) => setRoleChangingUser(u)}
                onToggleStatus={(u) => setStatusTogglingUser(u)}
              />

              <PaginationControls
                page={data.pagination.page}
                totalPages={data.pagination.totalPages}
                total={data.pagination.total ?? (data.pagination as any).totalUsers ?? 0}
                limit={data.pagination.limit}
                onPageChange={(page) => setQueryParams((prev) => ({ ...prev, page }))}
                onLimitChange={(limit) =>
                  setQueryParams((prev) => ({ ...prev, limit, page: 1 }))
                }
              />
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {isAdmin && (
        <>
          <CreateUserModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={async (payload) => {
              await createUserMutation.mutateAsync(payload);
            }}
          />

          <EditUserModal
            user={editingUser}
            isOpen={!!editingUser}
            onClose={() => setEditingUser(null)}
            onSubmit={async (userId, payload) => {
              await updateUserMutation.mutateAsync({ userId, payload });
            }}
          />

          <ChangeRoleModal
            user={roleChangingUser}
            currentUserId={currentUser?._id || currentUser?.id}
            isOpen={!!roleChangingUser}
            onClose={() => setRoleChangingUser(null)}
            onSubmit={async (userId, role) => {
              await changeRoleMutation.mutateAsync({ userId, role });
            }}
          />

          <ConfirmationDialog
            isOpen={!!statusTogglingUser}
            onClose={() => setStatusTogglingUser(null)}
            onConfirm={handleConfirmToggleStatus}
            title={
              statusTogglingUser?.isActive
                ? 'Deactivate User Account'
                : 'Activate User Account'
            }
            message={`Are you sure you want to ${
              statusTogglingUser?.isActive ? 'deactivate' : 'activate'
            } account for "${statusTogglingUser?.name}"?`}
            confirmText={
              statusTogglingUser?.isActive ? 'Deactivate' : 'Activate'
            }
            variant={statusTogglingUser?.isActive ? 'danger' : 'primary'}
            isLoading={changeStatusMutation.isPending}
          />
        </>
      )}
    </div>
  );
};
