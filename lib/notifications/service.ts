import { Notification, NotificationType } from './types';
import {
    getNotifications as getDbNotifications,
    getUnreadCount as getDbUnreadCount,
    createNotification as createDbNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from '@/lib/actions/notifications';

/**
 * Notification Service
 * 
 * This service wraps the server actions and provides a client-friendly interface
 * for the NotificationProvider. All data is persisted to the database.
 */
class NotificationService {
    /**
     * Get all notifications for a user from the database
     */
    async getNotifications(userId: string): Promise<Notification[]> {
        try {
            const notifications = await getDbNotifications(userId);
            return notifications;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    }

    /**
     * Get unread notification count for a user
     */
    async getUnreadCount(userId: string): Promise<number> {
        try {
            return await getDbUnreadCount(userId);
        } catch (error) {
            console.error('Error fetching unread count:', error);
            return 0;
        }
    }

    /**
     * Add a new notification
     */
    async addNotification(
        userId: string,
        title: string,
        message: string,
        type: NotificationType,
        link?: string
    ): Promise<Notification | null> {
        try {
            return await createDbNotification(userId, title, message, type, link);
        } catch (error) {
            console.error('Error creating notification:', error);
            return null;
        }
    }

    /**
     * Mark a single notification as read
     */
    async markAsRead(id: string): Promise<void> {
        try {
            await markNotificationAsRead(id);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: string): Promise<void> {
        try {
            await markAllNotificationsAsRead(userId);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }
}

export const notificationService = new NotificationService();
