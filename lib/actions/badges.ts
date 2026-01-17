'use server';

import { prisma } from '@/lib/prisma';
import { notifyBadgeEarned } from './notifications';

// Types
export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    category: string | null;
    triggerType: string;
    triggerValue: number;
}

export interface UserBadge {
    id: string;
    badgeId: string;
    earnedAt: string;
    badge: Badge;
}

export interface BadgeWithProgress extends Badge {
    earned: boolean;
    earnedAt?: string;
    progress: number;
}

/**
 * Get all badge definitions
 */
export async function getAllBadges(): Promise<Badge[]> {
    const badges = await prisma.badge.findMany({
        orderBy: [
            { category: 'asc' },
            { triggerValue: 'asc' },
        ],
    });
    return badges;
}

/**
 * Get badges earned by a specific user
 */
export async function getUserBadges(userEmail: string): Promise<UserBadge[]> {
    const userBadges = await prisma.userBadge.findMany({
        where: { userId: userEmail },
        include: { badge: true },
        orderBy: { earnedAt: 'desc' },
    });

    return userBadges.map(ub => ({
        id: ub.id,
        badgeId: ub.badgeId,
        earnedAt: ub.earnedAt.toISOString(),
        badge: ub.badge,
    }));
}

/**
 * Get all badges with user's progress and earned status
 */
export async function getBadgeProgress(userEmail: string): Promise<BadgeWithProgress[]> {
    const [allBadges, userBadges, approvedSubmissions, totalPoints] = await Promise.all([
        prisma.badge.findMany({
            orderBy: [{ category: 'asc' }, { triggerValue: 'asc' }],
        }),
        prisma.userBadge.findMany({
            where: { userId: userEmail },
            select: { badgeId: true, earnedAt: true },
        }),
        prisma.submission.findMany({
            where: { studentEmail: userEmail, status: 'APPROVED' },
            select: { category: true },
        }),
        prisma.submission.aggregate({
            where: { studentEmail: userEmail, status: 'APPROVED' },
            _sum: { points: true },
        }),
    ]);

    const earnedBadgeMap = new Map(userBadges.map(ub => [ub.badgeId, ub.earnedAt]));
    const categoryCount = approvedSubmissions.reduce((acc, sub) => {
        acc[sub.category] = (acc[sub.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const points = totalPoints._sum.points || 0;
    const totalSubmissions = approvedSubmissions.length;

    return allBadges.map(badge => {
        const earnedAt = earnedBadgeMap.get(badge.id);
        let progress = 0;

        if (earnedAt) {
            progress = 100;
        } else {
            // Calculate progress based on trigger type
            switch (badge.triggerType) {
                case 'first_submission':
                    progress = totalSubmissions >= 1 ? 100 : 0;
                    break;
                case 'category_count':
                    if (badge.category) {
                        const count = categoryCount[badge.category] || 0;
                        progress = Math.min(100, Math.round((count / badge.triggerValue) * 100));
                    }
                    break;
                case 'total_points':
                    progress = Math.min(100, Math.round((points / badge.triggerValue) * 100));
                    break;
            }
        }

        return {
            ...badge,
            earned: !!earnedAt,
            earnedAt: earnedAt?.toISOString(),
            progress,
        };
    });
}

/**
 * Award a badge to a user (internal)
 */
async function awardBadge(userEmail: string, badge: Badge): Promise<boolean> {
    try {
        // Check if already awarded
        const existing = await prisma.userBadge.findUnique({
            where: {
                userId_badgeId: {
                    userId: userEmail,
                    badgeId: badge.id,
                },
            },
        });

        if (existing) {
            return false; // Already has this badge
        }

        // Award the badge
        await prisma.userBadge.create({
            data: {
                userId: userEmail,
                badgeId: badge.id,
            },
        });

        // Send notification
        await notifyBadgeEarned(userEmail, badge.name, badge.description);

        console.log(`Badge "${badge.name}" awarded to ${userEmail}`);
        return true;
    } catch (error) {
        console.error('Failed to award badge:', error);
        return false;
    }
}

/**
 * Check and award all applicable badges for a user after submission approval
 */
export async function checkAndAwardBadges(
    userEmail: string,
    approvedCategory: string
): Promise<string[]> {
    const awardedBadges: string[] = [];

    try {
        // Get user's stats
        const [approvedSubmissions, totalPointsResult, allBadges, existingUserBadges] = await Promise.all([
            prisma.submission.findMany({
                where: { studentEmail: userEmail, status: 'APPROVED' },
                select: { category: true },
            }),
            prisma.submission.aggregate({
                where: { studentEmail: userEmail, status: 'APPROVED' },
                _sum: { points: true },
            }),
            prisma.badge.findMany(),
            prisma.userBadge.findMany({
                where: { userId: userEmail },
                select: { badgeId: true },
            }),
        ]);

        const totalSubmissions = approvedSubmissions.length;
        const totalPoints = totalPointsResult._sum.points || 0;
        const categoryCount = approvedSubmissions.reduce((acc, sub) => {
            acc[sub.category] = (acc[sub.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const ownedBadgeIds = new Set(existingUserBadges.map(ub => ub.badgeId));

        // Check each badge
        for (const badge of allBadges) {
            if (ownedBadgeIds.has(badge.id)) continue; // Already owned

            let shouldAward = false;

            switch (badge.triggerType) {
                case 'first_submission':
                    shouldAward = totalSubmissions >= badge.triggerValue;
                    break;

                case 'category_count':
                    if (badge.category === approvedCategory) {
                        const count = categoryCount[badge.category] || 0;
                        shouldAward = count >= badge.triggerValue;
                    }
                    break;

                case 'total_points':
                    shouldAward = totalPoints >= badge.triggerValue;
                    break;
            }

            if (shouldAward) {
                const awarded = await awardBadge(userEmail, badge);
                if (awarded) {
                    awardedBadges.push(badge.name);
                }
            }
        }
    } catch (error) {
        console.error('Error checking badges:', error);
    }

    return awardedBadges;
}
