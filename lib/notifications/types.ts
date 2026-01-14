export type NotificationType =
    | 'INFO'
    | 'SUCCESS'
    | 'ACHIEVEMENT_ADDED'
    | 'ERROR'
    | 'SUBMISSION_APPROVED'
    | 'SUBMISSION_REJECTED'
    | 'BADGE_EARNED'
    | 'CERTIFICATE_ISSUED'
    | 'MOTIVATIONAL'      // New: Admin-sent motivational messages
    | 'ANNOUNCEMENT';     // New: Important announcements

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    priority?: NotificationPriority; // New: Priority level
    read: boolean;
    createdAt: string; // ISO date string
    link?: string;
    expiresAt?: string;  // New: Optional expiration date
}

export interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
}
