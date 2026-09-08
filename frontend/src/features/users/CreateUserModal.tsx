import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { USER_ROLES, USER_ROLE_LABELS } from '@/constants/roles';
import { CreateUserPayload } from '@/types/user';
import { extractErrorMessage } from '@/utils/error';
import { toast } from 'sonner';

const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Valid email address is required').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  role: z.enum([USER_ROLES.MEMBER, USER_ROLES.MANAGER, USER_ROLES.ADMIN]),
  department: z.string().trim().max(100).optional(),
  jobTitle: z.string().trim().max(100).optional(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

export interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateUserPayload) => Promise<void>;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: USER_ROLES.MEMBER,
      department: '',
      jobTitle: '',
    },
  });

  const handleFormSubmit = async (data: CreateUserFormData) => {
    setErrorMsg(null);
    try {
      await onSubmit(data);
      toast.success('User created successfully');
      reset();
      onClose();
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to create user');
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  const roleOptions = [
    { value: USER_ROLES.MEMBER, label: USER_ROLE_LABELS[USER_ROLES.MEMBER] },
    { value: USER_ROLES.MANAGER, label: USER_ROLE_LABELS[USER_ROLES.MANAGER] },
    { value: USER_ROLES.ADMIN, label: USER_ROLE_LABELS[USER_ROLES.ADMIN] },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New User" maxWidth="md">
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="Jane Doe"
          required
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="jane@sisenco.com"
          required
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          required
          helperText="At least 8 chars, 1 uppercase, 1 lowercase, 1 number"
          error={errors.password?.message}
          {...register('password')}
        />

        <Select
          label="Role"
          options={roleOptions}
          required
          error={errors.role?.message}
          {...register('role')}
        />

        <Input
          label="Department"
          placeholder="Engineering"
          error={errors.department?.message}
          {...register('department')}
        />

        <Input
          label="Job Title"
          placeholder="Senior Engineer"
          error={errors.jobTitle?.message}
          {...register('jobTitle')}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            Create User
          </Button>
        </div>
      </form>
    </Modal>
  );
};
