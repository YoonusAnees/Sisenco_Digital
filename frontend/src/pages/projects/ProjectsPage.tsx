import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi, GetProjectsQueryParams } from '@/api/projectApi';
import { useAuth } from '@/contexts/AuthContext';
import { Project, CreateProjectPayload } from '@/types/project';
import { PROJECT_STATUSES, PROJECT_CATEGORIES } from '@/constants/projects';
import { USER_ROLES } from '@/constants/roles';
import { PageHeader } from '@/components/common/PageHeader';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { PaginationControls } from '@/components/common/PaginationControls';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { ProjectCard } from '@/features/projects/ProjectCard';
import { ProjectFormModal } from '@/features/projects/ProjectFormModal';
import { ProjectMembersModal } from '@/features/projects/ProjectMembersModal';
import { extractErrorMessage } from '@/utils/error';
import { FolderPlus, Search, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';

export const ProjectsPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = currentUser?.role === USER_ROLES.ADMIN;

  const [queryParams, setQueryParams] = useState<GetProjectsQueryParams>({
    page: 1,
    limit: 12,
    search: '',
    status: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [membersProject, setMembersProject] = useState<Project | null>(null);
  const [togglingProject, setTogglingProject] = useState<Project | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['projects', queryParams],
    queryFn: () => projectApi.getProjects(queryParams),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateProjectPayload) => projectApi.createProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateProjectPayload> }) =>
      projectApi.updateProject(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: typeof PROJECT_STATUSES[keyof typeof PROJECT_STATUSES] }) =>
      projectApi.changeProjectStatus(id, status),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(
        vars.status === PROJECT_STATUSES.ACTIVE ? 'Project activated' : 'Project deactivated'
      );
      setTogglingProject(null);
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Failed to update project status'));
    },
  });

  const handleConfirmToggle = () => {
    if (!togglingProject) return;
    const id = togglingProject._id || togglingProject.id;
    const newStatus =
      togglingProject.status === PROJECT_STATUSES.ACTIVE
        ? PROJECT_STATUSES.INACTIVE
        : PROJECT_STATUSES.ACTIVE;
    toggleStatusMutation.mutate({ id, status: newStatus });
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: PROJECT_STATUSES.ACTIVE, label: 'Active' },
    { value: PROJECT_STATUSES.INACTIVE, label: 'Inactive' },
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: PROJECT_CATEGORIES.DEVELOPMENT, label: 'Development' },
    { value: PROJECT_CATEGORIES.DESIGN, label: 'Design' },
    { value: PROJECT_CATEGORIES.MARKETING, label: 'Marketing' },
    { value: PROJECT_CATEGORIES.OPERATIONS, label: 'Operations' },
    { value: PROJECT_CATEGORIES.RESEARCH, label: 'Research' },
    { value: PROJECT_CATEGORIES.OTHER, label: 'Other' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage projects, assign team members, and track project status."
        actions={
          isAdmin ? (
            <Button
              variant="primary"
              leftIcon={<FolderPlus className="w-4 h-4" />}
              onClick={() => {
                setEditingProject(null);
                setIsFormModalOpen(true);
              }}
            >
              New Project
            </Button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Input
            placeholder="Search projects..."
            value={queryParams.search || ''}
            onChange={(e) => setQueryParams((p) => ({ ...p, search: e.target.value, page: 1 }))}
            className="pl-9"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <Select
          options={statusOptions}
          value={queryParams.status || ''}
          onChange={(e) =>
            setQueryParams((p) => ({
              ...p,
              status: (e.target.value as typeof PROJECT_STATUSES[keyof typeof PROJECT_STATUSES]) || undefined,
              page: 1,
            }))
          }
        />

        <Select
          options={categoryOptions}
          value={queryParams.category || ''}
          onChange={(e) =>
            setQueryParams((p) => ({ ...p, category: e.target.value || undefined, page: 1 }))
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
              GetProjectsQueryParams['sortBy'],
              GetProjectsQueryParams['sortOrder']
            ];
            setQueryParams((p) => ({ ...p, sortBy, sortOrder }));
          }}
        />
      </div>

      {/* Content */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      )}

      {isError && (
        <ErrorState
          message={extractErrorMessage(error, 'Failed to load projects')}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && data && (
        <>
          {data.projects.length === 0 ? (
            <EmptyState
              icon={<FolderOpen className="w-6 h-6" />}
              title="No projects found"
              description={
                isAdmin
                  ? 'Create your first project to get started.'
                  : 'No projects match your current filters.'
              }
              action={
                isAdmin ? (
                  <Button
                    variant="primary"
                    leftIcon={<FolderPlus className="w-4 h-4" />}
                    onClick={() => setIsFormModalOpen(true)}
                  >
                    Create Project
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.projects.map((project) => (
                  <ProjectCard
                    key={project._id || project.id}
                    project={project}
                    onEdit={(p) => {
                      setEditingProject(p);
                      setIsFormModalOpen(true);
                    }}
                    onToggleStatus={(p) => setTogglingProject(p)}
                    onViewMembers={(p) => setMembersProject(p)}
                  />
                ))}
              </div>

              <PaginationControls
                page={data.pagination.page}
                totalPages={data.pagination.totalPages}
                total={data.pagination.total}
                limit={data.pagination.limit}
                onPageChange={(page) => setQueryParams((p) => ({ ...p, page }))}
                onLimitChange={(limit) => setQueryParams((p) => ({ ...p, limit, page: 1 }))}
              />
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {isAdmin && (
        <>
          <ProjectFormModal
            isOpen={isFormModalOpen}
            onClose={() => {
              setIsFormModalOpen(false);
              setEditingProject(null);
            }}
            project={editingProject}
            onSubmit={async (payload) => {
              if (editingProject) {
                const id = editingProject._id || editingProject.id;
                await updateMutation.mutateAsync({ id, payload });
              } else {
                await createMutation.mutateAsync(payload);
              }
            }}
          />

          <ConfirmationDialog
            isOpen={!!togglingProject}
            onClose={() => setTogglingProject(null)}
            onConfirm={handleConfirmToggle}
            title={
              togglingProject?.status === PROJECT_STATUSES.ACTIVE
                ? 'Deactivate Project'
                : 'Activate Project'
            }
            message={`Are you sure you want to ${
              togglingProject?.status === PROJECT_STATUSES.ACTIVE ? 'deactivate' : 'activate'
            } "${togglingProject?.name}"?`}
            confirmText={
              togglingProject?.status === PROJECT_STATUSES.ACTIVE ? 'Deactivate' : 'Activate'
            }
            variant={togglingProject?.status === PROJECT_STATUSES.ACTIVE ? 'danger' : 'primary'}
            isLoading={toggleStatusMutation.isPending}
          />
        </>
      )}

      <ProjectMembersModal
        project={membersProject}
        isOpen={!!membersProject}
        onClose={() => setMembersProject(null)}
      />
    </div>
  );
};
