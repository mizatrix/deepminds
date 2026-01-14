'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type ReactionType = 'like' | 'love' | 'celebrate' | 'inspire';

/**
 * Add or update a reaction to a notification
 */
export async function addReaction(
    notificationId: string,
    userId: string,
    reactionType: ReactionType
): Promise<{ success: boolean }> {
    try {
        await prisma.notificationReaction.upsert({
            where: {
                notificationId_userId: {
                    notificationId,
                    userId
                }
            },
            create: {
                notificationId,
                userId,
                reactionType
            },
            update: {
                reactionType
            }
        });

        revalidatePath('/student/notifications');
        return { success: true };
    } catch (error) {
        console.error('Failed to add reaction:', error);
        return { success: false };
    }
}

/**
 * Remove a reaction from a notification
 */
export async function removeReaction(
    notificationId: string,
    userId: string
): Promise<{ success: boolean }> {
    try {
        await prisma.notificationReaction.delete({
            where: {
                notificationId_userId: {
                    notificationId,
                    userId
                }
            }
        });

        revalidatePath('/student/notifications');
        return { success: true };
    } catch (error) {
        console.error('Failed to remove reaction:', error);
        return { success: false };
    }
}

/**
 * Get reaction counts for a notification
 */
export async function getReactionCounts(
    notificationId: string
): Promise<{ like: number; love: number; celebrate: number; inspire: number }> {
    const reactions = await prisma.notificationReaction.groupBy({
        by: ['reactionType'],
        where: { notificationId },
        _count: true
    });

    const counts = {
        like: 0,
        love: 0,
        celebrate: 0,
        inspire: 0
    };

    reactions.forEach(reaction => {
        if (reaction.reactionType in counts) {
            counts[reaction.reactionType as ReactionType] = reaction._count;
        }
    });

    return counts;
}

/**
 * Get user's reaction to a notification (if any)
 */
export async function getUserReaction(
    notificationId: string,
    userId: string
): Promise<ReactionType | null> {
    const reaction = await prisma.notificationReaction.findUnique({
        where: {
            notificationId_userId: {
                notificationId,
                userId
            }
        }
    });

    return reaction?.reactionType as ReactionType | null;
}

/**
 * Get all reactions for multiple notifications (for list views)
 */
export async function getReactionsForNotifications(
    notificationIds: string[]
): Promise<Record<string, { like: number; love: number; celebrate: number; inspire: number }>> {
    const reactions = await prisma.notificationReaction.groupBy({
        by: ['notificationId', 'reactionType'],
        where: { notificationId: { in: notificationIds } },
        _count: true
    });

    const result: Record<string, any> = {};

    notificationIds.forEach(id => {
        result[id] = { like: 0, love: 0, celebrate: 0, inspire: 0 };
    });

    reactions.forEach(reaction => {
        if (reaction.reactionType in result[reaction.notificationId]) {
            result[reaction.notificationId][reaction.reactionType] = reaction._count;
        }
    });

    return result;
}
