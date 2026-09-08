import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportApi } from '@/api/reportApi';
import { Modal } from '@/components/common/Modal';
import { ReportStatusBadge } from './ReportStatusBadge';
import { WeeklyReport } from '@/types/report';
import { Project } from '@/types/project';
import { User } from '@/types/user';
import { formatDate } from '@/utils/date';
import { TableSkeleton } from '@/components/common/LoadingSkeleton';
import {
  CheckCircle2,
  CalendarRange,
  AlertTriangle,
  Star,
  Clock,
  Link2,
  History,
} from 'lucide-react';
import { HOURS_CATEGORY_LABELS } from '@/constants/reports';

interface ReportDetailModalProps {
  report: WeeklyReport | null;
  isOpen: boolean;
  onClose: () => void;
}

const resolveProject = (val: unknown): string => {
  if (!val) return '—';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null && 'name' in val)
    return (val as Project).name;
  return '—';
};

const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; color?: string }> = ({
  title, icon, children, color = '#62242F'
}) => (
  <div className="border border-slate-200 rounded-xl overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
      <span style={{ color }}>{icon}</span>
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  isOpen,
  onClose,
}) => {
  const reportId = report?._id || report?.id || '';

  const { data: versionsData, isLoading: versionsLoading } = useQuery({
    queryKey: ['reportVersions', reportId],
    queryFn: () => reportApi.getReportVersions(reportId, { limit: 10 }),
    enabled: isOpen && !!reportId,
  });

  if (!report) return null;

  const ownerName =
    typeof report.ownerId === 'object' && report.ownerId !== null
      ? (report.ownerId as User).name
      : 'Unknown';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Week ${report.weekNumber}, ${report.year}`} maxWidth="2xl">
      <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
        {/* Header meta */}
        <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <ReportStatusBadge status={report.status} />
          <span className="text-xs text-slate-500">
            {formatDate(report.weekStart)} – {formatDate(report.weekEnd)}
          </span>
          <span className="text-xs text-slate-500">Owner: <span className="font-medium text-slate-700">{ownerName}</span></span>
          <span className="text-xs text-slate-500">
            Total: <span className="font-semibold text-slate-700">{report.totalHours}h</span>
          </span>
          <span className="text-xs text-slate-500">v{report.currentVersion}</span>
        </div>

        {/* Summary */}
        {report.summary && (
          <p className="text-sm text-slate-600 leading-relaxed px-1">{report.summary}</p>
        )}

        {/* Correction note */}
        {report.lastCorrectionNote && (
          <div className="flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-700 mb-0.5">Correction Note</p>
              <p className="text-xs text-amber-700">{report.lastCorrectionNote}</p>
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {report.completedTasks?.length > 0 && (
          <SectionCard title={`Completed Tasks (${report.completedTasks.length})`} icon={<CheckCircle2 className="w-4 h-4" />}>
            <div className="space-y-2">
              {report.completedTasks.map((t, i) => (
                <div key={t._id || i} className="flex items-start justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">{t.title}</p>
                    {t.description && <p className="text-xs text-slate-400 mt-0.5">{t.description}</p>}
                    <p className="text-xs text-slate-400 mt-0.5">{resolveProject(t.project)}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 shrink-0">{t.hoursSpent}h</span>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Next Week Tasks */}
        {report.nextWeekTasks?.length > 0 && (
          <SectionCard title={`Next Week Plan (${report.nextWeekTasks.length})`} icon={<CalendarRange className="w-4 h-4" />} color="#B7872A">
            <div className="space-y-2">
              {report.nextWeekTasks.map((t, i) => (
                <div key={t._id || i} className="flex items-start justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">{t.title}</p>
                    <p className="text-xs text-slate-400">{resolveProject(t.project)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {t.priority && (
                      <span className={`text-xs font-semibold capitalize px-2 py-0.5 rounded-full ${
                        t.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        t.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        t.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>{t.priority}</span>
                    )}
                    {t.dueDate && <span className="text-xs text-slate-400">{formatDate(t.dueDate)}</span>}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Blockers */}
        {report.blockers?.length > 0 && (
          <SectionCard title={`Blockers (${report.blockers.length})`} icon={<AlertTriangle className="w-4 h-4" />} color="#DC2626">
            <div className="space-y-3">
              {report.blockers.map((b, i) => (
                <div key={b._id || i} className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-sm font-semibold text-red-800">{b.title}</p>
                  <p className="text-xs text-red-600 mt-1">{b.description}</p>
                  {b.impact && <p className="text-xs text-red-500 mt-1"><span className="font-medium">Impact:</span> {b.impact}</p>}
                  {b.assistanceNeeded && <p className="text-xs text-red-500 mt-1"><span className="font-medium">Needs:</span> {b.assistanceNeeded}</p>}
                  <p className="text-xs text-red-400 mt-1">{resolveProject(b.project)}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Achievements */}
        {report.achievements?.length > 0 && (
          <SectionCard title={`Achievements (${report.achievements.length})`} icon={<Star className="w-4 h-4" />} color="#059669">
            <div className="space-y-2">
              {report.achievements.map((a, i) => (
                <div key={a._id || i} className="py-2 border-b border-slate-100 last:border-0">
                  <p className="text-sm font-medium text-slate-900">{a.title}</p>
                  {a.description && <p className="text-xs text-slate-400 mt-0.5">{a.description}</p>}
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Hours Breakdown */}
        {report.hoursBreakdown?.length > 0 && (
          <SectionCard title="Hours Breakdown" icon={<Clock className="w-4 h-4" />} color="#7C3AED">
            <div className="space-y-2">
              {report.hoursBreakdown.map((h, i) => (
                <div key={h._id || i} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                  <div>
                    <span className="text-sm text-slate-800">{resolveProject(h.project)}</span>
                    <span className="text-xs text-slate-400 ml-2">· {HOURS_CATEGORY_LABELS[h.category] || h.category}</span>
                    {h.notes && <p className="text-xs text-slate-400">{h.notes}</p>}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{h.hours}h</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-sm font-semibold text-slate-700">Total</span>
                <span className="text-sm font-bold text-[#62242F]">{report.totalHours}h</span>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Links */}
        {report.links?.length > 0 && (
          <SectionCard title="Links" icon={<Link2 className="w-4 h-4" />} color="#0891B2">
            <div className="space-y-2">
              {report.links.map((l, i) => (
                <a
                  key={l._id || i}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[#0891B2] hover:underline"
                >
                  <Link2 className="w-3.5 h-3.5 shrink-0" />
                  {l.label}
                </a>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Version History */}
        <SectionCard title="Version History" icon={<History className="w-4 h-4" />} color="#64748B">
          {versionsLoading && <TableSkeleton rows={3} columns={3} />}
          {!versionsLoading && versionsData && (
            <div className="space-y-2">
              {versionsData.versions.length === 0 && (
                <p className="text-xs text-slate-400">No submission history yet.</p>
              )}
              {versionsData.versions.map((v) => (
                <div key={v._id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm font-medium text-slate-700">Version {v.versionNumber}</span>
                  <span className="text-xs text-slate-400">{formatDate(v.submittedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </Modal>
  );
};
