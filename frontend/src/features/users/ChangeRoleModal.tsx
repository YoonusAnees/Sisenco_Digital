import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { USER_ROLES, USER_ROLE_LABELS, UserRole } from '@/constants/roles';
import { User } from '@/types/user';
import { extractErrorMessage } from '@/utils/error';
import { toast } from 'sonner';

export interface ChangeRoleModalProps {
  user: User | null;
  currentUserId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userId: string, newRole: UserRole) => Promise<void>;
}

export const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({
  user,
  currentUserId,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(USER_ROLES.MEMBER);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isSelf = user ? (user._id || user.id) === currentUserId : false;

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (isSelf) {
      const msg = 'You cannot change your own role.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await onSubmit(user._id || user.id, selectedRole);
      toast.success(`Role updated to ${USER_ROLE_LABELS[selectedRole]}`);
      onClose();
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to update user role');
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    { value: USER_ROLES.MEMBER, label: USER_ROLE_LABELS[USER_ROLES.MEMBER] },
    { value: USER_ROLES.MANAGER, label: USER_ROLE_LABELS[USER_ROLES.MANAGER] },
    { value: USER_ROLES.ADMIN, label: USER_ROLE_LABELS[USER_ROLES.ADMIN] },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Change Role: ${user?.name || ''}`}
      maxWidth="sm"
    >
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {isSelf && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-medium">
          Note: System rules prevent modifying your own administrator role.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Select New Role"
          options={roleOptions}
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as UserRole)}
          disabled={isSelf}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="gold"
            type="submit"
            isLoading={isSubmitting}
            disabled={isSelf || selectedRole === user?.role}
          >
            Update Role
          </Button>
        </div>
      </form>
    </Modal>
  );
};
