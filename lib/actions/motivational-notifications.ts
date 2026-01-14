'use server';

import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/actions/notifications';
import { NotificationPriority } from '@/lib/notifications/types';
import { sendNotificationEmail } from '@/lib/email/service';

/**
 * Motivational Message Templates
 */
export interface MotivationalTemplate {
    id: string;
    title: string;
    message: string;
    emoji: string;
    priority: NotificationPriority;
    category: 'motivation' | 'milestone' | 'reminder' | 'spotlight';
}

export const MOTIVATIONAL_TEMPLATES: MotivationalTemplate[] = [
    {
        id: 'keep-going',
        title: "🌟 You're Doing Great!",
        message: "Keep up the excellent work! Every achievement you submit brings you closer to your goals.",
        emoji: '🌟',
        priority: 'NORMAL',
        category: 'motivation'
    },
    {
        id: 'milestone-collective',
        title: '🎯 Milestone Alert!',
        message: "Congratulations! Our students have collectively earned {{totalPoints}} points this month. You're part of something amazing!",
        emoji: '🎯',
        priority: 'HIGH',
        category: 'milestone'
    },
    {
        id: 'submission-reminder',
        title: '⏰ Submission Reminder',
        message: "Don't forget to submit your recent achievements! We're excited to celebrate your accomplishments.",
        emoji: '⏰',
        priority: 'NORMAL',
        category: 'reminder'
    },
    {
        id: 'top-performers',
        title: '🏆 Top Performers Spotlight',
        message: "Shoutout to our top 10 students this week! Your dedication is inspiring the entire community.",
        emoji: '🏆',
        priority: 'HIGH',
        category: 'spotlight'
    },
    {
        id: 'weekly-motivation',
        title: '💪 Weekly Motivation',
        message: "Every expert was once a beginner. Keep pushing forward, your hard work will pay off!",
        emoji: '💪',
        priority: 'NORMAL',
        category: 'motivation'
    },
    {
        id: 'goal-setting',
        title: '🎓 Set Your Goals High',
        message: "What achievement will you submit this week? Challenge yourself to reach new heights!",
        emoji: '🎓',
        priority: 'NORMAL',
        category: 'motivation'
    },
    {
        id: 'community-love',
        title: '❤️ Community Appreciation',
        message: "Thank you for being part of our amazing community! Your achievements inspire others.",
        emoji: '❤️',
        priority: 'NORMAL',
        category: 'motivation'
    },
];

/**
 * Audience filters for targeting specific student groups
 */
export type AudienceFilter =
    | 'all'                    // All students
    | 'top_performers'         // Top 20% by points
    | 'new_students'           // Registered in last 30 days
    | 'inactive'               // No submissions in last 30 days
    | 'high_achievers';        // 5+ approved submissions

/**
 * Get student emails based on audience filter
 */
export async function getAudienceEmails(filter: AudienceFilter): Promise<string[]> {
    switch (filter) {
        case 'all':
            const allUsers = await prisma.user.findMany({
                where: { role: 'STUDENT' },
                select: { email: true },
            });
            return allUsers.map(u => u.email);

        case 'top_performers':
            // Get top 20% by points (calculated from approved submissions)
            const usersWithPoints = await prisma.user.findMany({
                where: { role: 'STUDENT' },
                include: {
                    submissions: {
                        where: { status: 'APPROVED' },
                        select: { points: true },
                    },
                },
            });

            const usersWithTotalPoints = usersWithPoints.map(user => ({
                email: user.email,
                points: user.submissions.reduce((sum, sub) => sum + (sub.points || 0), 0),
            })).sort((a, b) => b.points - a.points);

            const top20Percent = Math.ceil(usersWithTotalPoints.length * 0.2);
            return usersWithTotalPoints.slice(0, top20Percent).map(u => u.email);

        case 'new_students':
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const newUsers = await prisma.user.findMany({
                where: {
                    role: 'STUDENT',
                    createdAt: { gte: thirtyDaysAgo },
                },
                select: { email: true },
            });
            return newUsers.map(u => u.email);

        case 'inactive':
            const inactiveThreshold = new Date();
            inactiveThreshold.setDate(inactiveThreshold.getDate() - 30);

            const allStudents = await prisma.user.findMany({
                where: { role: 'STUDENT' },
                include: {
                    submissions: {
                        orderBy: { submittedAt: 'desc' },
                        take: 1,
                    },
                },
            });

            const inactiveStudents = allStudents.filter(user => {
                if (user.submissions.length === 0) return true;
                return new Date(user.submissions[0].submittedAt) < inactiveThreshold;
            });

            return inactiveStudents.map(u => u.email);

        case 'high_achievers':
            const highAchievers = await prisma.user.findMany({
                where: {
                    role: 'STUDENT',
                    submissions: {
                        some: { status: 'APPROVED' },
                    },
                },
                include: {
                    _count: {
                        select: {
                            submissions: {
                                where: { status: 'APPROVED' },
                            },
                        },
                    },
                },
            });

            return highAchievers
                .filter(u => u._count.submissions >= 5)
                .map(u => u.email);

        default:
            return [];
    }
}

/**
 * Send motivational notification to specific audience
 */
export async function sendMotivationalNotification(
    title: string,
    message: string,
    priority: NotificationPriority,
    audience: AudienceFilter,
    link?: string
): Promise<{ sent: number; failed: number; emailsSent: number }> {
    const emails = await getAudienceEmails(audience);

    let sent = 0;
    let failed = 0;
    let emailsSent = 0;

    // Replace template variables
    const totalPoints = await getTotalCommunityPoints();
    const processedMessage = message.replace('{{totalPoints}}', totalPoints.toString());

    // Get users with email preferences
    const users = await prisma.user.findMany({
        where: {
            email: { in: emails },
            role: 'STUDENT'
        },
        select: {
            email: true,
            emailNotifications: true,
            emailDigestFrequency: true
        }
    });

    for (const user of users) {
        try {
            // Send in-app notification (always)
            await createNotification(user.email, title, processedMessage, 'MOTIVATIONAL', link);
            sent++;

            // Send email if user has email notifications enabled and wants instant delivery
            if (user.emailNotifications && user.emailDigestFrequency === 'instant') {
                const emailResult = await sendNotificationEmail(
                    user.email,
                    title,
                    processedMessage,
                    {
                        priority,
                        actionUrl: link ? `${process.env.NEXT_PUBLIC_APP_URL || ''}${link}` : undefined,
                        actionText: link ? 'View Dashboard' : undefined
                    }
                );

                if (emailResult.success) {
                    emailsSent++;
                }
            }
        } catch (error) {
            console.error(`Failed to send notification to ${user.email}:`, error);
            failed++;
        }
    }

    return { sent, failed, emailsSent };
}

/**
 * Get total points earned by all students
 */
async function getTotalCommunityPoints(): Promise<number> {
    const result = await prisma.submission.aggregate({
        where: { status: 'APPROVED' },
        _sum: { points: true },
    });

    return result._sum.points || 0;
}

/**
 * Send notification using a template
 */
export async function sendTemplateNotification(
    templateId: string,
    audience: AudienceFilter,
    customizations?: { title?: string; message?: string }
): Promise<{ sent: number; failed: number }> {
    const template = MOTIVATIONAL_TEMPLATES.find(t => t.id === templateId);

    if (!template) {
        throw new Error(`Template with id ${templateId} not found`);
    }

    const title = customizations?.title || template.title;
    const message = customizations?.message || template.message;

    return sendMotivationalNotification(
        title,
        message,
        template.priority,
        audience
    );
}
