export interface ScheduledNotification {
    id: string;
    title: string;
    message: string;
    type: string;
    priority: string;
    audience: string;
    scheduledFor: Date;
    sent: boolean;
    sentAt?: Date;
    createdBy: string;
    createdAt: Date;
}
