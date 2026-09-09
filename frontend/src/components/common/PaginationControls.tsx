import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export interface PaginationControlsProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (newPage: number) => void;
  onLimitChange?: (newLimit: number) => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}) => {
  const safeTotal = typeof total === 'number' && !isNaN(total) ? total : 0;
  if (safeTotal === 0) return null;

  const safePage = Math.max(1, typeof page === 'number' && !isNaN(page) ? page : 1);
  const safeLimit = Math.max(1, typeof limit === 'number' && !isNaN(limit) ? limit : 10);
  const safeTotalPages = Math.max(1, typeof totalPages === 'number' && !isNaN(totalPages) ? totalPages : 1);

  const startItem = (safePage - 1) * safeLimit + 1;
  const endItem = Math.min(safePage * safeLimit, safeTotal);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-1">
      <div className="text-xs text-slate-500">
        Showing <span className="font-medium text-slate-800">{startItem}</span> to{' '}
        <span className="font-medium text-slate-800">{endItem}</span> of{' '}
        <span className="font-medium text-slate-800">{safeTotal}</span> results
      </div>

      <div className="flex items-center gap-3">
        {onLimitChange && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Per page:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="px-2 py-1 border border-slate-300 rounded-md bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#62242F]"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="px-3 text-xs font-medium text-slate-700">
            Page {page} of {safeTotalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= safeTotalPages}
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
