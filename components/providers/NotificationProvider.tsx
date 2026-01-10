'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/lib/ToastContext';
import { Notification, NotificationType } from '@/lib/notifications/types';
import { notificationService } from '@/lib/notifications/service';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    addNotification: (title: string, message: string, type: NotificationType, link?: string) => void;
    refresh: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const { showToast } = useToast();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const lastNotificationIdRef = useRef<string | null>(null);
    const isInitialLoadRef = useRef(true);

    const userId = session?.user?.email; // Use email as unique ID

    // Refresh notifications from database
    const refresh = useCallback(async () => {
        if (!userId) {
            setNotifications([]);
            setUnreadCount(0);
            setLoading(false);
            return;
        }

        try {
            const [current, unread] = await Promise.all([
                notificationService.getNotifications(userId),
                notificationService.getUnreadCount(userId),
            ]);

            // Check for new notifications (after initial load)
            if (!isInitialLoadRef.current && current.length > 0) {
                const latestId = current[0].id;
                if (lastNotificationIdRef.current && latestId !== lastNotificationIdRef.current) {
                    // New notification arrived - show toast
                    const latest = current[0];
                    showToast(
                        latest.message,
                        latest.type === 'SUBMISSION_APPROVED' ? 'success' :
                            latest.type === 'SUBMISSION_REJECTED' ? 'warning' :
                                latest.type === 'ERROR' ? 'error' : 'info'
                    );
                }
                lastNotificationIdRef.current = latestId;
            } else if (current.length > 0) {
                lastNotificationIdRef.current = current[0].id;
            }

            isInitialLoadRef.current = false;
            setNotifications(current);
            setUnreadCount(unread);
        } catch (error) {
            console.error('Error refreshing notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [userId, showToast]);

    // Polling effect
    useEffect(() => {
        refresh(); // Initial load

        if (!userId) return;

        const intervalId = setInterval(() => {
            refresh();
        }, 10000); // Poll every 10 seconds (reduced from 5s for database)

        return () => clearInterval(intervalId);
    }, [refresh, userId]);

    const markAsRead = useCallback(async (id: string) => {
        await notificationService.markAsRead(id);
        // Optimistic update
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    }, []);

    const markAllAsRead = useCallback(async () => {
        if (!userId) return;
        await notificationService.markAllAsRead(userId);
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    }, [userId]);

    const addNotification = useCallback(async (
        title: string,
        message: string,
        type: NotificationType,
        link?: string
    ) => {
        if (!userId) return;
        const newNotification = await notificationService.addNotification(
            userId,
            title,
            message,
            type,
            link
        );
        if (newNotification) {
            // Optimistic update
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            showToast(message, type === 'SUCCESS' || type === 'SUBMISSION_APPROVED' ? 'success' : 'info');
        }
    }, [userId, showToast]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                markAsRead,
                markAllAsRead,
                addNotification,
                refresh
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
