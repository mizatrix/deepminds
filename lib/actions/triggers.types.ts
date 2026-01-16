import type { AudienceFilter } from './motivational-notifications.types';

export interface NotificationTrigger {
    id: string;
    name: string;
    type: string;
    enabled: boolean;
    schedule?: string;
    templateId: string;
    audience: string;
    lastRun?: Date;
    nextRun?: Date;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Common trigger templates
 */
export const COMMON_TRIGGERS = [
    {
        name: 'Weekly Monday Motivation',
        type: 'scheduled',
        schedule: '0 9 * * 1', // Every Monday at 9 AM
        templateId: 'weekly-motivation',
        audience: 'all' as AudienceFilter,
        description: 'Send motivational message every Monday morning'
    },
    {
        name: 'Friday Encouragement',
        type: 'scheduled',
        schedule: '0 16 * * 5', // Every Friday at 4 PM
        templateId: 'keep-going',
        audience: 'all' as AudienceFilter,
        description: 'End the week with encouragement'
    },
    {
        name: 'New Student Welcome',
        type: 'scheduled',
        schedule: '0 10 * * *', // Every day at 10 AM
        templateId: 'keep-going',
        audience: 'new_students' as AudienceFilter,
        description: 'Welcome new students daily'
    },
    {
        name: 'Inactive Student Reminder',
        type: 'scheduled',
        schedule: '0 14 * * 3', // Every Wednesday at 2 PM
        templateId: 'submission-reminder',
        audience: 'inactive' as AudienceFilter,
        description: 'Remind inactive students to submit'
    },
    {
        name: 'Top Performers Recognition',
        type: 'scheduled',
        schedule: '0 10 1 * *', // 1st of every month at 10 AM
        templateId: 'top-performers',
        audience: 'top_performers' as AudienceFilter,
        description: 'Monthly recognition for top performers'
    }
];
