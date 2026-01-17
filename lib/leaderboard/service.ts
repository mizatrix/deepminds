import { getSubmissions } from '@/lib/actions/submissions';
import { getUsers } from '@/lib/auth/users-db';
import { calculateSubmissionPoints } from './points';

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    name: string;
    email: string;
    faculty: string;
    points: number;
    badges: number;
    achievementCount: number;
    avatar: string;
    trend?: 'up' | 'down' | 'same';
}

/**
 * Calculate leaderboard for CS faculty
 */
export async function calculateLeaderboard(): Promise<LeaderboardEntry[]> {
    const submissions = await getSubmissions();
    const users = await getUsers();

    // Only count approved submissions
    const approvedSubmissions = submissions.filter(s => s.status === 'approved');

    // Aggregate points per user
    const userPoints = new Map<string, number>();
    const userAchievements = new Map<string, number>();

    approvedSubmissions.forEach(submission => {
        const hasEvidence = !!submission.evidenceUrl && submission.evidenceUrl !== 'No evidence uploaded';
        // Use the actual points from the submission (awarded by admin), not calculated points
        const points = submission.points || calculateSubmissionPoints(submission.category, hasEvidence);

        const currentPoints = userPoints.get(submission.studentEmail) || 0;
        const currentCount = userAchievements.get(submission.studentEmail) || 0;

        userPoints.set(submission.studentEmail, currentPoints + points);
        userAchievements.set(submission.studentEmail, currentCount + 1);
    });

    // Build leaderboard entries
    const entries: LeaderboardEntry[] = [];

    userPoints.forEach((points, email) => {
        const user = users.find(u => u.email === email);
        if (!user) return;

        entries.push({
            rank: 0, // Will be set after sorting
            userId: user.id,
            name: user.name,
            email: user.email,
            faculty: 'Computer Science', // CS only for now
            points,
            badges: 0, // TODO: Calculate from badge system
            achievementCount: userAchievements.get(email) || 0,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
            trend: 'same',
        });
    });

    // Sort by points (descending) and assign ranks
    entries.sort((a, b) => b.points - a.points);
    entries.forEach((entry, index) => {
        entry.rank = index + 1;
    });

    return entries;
}

/**
 * Get user's current rank
 */
export async function getUserRank(userEmail: string): Promise<number | null> {
    const leaderboard = await calculateLeaderboard();
    const entry = leaderboard.find(e => e.email === userEmail);
    return entry ? entry.rank : null;
}

/**
 * Get top N users
 */
export async function getTopN(n: number = 10): Promise<LeaderboardEntry[]> {
    const leaderboard = await calculateLeaderboard();
    return leaderboard.slice(0, n);
}
