'use server';

import { prisma } from '@/lib/prisma';

export interface LiveAchievement {
    id: string;
    title: string;
    studentName: string;
    category: string;
    approvedAt: string;
}

// Category to emoji mapping
const categoryEmojis: Record<string, string> = {
    'Scientific Research': '📄',
    'Competition': '🏆',
    'Hackathon': '💻',
    'Sports': '🥇',
    'Volunteer Work': '❤️',
    'Arts & Culture': '🎨',
    'Leadership': '📢',
    'Publication': '📚',
    'Other': '⭐',
};

// Category to color mapping
const categoryColors: Record<string, string> = {
    'Scientific Research': '#ef4444',
    'Competition': '#f59e0b',
    'Hackathon': '#3b82f6',
    'Sports': '#10b981',
    'Volunteer Work': '#ec4899',
    'Arts & Culture': '#8b5cf6',
    'Leadership': '#f97316',
    'Publication': '#6366f1',
    'Other': '#eab308',
};

/**
 * Get recent approved achievements for live feed
 */
export async function getRecentAchievements(limit: number = 12): Promise<{
    achievements: LiveAchievement[];
    colors: Record<string, string>;
    emojis: Record<string, string>;
}> {
    const submissions = await prisma.submission.findMany({
        where: { status: 'APPROVED' },
        orderBy: { reviewedAt: 'desc' },
        take: limit,
        select: {
            id: true,
            title: true,
            studentName: true,
            category: true,
            reviewedAt: true,
        },
    });

    const achievements = submissions.map(s => ({
        id: s.id,
        title: s.title.length > 25 ? s.title.substring(0, 22) + '...' : s.title,
        studentName: s.studentName,
        category: s.category,
        approvedAt: s.reviewedAt?.toISOString() || new Date().toISOString(),
    }));

    return {
        achievements,
        colors: categoryColors,
        emojis: categoryEmojis,
    };
}
