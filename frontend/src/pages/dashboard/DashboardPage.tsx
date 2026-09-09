import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  TrendingUp,
  FolderKanban,
  PlusCircle,
  ClipboardList,
  Users,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { USER_ROLES } from '@/constants/roles';
import { dashboardApi } from '@/api/dashboardApi';
import {
  DashboardSummaryData,
  TaskTrendItem,
  MemberStatusItem,
  ProjectWorkloadItem,
  TimeDistributionCategory,
  ActivityFeedItem,
} from '@/types/dashboard';
import { Button } from '@/components/common/Button';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorState } from '@/components/common/ErrorState';
import { formatDistanceToNow, parseISO } from 'date-fns';

const PIE_COLORS = ['#62242F', '#B7872A', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'];

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isManagerOrAdmin = user?.role === USER_ROLES.MANAGER || user?.role === USER_ROLES.ADMIN;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<DashboardSummaryData | null>(null);
  const [trends, setTrends] = useState<TaskTrendItem[]>([]);
  const [memberStatuses, setMemberStatuses] = useState<MemberStatusItem[]>([]);
  const [workloads, setWorkloads] = useState<ProjectWorkloadItem[]>([]);
  const [timeDist, setTimeDist] = useState<TimeDistributionCategory[]>([]);
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [
        summaryData,
        trendsData,
        timeDistData,
        activitiesData,
      ] = await Promise.all([
        dashboardApi.getSummary().catch(() => null),
        dashboardApi.getTaskTrends().catch(() => ({ trends: [] })),
        dashboardApi.getTimeDistribution().catch(() => ({ categories: [] })),
        dashboardApi.getActivity().catch(() => ({ activity: [] })),
      ]);

      setSummary(summaryData);
      setTrends(trendsData?.trends || []);
      setTimeDist(timeDistData?.categories || []);
      setActivities(activitiesData?.activity || []);

      if (isManagerOrAdmin) {
        const [membersData, workloadsData] = await Promise.all([
          dashboardApi.getMemberStatuses().catch(() => ({ members: [] })),
          dashboardApi.getProjectWorkload().catch(() => ({ projects: [] })),
        ]);
        setMemberStatuses(membersData?.members || []);
        setWorkloads(workloadsData?.projects || []);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [isManagerOrAdmin]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const formatActivityTime = (iso?: string) => {
    if (!iso) return '';
    try {
      return formatDistanceToNow(parseISO(iso), { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title={`Welcome back, ${user?.name || 'Team Member'}`}
        description="Monitor your weekly report progress, review workflows, and operational metrics."
        actions={
          <div className="flex flex-wrap gap-2.5">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/reports')}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              My Reports
            </Button>
            {isManagerOrAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/reviews')}
                leftIcon={<ClipboardList className="w-4 h-4" />}
                className="bg-white border border-slate-200"
              >
                Review Queue
              </Button>
            )}
          </div>
        }
      />

      {error && <ErrorState message={error} onRetry={loadDashboardData} />}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reports */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isManagerOrAdmin ? 'Total Reports' : 'My Reports'}
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {isLoading ? '...' : summary?.totalReports ?? 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {summary?.submittedReports ?? 0} submitted this cycle
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Review
            </p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">
              {isLoading ? '...' : summary?.pendingReviews ?? 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {summary?.needsCorrectionReports ?? 0} needing revision
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Approved Reports */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Approved
            </p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">
              {isLoading ? '...' : summary?.approvedReports ?? 0}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Fully signed off</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Compliance / Blockers */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Compliance Rate
            </p>
            <h3 className="text-2xl font-bold text-[#62242F] mt-1">
              {isLoading ? '...' : `${summary?.complianceRate ?? 100}%`}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {summary?.openBlockers ?? 0} open blockers reported
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#F7EBEF] border border-[#62242F]/10 flex items-center justify-center text-[#62242F]">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Section: Trends & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Trends Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Task Completion Trends</h3>
              <p className="text-xs text-slate-500">Completed vs planned tasks across cycles</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="completedTasks" name="Completed" fill="#62242F" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="plannedTasks" name="Planned" fill="#B7872A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No trend data available for the current period
              </div>
            )}
          </div>
        </div>

        {/* Time Distribution Pie Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Time Allocation</h3>
            <p className="text-xs text-slate-500">Distribution by activity type</p>
          </div>
          <div className="flex-1 h-52 w-full mt-2">
            {timeDist.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={timeDist}
                    dataKey="hours"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {timeDist.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} hrs`, 'Time Spent']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No time distribution records
              </div>
            )}
          </div>
          {timeDist.length > 0 && (
            <div className="mt-2 space-y-1.5 max-h-24 overflow-y-auto pr-1">
              {timeDist.map((item, idx) => (
                <div key={item.category} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span className="text-slate-700 truncate max-w-[130px]">{item.category}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{item.hours}h ({item.percentage}%)</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row: Workload by Project & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Workload (Manager/Admin or General) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Project Workload Allocation</h3>
              <p className="text-xs text-slate-500">Tracked hours and completed tasks by project</p>
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="text-xs font-semibold text-[#62242F] hover:underline flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {workloads.length > 0 ? (
            <div className="space-y-3">
              {workloads.map((proj) => (
                <div key={proj.projectId} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-800">
                      [{proj.projectCode}] {proj.projectName}
                    </span>
                    <span className="font-bold text-[#62242F]">{proj.hoursSpent} hrs</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#62242F] h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, Math.max(10, (proj.hoursSpent / 40) * 100))}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {proj.completedTaskCount} completed tasks
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
              <FolderKanban className="w-6 h-6 stroke-slate-300" />
              <span>No project workload statistics available</span>
            </div>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
              <p className="text-xs text-slate-500">Audit trail of system events</p>
            </div>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-80 pr-1">
            {activities.length > 0 ? (
              activities.map((act) => (
                <div key={act.id} className="text-xs border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] mb-0.5">
                    <span className="font-medium text-slate-800">{act.user?.name || 'System'}</span>
                    <span>{formatActivityTime(act.timestamp)}</span>
                  </div>
                  <p className="text-slate-700 font-medium">{act.title}</p>
                  {act.details && (
                    <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">{act.details}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="h-32 flex items-center justify-center text-xs text-slate-400">
                No recent activity recorded
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team Member Statuses Table for Managers/Admins */}
      {isManagerOrAdmin && memberStatuses.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Team Member Submission Status</h3>
              <p className="text-xs text-slate-500">Summary of weekly report submissions across the team</p>
            </div>
            <Users className="w-4 h-4 text-slate-400 shrink-0" />
          </div>

          {/* Mobile stacked cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {memberStatuses.map((m) => (
              <div key={m.userId} className="px-4 py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{m.name}</p>
                    <p className="text-[11px] text-slate-400">{m.email}</p>
                  </div>
                  <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                    {m.role}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 text-center">
                  <div className="bg-slate-50 rounded-lg p-1.5">
                    <p className="text-[10px] text-slate-400 font-medium">Drafts</p>
                    <p className="text-sm font-bold text-slate-600">{m.draftCount}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-1.5">
                    <p className="text-[10px] text-blue-400 font-medium">Submitted</p>
                    <p className="text-sm font-bold text-blue-600">{m.submittedCount}</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-1.5">
                    <p className="text-[10px] text-amber-400 font-medium">Revision</p>
                    <p className="text-sm font-bold text-amber-600">{m.needsCorrectionCount}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-1.5">
                    <p className="text-[10px] text-emerald-400 font-medium">Approved</p>
                    <p className="text-sm font-bold text-emerald-600">{m.approvedCount}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Member</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3 text-center">Drafts</th>
                  <th className="px-5 py-3 text-center">Submitted</th>
                  <th className="px-5 py-3 text-center">Need Revision</th>
                  <th className="px-5 py-3 text-center">Approved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {memberStatuses.map((m) => (
                  <tr key={m.userId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-900">{m.name}</p>
                      <p className="text-[11px] text-slate-400">{m.email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {m.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center font-medium text-slate-600">{m.draftCount}</td>
                    <td className="px-5 py-3.5 text-center font-semibold text-blue-600">{m.submittedCount}</td>
                    <td className="px-5 py-3.5 text-center font-semibold text-amber-600">{m.needsCorrectionCount}</td>
                    <td className="px-5 py-3.5 text-center font-semibold text-emerald-600">{m.approvedCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
