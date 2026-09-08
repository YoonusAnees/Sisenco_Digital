import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi, ReviewQueueParams } from '@/api/reviewApi';
import { WeeklyReport } from '@/types/report';
import { User } from '@/types/user';
import { PageHeader } from '@/components/common/PageHeader';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { PaginationControls } from '@/components/common/PaginationControls';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { ReportStatusBadge } from '@/features/reports/ReportStatusBadge';
import { ReportDetailModal } from '@/features/reports/ReportDetailModal';
import { ReviewActionModal } from '@/features/reviews/ReviewActionModal';
import { extractErrorMessage } from '@/utils/error';
import { formatDate } from '@/utils/date';
import { CheckCircle2, XCircle, Eye, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';

export const ReviewQueuePage: React.FC = () => {
  const queryClient = useQueryClient();

  const [queryParams, setQueryParams] = useState<ReviewQueueParams>({
    page: 1,
    limit: 10,
    status: 'submitted',
  });

  const [viewingReport, setViewingReport] = useState<WeeklyReport | null>(null);
  const [actionReport, setActionReport] = useState<WeeklyReport | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'request_changes'>('approve');

  /* ── Data ── */
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['reviewQueue', queryParams],
    queryFn: () => reviewApi.getReviewQueue(queryParams),
  });

  /* ── Mutations ── */
  const approveMutation = useMutation({
    mutationFn: ({ reportId, note }: { reportId: string; note?: string }) =>
      reviewApi.approveReport(reportId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviewQueue'] });
      toast.success('Report approved!');
    },
    onError: (err) => toast.error(extractErrorMessage(err, 'Failed to approve report')),
  });

  const requestChangesMutation = useMutation({
    mutationFn: ({ reportId, note }: { reportId: string; note: string }) =>
      reviewApi.requestChanges(reportId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviewQueue'] });
      toast.success('Changes requested — owner notified');
    },
    onError: (err) => toast.error(extractErrorMessage(err, 'Failed to request changes')),
  });

  /* ── Helpers ── */
  const openAction = (report: WeeklyReport, type: 'approve' | 'request_changes') => {
    setActionReport(report);
    setActionType(type);
  };

  const handleActionConfirm = async (note?: string) => {
    const id = actionReport?._id || actionReport?.id;
    if (!id) return;
    if (actionType === 'approve') {
      await approveMutation.mutateAsync({ reportId: id, note });
    } else {
      await requestChangesMutation.mutateAsync({ reportId: id, note: note || '' });
    }
    setActionReport(null);
  };

  const statusOptions = [
    { value: 'submitted', label: 'Submitted' },
    { value: 'needs_correction', label: 'Needs Correction' },
    { value: '', label: 'All' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review Queue"
        description="Review submitted reports, approve or request corrections."
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <Select
          options={statusOptions}
          value={queryParams.status || ''}
          onChange={(e) =>
            setQueryParams((p) => ({ ...p, status: e.target.value || undefined, page: 1 }))
          }
          className="w-48"
        />
      </div>

      {/* Content */}
      {isLoading && <LoadingSkeleton className="h-64 rounded-2xl" />}

      {isError && (
        <ErrorState
          message={extractErrorMessage(error, 'Failed to load review queue')}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && data && (
        <>
          {data.reports.length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="w-6 h-6" />}
              title="Queue is clear"
              description="No reports pending your review."
            />
          ) : (
            <div className="space-y-4">
              {/* Table-style list */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Member</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Week</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Submitted</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hours</th>
                      <th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.reports.map((report) => {
                      const owner = report.ownerId as User;
                      const ownerName = typeof owner === 'object' ? owner.name : 'Unknown';
                      const reportId = report._id || report.id;
                      return (
                        <tr key={reportId} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#62242F] text-white text-xs font-bold flex items-center justify-center shrink-0">
                                {ownerName.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-slate-900">{ownerName}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            Week {report.weekNumber}, {report.year}
                            <br />
                            <span className="text-xs text-slate-400">
                              {formatDate(report.weekStart)} – {formatDate(report.weekEnd)}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <ReportStatusBadge status={report.status} />
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-400">
                            {report.submittedAt ? formatDate(report.submittedAt) : '—'}
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-700">
                            {report.totalHours}h
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<Eye className="w-3.5 h-3.5" />}
                                onClick={() => setViewingReport(report)}
                              >
                                View
                              </Button>
                              <Button
                                variant="success"
                                size="sm"
                                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                                onClick={() => openAction(report, 'approve')}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="warning"
                                size="sm"
                                leftIcon={<XCircle className="w-3.5 h-3.5" />}
                                onClick={() => openAction(report, 'request_changes')}
                              >
                                Changes
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <PaginationControls
                page={data.pagination.page}
                totalPages={data.pagination.totalPages}
                total={data.pagination.total}
                limit={data.pagination.limit}
                onPageChange={(page) => setQueryParams((p) => ({ ...p, page }))}
                onLimitChange={(limit) => setQueryParams((p) => ({ ...p, limit, page: 1 }))}
              />
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <ReportDetailModal
        report={viewingReport}
        isOpen={!!viewingReport}
        onClose={() => setViewingReport(null)}
      />

      <ReviewActionModal
        isOpen={!!actionReport}
        onClose={() => setActionReport(null)}
        action={actionType}
        reportWeek={
          actionReport
            ? `Week ${actionReport.weekNumber}, ${actionReport.year}`
            : undefined
        }
        onConfirm={handleActionConfirm}
      />
    </div>
  );
};
