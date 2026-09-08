import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Info,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { notificationApi } from '@/api/notificationApi';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationItem } from '@/types/notification';
import { NOTIFICATION_TYPES } from '@/constants/notifications';
import { Button } from '@/components/common/Button';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { PaginationControls } from '@/components/common/PaginationControls';
import { cn } from '@/utils/cn';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await notificationApi.getNotifications({
        page,
        limit,
        isRead: filterUnreadOnly ? false : undefined,
      });
      setNotifications(data.notifications || []);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load notifications';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, filterUnreadOnly]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkOne = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      await markAsRead(notification._id || notification.id);
      setNotifications((prev) =>
        prev.map((n) =>
          (n._id || n.id) === (notification._id || notification.id)
            ? { ...n, isRead: true }
            : n
        )
      );
    }
    if (notification.reportId) {
      navigate('/reports');
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case NOTIFICATION_TYPES.REPORT_APPROVED:
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case NOTIFICATION_TYPES.CHANGES_REQUESTED:
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case NOTIFICATION_TYPES.REPORT_SUBMITTED:
      case NOTIFICATION_TYPES.REPORT_RESUBMITTED:
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-[#62242F]" />;
    }
  };

  const getRelativeTime = (isoString?: string) => {
    if (!isoString) return 'recently';
    try {
      return formatDistanceToNow(parseISO(isoString), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay updated with weekly report status changes, reviews, and mentions."
        actions={
          unreadCount > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAll}
              leftIcon={<CheckCheck className="w-4 h-4" />}
            >
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      {/* Tabs / Filters */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setFilterUnreadOnly(false);
              setPage(1);
            }}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
              !filterUnreadOnly
                ? 'bg-[#62242F] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            )}
          >
            All
          </button>
          <button
            onClick={() => {
              setFilterUnreadOnly(true);
              setPage(1);
            }}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5',
              filterUnreadOnly
                ? 'bg-[#62242F] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            )}
          >
            Unread
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#B7872A] text-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse p-4" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchNotifications} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-6 h-6" />}
          title={filterUnreadOnly ? 'No unread notifications' : 'No notifications yet'}
          description={
            filterUnreadOnly
              ? 'You have caught up with all your notifications.'
              : 'Notifications about report approvals, revisions, and mentions will appear here.'
          }
        />
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => {
            const notifId = n._id || n.id;
            return (
              <div
                key={notifId}
                onClick={() => handleMarkOne(n)}
                className={cn(
                  'group flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer',
                  n.isRead
                    ? 'bg-white border-slate-200/80 hover:border-slate-300'
                    : 'bg-amber-50/40 border-amber-200/70 hover:bg-amber-50/70 shadow-xs'
                )}
              >
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs shrink-0 mt-0.5">
                  {getNotificationIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={cn(
                        'text-sm font-medium leading-snug',
                        n.isRead ? 'text-slate-800' : 'text-slate-900 font-semibold'
                      )}
                    >
                      {n.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">
                      {getRelativeTime(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.message}</p>

                  {n.reportId && (
                    <div className="mt-2.5 flex items-center gap-1 text-xs font-semibold text-[#62242F] group-hover:underline">
                      <span>View report</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {!n.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B7872A] shrink-0 mt-2" />
                )}
              </div>
            );
          })}

          {totalPages > 1 && (
            <div className="pt-4">
              <PaginationControls
                page={page}
                totalPages={totalPages}
                total={total}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
