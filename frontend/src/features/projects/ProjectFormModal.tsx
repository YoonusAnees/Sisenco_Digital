import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { Project, CreateProjectPayload } from '@/types/project';
import { PROJECT_CATEGORIES } from '@/constants/projects';
import { USER_ROLES } from '@/constants/roles';
import { userApi } from '@/api/userApi';
import { extractErrorMessage } from '@/utils/error';
import { toast } from 'sonner';

const projectSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  code: z
    .string()
    .trim()
    .min(2)
    .max(20)
    .regex(/^[A-Z0-9_-]+$/i, 'Code must be alphanumeric (A-Z, 0-9, _, -)'),
  description: z.string().max(500).optional(),
  category: z.enum([
    PROJECT_CATEGORIES.DEVELOPMENT,
    PROJECT_CATEGORIES.DESIGN,
    PROJECT_CATEGORIES.MARKETING,
    PROJECT_CATEGORIES.OPERATIONS,
    PROJECT_CATEGORIES.RESEARCH,
    PROJECT_CATEGORIES.OTHER,
  ]),
  managerId: z.string().min(1, 'Please select an in-charge project manager'),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateProjectPayload) => Promise<void>;
  project?: Project | null; // null = create mode
}

const categoryOptions = [
  { value: PROJECT_CATEGORIES.DEVELOPMENT, label: 'Development' },
  { value: PROJECT_CATEGORIES.DESIGN, label: 'Design' },
  { value: PROJECT_CATEGORIES.MARKETING, label: 'Marketing' },
  { value: PROJECT_CATEGORIES.OPERATIONS, label: 'Operations' },
  { value: PROJECT_CATEGORIES.RESEARCH, label: 'Research' },
  { value: PROJECT_CATEGORIES.OTHER, label: 'Other' },
];

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  project,
}) => {
  const isEditMode = !!project;

  const { data: managersData, isLoading: isLoadingManagers } = useQuery({
    queryKey: ['users', { role: USER_ROLES.MANAGER, isActive: true, limit: 100 }],
    queryFn: () => userApi.getUsers({ role: USER_ROLES.MANAGER, isActive: true, limit: 100 }),
    enabled: isOpen,
  });

  const managerOptions = [
    {
      value: '',
      label: isLoadingManagers
        ? 'Loading managers...'
        : (managersData?.users?.length ?? 0) === 0
        ? 'No active managers found'
        : 'Select in-charge project manager...',
    },
    ...(managersData?.users || []).map((m) => ({
      value: m._id || m.id,
      label: `${m.name} (${m.email})`,
    })),
  ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      category: PROJECT_CATEGORIES.DEVELOPMENT,
      managerId: '',
      startDate: null,
      endDate: null,
    },
  });

  useEffect(() => {
    if (isOpen && project) {
      let resolvedManagerId = '';
      if (typeof project.manager === 'object' && project.manager !== null) {
        resolvedManagerId = (project.manager as any)._id || (project.manager as any).id || '';
      } else if (typeof project.managerId === 'string') {
        resolvedManagerId = project.managerId;
      } else if (typeof project.manager === 'string') {
        resolvedManagerId = project.manager;
      }

      reset({
        name: project.name,
        code: project.code,
        description: project.description || '',
        category: project.category,
        managerId: resolvedManagerId,
        startDate: project.startDate ? project.startDate.substring(0, 10) : null,
        endDate: project.endDate ? project.endDate.substring(0, 10) : null,
      });
    } else if (isOpen && !project) {
      reset({
        name: '',
        code: '',
        description: '',
        category: PROJECT_CATEGORIES.DEVELOPMENT,
        managerId: '',
        startDate: null,
        endDate: null,
      });
    }
  }, [isOpen, project, reset]);

  const handleFormSubmit = async (data: ProjectFormData) => {
    try {
      const payload: CreateProjectPayload = {
        ...data,
        code: data.code.toUpperCase(),
        managerId: data.managerId,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
      };
      await onSubmit(payload);
      toast.success(isEditMode ? 'Project updated' : 'Project created');
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to save project'));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Project' : 'Create Project'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Project Name"
            placeholder="e.g. Mobile App Redesign"
            required
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Project Code"
            placeholder="e.g. APP-2025"
            required
            error={errors.code?.message}
            {...register('code')}
          />
        </div>

        <Input
          label="Description"
          placeholder="Brief project description..."
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            options={categoryOptions}
            error={errors.category?.message}
            {...register('category')}
          />

          <Select
            label="In-Charge Manager"
            required
            options={managerOptions}
            error={errors.managerId?.message}
            helperText="Responsible for managing members & reviewing reports"
            {...register('managerId')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            error={errors.startDate?.message}
            {...register('startDate')}
          />
          <Input
            label="End Date"
            type="date"
            error={errors.endDate?.message}
            {...register('endDate')}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEditMode ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
