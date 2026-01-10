export type NotificationType =
    | 'INFO'
    | 'SUCCESS'
    | 'ACHIEVEMENT_ADDED'
    | 'ERROR'
    | 'SUBMISSION_APPROVED'
    | 'SUBMISSION_REJECTED'
    | 'BADGE_EARNED'
    | 'CERTIFICATE_ISSUED';

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    read: boolean;
    createdAt: string; // ISO date string
    link?: string;
}

export interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
}
