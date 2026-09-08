import React, { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { REPORT_STATUSES, ReportStatus } from '@/constants/reports';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'draft'
    | 'submitted'
    | 'needs_correction'
    | 'approved'
    | 'active'
    | 'inactive'
    | 'info'
    | 'warning'
    | 'primary'
    | 'success'
    | 'danger';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    draft: 'bg-slate-100 text-slate-700 border-slate-300',
    submitted: 'bg-blue-50 text-blue-700 border-blue-200',
    needs_correction: 'bg-amber-50 text-amber-800 border-amber-300',
    approved: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    active: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    inactive: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    primary: 'bg-[#F7EBEF] text-[#62242F] border-[#62242F]/20',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    danger: 'bg-red-50 text-red-700 border-red-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px] font-semibold',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border tracking-wide uppercase font-medium transition-colors',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export const ReportStatusBadge: React.FC<{ status: ReportStatus; className?: string }> = ({
  status,
  className,
}) => {
  const statusConfig: Record<ReportStatus, { label: string; variant: BadgeProps['variant'] }> = {
    [REPORT_STATUSES.DRAFT]: { label: 'Draft', variant: 'draft' },
    [REPORT_STATUSES.SUBMITTED]: { label: 'Submitted', variant: 'submitted' },
    [REPORT_STATUSES.NEEDS_CORRECTION]: { label: 'Needs Correction', variant: 'needs_correction' },
    [REPORT_STATUSES.APPROVED]: { label: 'Approved', variant: 'approved' },
  };

  const config = statusConfig[status] || { label: status, variant: 'default' };

  return <Badge variant={config.variant} className={className}>{config.label}</Badge>;
};
