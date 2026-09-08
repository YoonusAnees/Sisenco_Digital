import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { User, UpdateUserPayload } from '@/types/user';
import { extractErrorMessage } from '@/utils/error';
import { toast } from 'sonner';

const editUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100).optional(),
  department: z.string().trim().max(100).optional(),
  jobTitle: z.string().trim().max(100).optional(),
});

export interface EditUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userId: string, payload: UpdateUserPayload) => Promise<void>;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
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
  } = useForm<UpdateUserPayload>({
    resolver: zodResolver(editUserSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        department: user.department || '',
        jobTitle: user.jobTitle || '',
      });
    }
  }, [user, reset]);

  const handleFormSubmit = async (data: UpdateUserPayload) => {
    if (!user) return;
    setErrorMsg(null);
    try {
      await onSubmit(user._id || user.id, data);
      toast.success('User updated successfully');
      onClose();
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to update user');
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User Details" maxWidth="md">
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Department"
          error={errors.department?.message}
          {...register('department')}
        />

        <Input
          label="Job Title"
          error={errors.jobTitle?.message}
          {...register('jobTitle')}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
