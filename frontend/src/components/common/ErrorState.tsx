import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load data',
  message = 'An error occurred while loading this section. Please try again.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50/50 rounded-xl border border-red-200 text-center space-y-3">
      <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
        <AlertCircle className="w-5 h-5" />
      </div>
      <div className="space-y-1 max-w-md">
        <h4 className="text-sm font-semibold text-red-900">{title}</h4>
        <p className="text-xs text-red-600">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="border-red-300 text-red-700 hover:bg-red-100/50"
        >
          Retry
        </Button>
      )}
    </div>
  );
};
