'use server';

import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/actions/notifications';
import { NotificationPriority } from '@/lib/notifications/types';
import { sendNotificationEmail } from '@/lib/email/service';
import { MOTIVATIONAL_TEMPLATES, type MotivationalTemplate, type AudienceFilter } from './motivational-notifications.types';

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
            // Get all students
            const allStudentsForTop = await prisma.user.findMany({
                where: { role: 'STUDENT' },
                select: { email: true },
            });

            // Get points for each student separately
            const usersWithTotalPoints = await Promise.all(
                allStudentsForTop.map(async (user) => {
                    const submissions = await prisma.submission.findMany({
                        where: { studentEmail: user.email, status: 'APPROVED' },
                        select: { points: true },
                    });
                    const points = submissions.reduce((sum, sub) => sum + (sub.points || 0), 0);
                    return { email: user.email, points };
                })
            );

            const sorted = usersWithTotalPoints.sort((a, b) => b.points - a.points);
            const top20Percent = Math.ceil(sorted.length * 0.2);
            return sorted.slice(0, top20Percent).map(u => u.email);

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
                select: { email: true },
            });

            // Get recent submissions
            const recentSubmissionsCheck = await prisma.submission.findMany({
                where: { submittedAt: { gte: inactiveThreshold } },
                select: { studentEmail: true },
                distinct: ['studentEmail'],
            });

            const activeEmails = new Set(recentSubmissionsCheck.map(s => s.studentEmail));
            return allStudents.filter(u => !activeEmails.has(u.email)).map(u => u.email);

        case 'high_achievers':
            const allStudentsForHigh = await prisma.user.findMany({
                where: { role: 'STUDENT' },
                select: { email: true },
            });

            // Get approved submission counts for each student
            const usersWithCounts = await Promise.all(
                allStudentsForHigh.map(async (user) => {
                    const count = await prisma.submission.count({
                        where: { studentEmail: user.email, status: 'APPROVED' },
                    });
                    return { email: user.email, count };
                })
            );

            return usersWithCounts.filter(u => u.count >= 5).map(u => u.email);

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
