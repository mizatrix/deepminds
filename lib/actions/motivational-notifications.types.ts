import { NotificationPriority } from '@/lib/notifications/types';

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

export type AudienceFilter =
    | 'all'                    // All students
    | 'top_performers'         // Top 20% by points
    | 'new_students'           // Registered in last 30 days
    | 'inactive'               // No submissions in last 30 days
    | 'high_achievers';        // 5+ approved submissions
