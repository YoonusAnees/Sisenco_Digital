import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'There are no items to display at this time.',
  icon,
  actionLabel,
  onAction,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-white rounded-xl border border-dashed border-slate-300 text-center space-y-3">
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      {action ? (
        <div className="mt-2">{action}</div>
      ) : actionLabel && onAction ? (
        <Button variant="outline" size="sm" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
};
