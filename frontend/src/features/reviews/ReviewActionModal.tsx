import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { extractErrorMessage } from '@/utils/error';
import { toast } from 'sonner';
import { CheckCircle2, XCircle } from 'lucide-react';

const noteSchema = z.object({
  note: z.string().max(1000).optional(),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface ReviewActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'approve' | 'request_changes';
  reportWeek?: string;
  onConfirm: (note?: string) => Promise<void>;
}

export const ReviewActionModal: React.FC<ReviewActionModalProps> = ({
  isOpen,
  onClose,
  action,
  reportWeek,
  onConfirm,
}) => {
  const isApproval = action === 'approve';

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: { note: '' },
  });

  const handleFormSubmit = async (data: NoteFormData) => {
    try {
      await onConfirm(data.note || undefined);
      reset();
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err, `Failed to ${isApproval ? 'approve' : 'request changes'}`));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      title={isApproval ? 'Approve Report' : 'Request Changes'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Icon & context */}
        <div className={`flex items-center gap-3 p-4 rounded-xl ${
          isApproval ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
        }`}>
          {isApproval ? (
            <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-amber-600 shrink-0" />
          )}
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {isApproval ? 'Approve' : 'Request Corrections for'} {reportWeek || 'this report'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {isApproval
                ? 'The report owner will be notified of the approval.'
                : 'The owner will be asked to make corrections and resubmit.'}
            </p>
          </div>
        </div>

        {/* Note (required for corrections, optional for approval) */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            {isApproval ? 'Note (optional)' : 'Correction Note *'}
          </label>
          <textarea
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#62242F]/30 resize-none h-24"
            placeholder={
              isApproval
                ? 'Any additional comments for the report owner...'
                : 'Explain what needs to be corrected...'
            }
            {...register('note')}
          />
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="ghost" onClick={() => { reset(); onClose(); }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={isApproval ? 'success' : 'warning'}
            isLoading={isSubmitting}
            leftIcon={
              isApproval
                ? <CheckCircle2 className="w-4 h-4" />
                : <XCircle className="w-4 h-4" />
            }
          >
            {isApproval ? 'Approve' : 'Request Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
