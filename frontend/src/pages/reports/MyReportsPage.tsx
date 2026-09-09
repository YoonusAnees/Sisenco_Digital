import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportApi, GetMyReportsQueryParams } from '@/api/reportApi';
import { projectApi } from '@/api/projectApi';
import { WeeklyReport, CreateReportPayload, UpdateReportPayload } from '@/types/report';
import { REPORT_STATUSES, ReportStatus } from '@/constants/reports';
import { PageHeader } from '@/components/common/PageHeader';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { PaginationControls } from '@/components/common/PaginationControls';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { ReportListCard } from '@/features/reports/ReportListCard';
import { ReportEditorModal } from '@/features/reports/ReportEditorModal';
import { ReportDetailModal } from '@/features/reports/ReportDetailModal';
import { extractErrorMessage } from '@/utils/error';
import { FilePlus, FileText } from 'lucide-react';
import { toast } from 'sonner';

export const MyReportsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [queryParams, setQueryParams] = useState<GetMyReportsQueryParams>({
    page: 1,
    limit: 9,
    status: undefined,
    sortOrder: 'desc',
  });

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<WeeklyReport | null>(null);
  const [viewingReport, setViewingReport] = useState<WeeklyReport | null>(null);
  const [submittingReport, setSubmittingReport] = useState<WeeklyReport | null>(null);

  /* Data */
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['myReports', queryParams],
    queryFn: () => reportApi.getMyReports(queryParams),
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects', { limit: 100, status: 'active' }],
    queryFn: () => projectApi.getProjects({ limit: 100, status: 'active' }),
  });
  const projects = projectsData?.projects ?? [];

  /* Mutations */
  const createMutation = useMutation({
    mutationFn: (payload: CreateReportPayload) => reportApi.createReport(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myReports'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateReportPayload }) =>
      reportApi.updateReport(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myReports'] }),
  });

  const submitMutation = useMutation({
    mutationFn: (reportId: string) => reportApi.submitReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myReports'] });
      toast.success('Report submitted successfully!');
      setSubmittingReport(null);
    },
    onError: (err) => toast.error(extractErrorMessage(err, 'Failed to submit report')),
  });

  /* Handlers */
  const handleSaveReport = async (payload: CreateReportPayload) => {
    if (editingReport) {
      const id = editingReport._id || editingReport.id;
      await updateMutation.mutateAsync({ id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: REPORT_STATUSES.DRAFT, label: 'Draft' },
    { value: REPORT_STATUSES.SUBMITTED, label: 'Submitted' },
    { value: REPORT_STATUSES.NEEDS_CORRECTION, label: 'Needs Correction' },
    { value: REPORT_STATUSES.APPROVED, label: 'Approved' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Weekly Reports"
        description="Create, edit and track your weekly progress reports."
        actions={
          <Button
            variant="primary"
            leftIcon={<FilePlus className="w-4 h-4" />}
            onClick={() => {
              setEditingReport(null);
              setIsEditorOpen(true);
            }}
          >
            New Report
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <Select
          options={statusOptions}
          value={queryParams.status || ''}
          onChange={(e) =>
            setQueryParams((p) => ({ ...p, status: (e.target.value as ReportStatus) || undefined, page: 1 }))
          }
          className="w-40"
        />
        <Select
          options={[
            { value: 'desc', label: 'Newest First' },
            { value: 'asc', label: 'Oldest First' },
          ]}
          value={queryParams.sortOrder || 'desc'}
          onChange={(e) =>
            setQueryParams((p) => ({ ...p, sortOrder: e.target.value as 'asc' | 'desc' }))
          }
          className="w-40"
        />
      </div>

      {/* Content */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      )}

      {isError && (
        <ErrorState
          message={extractErrorMessage(error, 'Failed to load reports')}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && data && (
        <>
          {data.reports.length === 0 ? (
            <EmptyState
              icon={<FileText className="w-6 h-6" />}
              title="No reports yet"
              description="Start by creating your first weekly report."
              action={
                <Button
                  variant="primary"
                  leftIcon={<FilePlus className="w-4 h-4" />}
                  onClick={() => {
                    setEditingReport(null);
                    setIsEditorOpen(true);
                  }}
                >
                  Create Report
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.reports.map((report) => (
                  <ReportListCard
                    key={report._id || report.id}
                    report={report}
                    onView={(r) => setViewingReport(r)}
                    onEdit={(r) => {
                      setEditingReport(r);
                      setIsEditorOpen(true);
                    }}
                    onSubmit={(r) => setSubmittingReport(r)}
                  />
                ))}
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
      <ReportEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingReport(null);
        }}
        report={editingReport}
        projects={projects}
        onSubmit={handleSaveReport}
      />

      <ReportDetailModal
        report={viewingReport}
        isOpen={!!viewingReport}
        onClose={() => setViewingReport(null)}
        onEdit={(r) => {
          setViewingReport(null);
          setEditingReport(r);
          setIsEditorOpen(true);
        }}
      />

      <ConfirmationDialog
        isOpen={!!submittingReport}
        onClose={() => setSubmittingReport(null)}
        onConfirm={() => {
          const id = submittingReport?._id || submittingReport?.id;
          if (id) submitMutation.mutate(id);
        }}
        title="Submit Report"
        message={`Submit week ${submittingReport?.weekNumber || ''} report for manager review? You can resubmit if corrections are requested.`}
        confirmText="Submit"
        variant="primary"
        isLoading={submitMutation.isPending}
      />
    </div>
  );
};