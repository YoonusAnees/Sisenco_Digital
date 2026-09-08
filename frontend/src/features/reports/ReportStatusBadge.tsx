import React from 'react';
import { ReportStatus, REPORT_STATUSES } from '@/constants/reports';
import { cn } from '@/utils/cn';

interface ReportStatusBadgeProps {
  status: ReportStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  ReportStatus,
  { label: string; className: string }
> = {
  [REPORT_STATUSES.DRAFT]: {
    label: 'Draft',
    className: 'bg-slate-100 text-slate-600 border border-slate-200',
  },
  [REPORT_STATUSES.SUBMITTED]: {
    label: 'Submitted',
    className: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
  [REPORT_STATUSES.NEEDS_CORRECTION]: {
    label: 'Needs Correction',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  [REPORT_STATUSES.APPROVED]: {
    label: 'Approved',
    className: 'bg-green-50 text-green-700 border border-green-200',
  },
};

export const ReportStatusBadge: React.FC<ReportStatusBadgeProps> = ({
  status,
  className,
}) => {
  const config = STATUS_CONFIG[status] || {
    label: status,
    className: 'bg-slate-100 text-slate-600',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};
