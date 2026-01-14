'use server';

import { prisma } from '@/lib/prisma';
import { sendTemplateNotification, type AudienceFilter } from './motivational-notifications';
import { revalidatePath } from 'next/cache';

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

/**
 * Create a scheduled notification
 */
export async function createScheduledNotification(
    title: string,
    message: string,
    type: 'MOTIVATIONAL' | 'ANNOUNCEMENT',
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT',
    audience: AudienceFilter,
    scheduledFor: Date,
    createdBy: string
): Promise<ScheduledNotification> {
    const scheduled = await prisma.scheduledNotification.create({
        data: {
            title,
            message,
            type,
            priority,
            audience,
            scheduledFor,
            createdBy,
        },
    });

    revalidatePath('/admin/notifications/scheduled');
    return scheduled as ScheduledNotification;
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(
    filter: 'all' | 'pending' | 'sent' = 'all'
): Promise<ScheduledNotification[]> {
    const where = filter === 'all'
        ? {}
        : filter === 'pending'
            ? { sent: false }
            : { sent: true };

    const notifications = await prisma.scheduledNotification.findMany({
        where,
        orderBy: { scheduledFor: 'asc' },
    });

    return notifications as ScheduledNotification[];
}

/**
 * Cancel a scheduled notification (delete it)
 */
export async function cancelScheduledNotification(id: string): Promise<void> {
    await prisma.scheduledNotification.delete({
        where: { id },
    });

    revalidatePath('/admin/notifications/scheduled');
}

/**
 * Reschedule a notification
 */
export async function rescheduleNotification(
    id: string,
    newScheduledFor: Date
): Promise<ScheduledNotification> {
    const updated = await prisma.scheduledNotification.update({
        where: { id },
        data: { scheduledFor: newScheduledFor },
    });

    revalidatePath('/admin/notifications/scheduled');
    return updated as ScheduledNotification;
}

/**
 * Process scheduled notifications (called by cron job)
 * Sends all notifications that are due
 */
export async function processScheduledNotifications(): Promise<{
    processed: number;
    sent: number;
    failed: number;
}> {
    const now = new Date();

    // Find all pending notifications that are due
    const dueNotifications = await prisma.scheduledNotification.findMany({
        where: {
            sent: false,
            scheduledFor: { lte: now },
        },
    });

    let sent = 0;
    let failed = 0;

    for (const notification of dueNotifications) {
        try {
            // Send the notification using existing motivational notification system
            await sendTemplateNotification(
                notification.templateId || 'custom',
                notification.audience as AudienceFilter,
                {
                    title: notification.title,
                    message: notification.message,
                }
            );

            // Mark as sent
            await prisma.scheduledNotification.update({
                where: { id: notification.id },
                data: {
                    sent: true,
                    sentAt: new Date(),
                },
            });

            sent++;
        } catch (error) {
            console.error(`Failed to send scheduled notification ${notification.id}:`, error);
            failed++;
        }
    }

    revalidatePath('/admin/notifications/scheduled');

    return {
        processed: dueNotifications.length,
        sent,
        failed,
    };
}

/**
 * Get scheduled notification by ID
 */
export async function getScheduledNotification(id: string): Promise<ScheduledNotification | null> {
    const notification = await prisma.scheduledNotification.findUnique({
        where: { id },
    });

    return notification as ScheduledNotification | null;
}
