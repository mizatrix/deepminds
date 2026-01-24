'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { NotificationType } from '@/lib/notifications/types';

// Types matching the Notification interface
export interface DbNotification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    read: boolean;
    createdAt: string;
    link?: string;
}

// Helper to convert Prisma model to our Notification type
function toNotification(n: NonNullable<Awaited<ReturnType<typeof prisma.notification.findUnique>>>): DbNotification {
    return {
        id: n.id,
        userId: n.userId,
        title: n.title,
        message: n.message,
        type: n.type as NotificationType,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
        link: n.link ?? undefined,
    };
}

/**
 * Create a new notification
 */
export async function createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    link?: string
): Promise<DbNotification> {
    console.log('[Notification] Creating:', {
        userId,
        title,
        type,
        timestamp: new Date().toISOString()
    });

    const notification = await prisma.notification.create({
        data: {
            userId,
            title,
            message,
            type,
            link,
        },
    });

    console.log('[Notification] Created successfully:', notification.id);

    revalidatePath('/student/notifications');
    revalidatePath('/student');

    return toNotification(notification);
}

/**
 * Get all notifications for a user
 */
export async function getNotifications(userId: string, limit?: number): Promise<DbNotification[]> {
    const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit ?? 50,
    });
    return notifications.map(toNotification);
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
        where: { userId, read: false },
    });
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(id: string): Promise<void> {
    await prisma.notification.update({
        where: { id },
        data: { read: true },
    });

    revalidatePath('/student/notifications');
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
    });

    revalidatePath('/student/notifications');

    return result.count;
}

/**
 * Delete a notification
 */
export async function deleteNotification(id: string): Promise<void> {
    await prisma.notification.delete({
        where: { id },
    });

    revalidatePath('/student/notifications');
}

/**
 * Delete all notifications for a user
 */
export async function deleteAllNotifications(userId: string): Promise<number> {
    const result = await prisma.notification.deleteMany({
        where: { userId },
    });

    revalidatePath('/student/notifications');

    return result.count;
}

// ===========================================
// Helper functions to create specific notifications
// ===========================================

/**
 * Notify a student that their submission was approved
 */
export async function notifySubmissionApproved(
    studentEmail: string,
    submissionTitle: string,
    points?: number,
    submissionId?: string
): Promise<DbNotification> {
    const pointsText = points ? ` (+${points} points)` : '';
    return createNotification(
        studentEmail,
        'Achievement Approved! 🎉',
        `Your submission "${submissionTitle}" has been approved${pointsText}`,
        'SUBMISSION_APPROVED',
        '/student/dashboard' // Link to dashboard where students see their submissions
    );
}

/**
 * Notify a student that their submission needs revision (encouraging tone)
 */
export async function notifySubmissionRejected(
    studentEmail: string,
    submissionTitle: string,
    feedback?: string,
    submissionId?: string
): Promise<DbNotification> {
    const feedbackText = feedback ? ` Feedback: ${feedback}` : '';
    return createNotification(
        studentEmail,
        'Feedback on Your Submission 📝',
        `Your submission "${submissionTitle}" requires some updates.${feedbackText}`,
        'SUBMISSION_REJECTED',
        '/student/dashboard' // Link to dashboard where students see their submissions
    );
}

/**
 * Notify admins about a new submission
 */
export async function notifyNewSubmission(
    adminEmails: string[],
    studentName: string,
    submissionTitle: string,
    submissionId?: string
): Promise<void> {
    await Promise.all(
        adminEmails.map(email =>
            createNotification(
                email,
                'New Submission to Review 📋',
                `${studentName} submitted "${submissionTitle}" for your review`,
                'INFO',
                submissionId ? `/admin/submissions` : '/admin/submissions'
            )
        )
    );
}

/**
 * Welcome notification for new users
 */
export async function notifyWelcome(
    userEmail: string,
    userName: string
): Promise<DbNotification> {
    return createNotification(
        userEmail,
        'Welcome to CS Excellence! 🎓',
        `Hi ${userName}! Start by completing your profile and submitting your first achievement.`,
        'SUCCESS',
        '/profile'
    );
}

/**
 * Notify when profile is completed to 100%
 */
export async function notifyProfileComplete(
    userEmail: string
): Promise<DbNotification> {
    return createNotification(
        userEmail,
        'Profile Complete! ⭐',
        'Great job! Your profile is now 100% complete. You\'re ready to showcase your achievements!',
        'SUCCESS',
        '/profile'
    );
}

/**
 * Notify when a badge is earned
 */
export async function notifyBadgeEarned(
    userEmail: string,
    badgeName: string,
    badgeDescription?: string
): Promise<DbNotification> {
    const desc = badgeDescription ? ` - ${badgeDescription}` : '';
    return createNotification(
        userEmail,
        'New Badge Earned! 🏆',
        `Congratulations! You've unlocked the "${badgeName}" badge${desc}`,
        'SUCCESS',
        '/student/badges'
    );
}

/**
 * Notify when reaching a points milestone
 */
export async function notifyMilestone(
    userEmail: string,
    points: number
): Promise<DbNotification> {
    let milestoneMessage = '';
    if (points >= 1000) {
        milestoneMessage = 'Outstanding! You\'ve reached 1,000 points and joined the elite achievers!';
    } else if (points >= 500) {
        milestoneMessage = 'Amazing progress! You\'ve reached 500 points. Keep up the great work!';
    } else if (points >= 100) {
        milestoneMessage = 'Great start! You\'ve reached 100 points. You\'re on your way to excellence!';
    }

    return createNotification(
        userEmail,
        'Milestone Achieved! 🎯',
        milestoneMessage,
        'SUCCESS',
        '/student/dashboard'
    );
}

/**
 * Notify when user is promoted to Admin
 */
export async function notifyRolePromotion(
    userEmail: string,
    newRole: string
): Promise<DbNotification> {
    const roleDisplay = newRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin';
    return createNotification(
        userEmail,
        `You're Now ${newRole === 'SUPER_ADMIN' ? 'a Super Admin' : 'an Admin'}! 🛡️`,
        `Congratulations! You've been promoted to ${roleDisplay}. You now have access to the admin panel.`,
        'SUCCESS',
        '/admin/dashboard'
    );
}

/**
 * Get admin emails for notifications (includes SUPER_ADMIN)
 */
export async function getAdminEmails(): Promise<string[]> {
    const admins = await prisma.user.findMany({
        where: {
            role: { in: ['ADMIN', 'SUPER_ADMIN'] }
        },
        select: { email: true },
    });
    return admins.map(a => a.email);
}

