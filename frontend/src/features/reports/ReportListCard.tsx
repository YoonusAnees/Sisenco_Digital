import React from 'react';
import { WeeklyReport } from '@/types/report';
import { ReportStatusBadge } from './ReportStatusBadge';
import { Button } from '@/components/common/Button';
import { REPORT_STATUSES } from '@/constants/reports';
import { formatDate } from '@/utils/date';
import { FileText, Send, Eye, AlertTriangle } from 'lucide-react';

interface ReportListCardProps {
  report: WeeklyReport;
  onView: (report: WeeklyReport) => void;
  onSubmit: (report: WeeklyReport) => void;
}

export const ReportListCard: React.FC<ReportListCardProps> = ({
  report,
  onView,
  onSubmit,
}) => {
  const isDraft = report.status === REPORT_STATUSES.DRAFT;
  const needsCorrection = report.status === REPORT_STATUSES.NEEDS_CORRECTION;
  const canSubmit = isDraft || needsCorrection;

  const completedTaskCount = report.completedTasks?.length ?? 0;
  const blockerCount = report.blockers?.filter((b) => !b.isResolved).length ?? 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#62242F]/10 text-[#62242F] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 text-sm">
              Week {report.weekNumber}, {report.year}
            </p>
            <p className="text-xs text-slate-400">
              {formatDate(report.weekStart)} – {formatDate(report.weekEnd)}
            </p>
          </div>
        </div>
        <ReportStatusBadge status={report.status} className="shrink-0" />
      </div>

      {/* Summary */}
      {report.summary && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
          {report.summary}
        </p>
      )}

      {/* Correction Note */}
      {needsCorrection && report.lastCorrectionNote && (
        <div className="flex gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">{report.lastCorrectionNote}</p>
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-4 text-xs text-slate-500 mb-4">
        <span>
          <span className="font-semibold text-slate-700">{completedTaskCount}</span> tasks
        </span>
        <span>
          <span className="font-semibold text-slate-700">{report.totalHours ?? 0}h</span> logged
        </span>
        {blockerCount > 0 && (
          <span className="text-red-500">
            <span className="font-semibold">{blockerCount}</span> blocker{blockerCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Eye className="w-3.5 h-3.5" />}
          onClick={() => onView(report)}
        >
          View
        </Button>

        {canSubmit && (
          <Button
            variant={needsCorrection ? 'warning' : 'primary'}
            size="sm"
            leftIcon={<Send className="w-3.5 h-3.5" />}
            onClick={() => onSubmit(report)}
          >
            {needsCorrection ? 'Resubmit' : 'Submit'}
          </Button>
        )}
      </div>
    </div>
  );
};
