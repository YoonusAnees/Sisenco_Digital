import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { socket } from '@/lib/socket';
import { notificationApi } from '@/api/notificationApi';
import { NotificationItem } from '@/types/notification';
import { SOCKET_EVENTS } from '@/constants/socket';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationContextValue {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationApi.getUnreadCount();
      setUnreadCount(data.count ?? 0);
    } catch {
      // Ignore count fetch errors gracefully
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationApi.markOneAsRead(id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, []);

  // Connect socket and register event listeners
  useEffect(() => {
    if (user) {
      refreshUnreadCount();

      if (!socket.connected) {
        socket.connect();
      }

      const handleNewNotification = (notification: NotificationItem) => {
        setUnreadCount((prev) => prev + 1);
        toast.info(notification.title || 'New Notification', {
          description: notification.message,
          duration: 5000,
        });
      };

      const handleCountChanged = (data: { count: number }) => {
        if (typeof data?.count === 'number') {
          setUnreadCount(data.count);
        }
      };

      const handleReadAll = () => {
        setUnreadCount(0);
      };

      socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, handleNewNotification);
      socket.on(SOCKET_EVENTS.NOTIFICATION_COUNT_CHANGED, handleCountChanged);
      socket.on(SOCKET_EVENTS.NOTIFICATIONS_READ_ALL, handleReadAll);

      return () => {
        socket.off(SOCKET_EVENTS.NOTIFICATION_NEW, handleNewNotification);
        socket.off(SOCKET_EVENTS.NOTIFICATION_COUNT_CHANGED, handleCountChanged);
        socket.off(SOCKET_EVENTS.NOTIFICATIONS_READ_ALL, handleReadAll);
      };
    } else {
      if (socket.connected) {
        socket.disconnect();
      }
      setUnreadCount(0);
    }
  }, [isAuthenticated, user, refreshUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        refreshUnreadCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
