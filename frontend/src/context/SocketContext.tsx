import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getSocket } from '../services/socket';
import { api } from '../services/api';
import { ActivityLog, Notification } from '../types';

interface SocketContextType {
  onlineUsersCount: number;
  activities: ActivityLog[];
  notifications: Notification[];
  unreadCount: number;
  refreshActivities: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [onlineUsersCount, setOnlineUsersCount] = useState<number>(1);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchActivities = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/activity/recent?limit=20');
      if (res.data?.data?.activities) {
        setActivities(res.data.data.activities);
      }
    } catch (err) {
      console.error('Failed to fetch recent activities:', err);
    }
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      if (res.data?.data) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setActivities([]);
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Initial missed event catch-up from DB
    fetchActivities();
    fetchNotifications();

    const socket = getSocket();
    if (!socket) return;

    // Presence update handler
    const handlePresence = (data: { onlineUsersCount: number }) => {
      setOnlineUsersCount(data.onlineUsersCount);
    };

    // Live Activity Feed handler
    const handleNewActivity = (activity: ActivityLog) => {
      setActivities((prev) => {
        // Prevent duplicates
        if (prev.some((a) => a.id === activity.id)) return prev;
        return [activity, ...prev.slice(0, 49)]; // keep up to 50 latest in feed
      });
    };

    // Live Notification handler
    const handleNewNotification = (data: { notification: Notification; unreadCount: number }) => {
      setNotifications((prev) => [data.notification, ...prev]);
      setUnreadCount(data.unreadCount);
    };

    socket.on('presence:update', handlePresence);
    socket.on('activity:new', handleNewActivity);
    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('presence:update', handlePresence);
      socket.off('activity:new', handleNewActivity);
      socket.off('notification:new', handleNewNotification);
    };
  }, [user, fetchActivities, fetchNotifications]);

  const markNotificationRead = async (id: string) => {
    try {
      const res = await api.patch(`/notifications/${id}/read`);
      if (res.data?.data) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        onlineUsersCount,
        activities,
        notifications,
        unreadCount,
        refreshActivities: fetchActivities,
        refreshNotifications: fetchNotifications,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};
