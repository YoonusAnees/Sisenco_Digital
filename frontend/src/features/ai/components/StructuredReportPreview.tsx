import React from 'react';
import { AiStructuredReport } from '../types/ai';
import { Button } from '@/components/common/Button';
import { CheckCircle2, CalendarRange, AlertTriangle, Star, Check, X } from 'lucide-react';

interface StructuredReportPreviewProps {
  report: AiStructuredReport;
  onApply?: (report: AiStructuredReport) => void;
  onDismiss?: () => void;
  isApplied?: boolean;
}

export const StructuredReportPreview: React.FC<StructuredReportPreviewProps> = ({
  report,
  onApply,
  onDismiss,
  isApplied = false,
}) => {
  const completedCount = report.completedTasks?.length || 0;
  const nextWeekCount = report.nextWeekTasks?.length || 0;
  const blockersCount = report.blockers?.length || 0;
  const achievementsCount = report.achievements?.length || 0;
  const totalHours = (report.hoursBreakdown || []).reduce((acc, h) => acc + (h.hours || 0), 0);

  return (
    <div className="mt-3 bg-white border border-[#B7872A]/30 rounded-xl overflow-hidden shadow-xs">
      {/* Header */}
      <div className="bg-[#62242F]/10 px-3.5 py-2.5 border-b border-[#B7872A]/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#B7872A]" />
          <h4 className="text-xs font-bold text-[#62242F] uppercase tracking-wider">
            Structured Report Preview
          </h4>
        </div>
        {totalHours > 0 && (
          <span className="text-[11px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-full border border-slate-200">
            {totalHours}h estimated
          </span>
        )}
      </div>

      <div className="p-3.5 space-y-3 text-xs text-slate-700 max-h-80 overflow-y-auto">
        {/* Summary */}
        {report.summary && (
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
              Summary
            </p>
            <p className="text-slate-700 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
              "{report.summary}"
            </p>
          </div>
        )}

        {/* Completed Tasks */}
        {completedCount > 0 && (
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-emerald-700 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed Tasks ({completedCount})</span>
            </div>
            <ul className="space-y-1 pl-4 list-disc text-slate-600">
              {report.completedTasks?.map((t, i) => (
                <li key={i}>
                  <span className="font-medium text-slate-800">{t.title}</span>
                  {t.hoursSpent !== undefined && t.hoursSpent > 0 && (
                    <span className="text-slate-400 text-[11px]"> ({t.hoursSpent}h)</span>
                  )}
                  {t.description && (
                    <p className="text-[11px] text-slate-500 font-normal">{t.description}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next Week Tasks */}
        {nextWeekCount > 0 && (
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-[#B7872A] mb-1">
              <CalendarRange className="w-3.5 h-3.5" />
              <span>Next Week Tasks ({nextWeekCount})</span>
            </div>
            <ul className="space-y-1 pl-4 list-disc text-slate-600">
              {report.nextWeekTasks?.map((t, i) => (
                <li key={i}>
                  <span className="font-medium text-slate-800">{t.title}</span>
                  {t.priority && (
                    <span className="text-[10px] uppercase font-bold text-slate-500 ml-1 px-1.5 py-0.2 bg-slate-100 rounded">
                      {t.priority}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Blockers */}
        {blockersCount > 0 && (
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-red-600 mb-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Blockers ({blockersCount})</span>
            </div>
            <ul className="space-y-1.5">
              {report.blockers?.map((b, i) => (
                <li key={i} className="bg-red-50/70 p-2 rounded border border-red-100 text-red-800">
                  <p className="font-semibold">{b.title}</p>
                  <p className="text-[11px] text-red-600 mt-0.5">{b.description}</p>
                  {b.assistanceNeeded && (
                    <p className="text-[10px] text-red-500 mt-1">
                      <span className="font-medium">Assistance:</span> {b.assistanceNeeded}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Achievements */}
        {achievementsCount > 0 && (
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-emerald-700 mb-1">
              <Star className="w-3.5 h-3.5" />
              <span>Achievements ({achievementsCount})</span>
            </div>
            <ul className="space-y-1 pl-4 list-disc text-slate-600">
              {report.achievements?.map((a, i) => (
                <li key={i} className="font-medium text-slate-800">
                  {a.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Confirmation Actions */}
      <div className="bg-slate-50 p-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-400">
          {isApplied ? '✓ Applied to report' : 'Review before applying'}
        </span>
        <div className="flex items-center gap-2">
          {onDismiss && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              leftIcon={<X className="w-3 h-3" />}
              onClick={onDismiss}
              className="text-xs h-7 px-2 text-slate-500"
            >
              Dismiss
            </Button>
          )}
          {onApply && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              leftIcon={<Check className="w-3 h-3" />}
              disabled={isApplied}
              onClick={() => onApply(report)}
              className="text-xs h-7 px-3 bg-[#62242F] hover:bg-[#48282D]"
            >
              {isApplied ? 'Applied' : 'Apply to Report Form'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};