import { NextRequest, NextResponse } from 'next/server';
import { processScheduledNotifications } from '@/lib/actions/scheduled-notifications';
import { purgeOldReadNotifications } from '@/lib/actions/notifications';

/**
 * Cron endpoint to process scheduled notifications
 * This should be called every 5 minutes by Vercel Cron or external service
 * 
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/send-scheduled",
 *     "schedule": "*\/5 * * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
    try {
        // Verify the request is from Vercel Cron or has the correct secret
        const authHeader = request.headers.get('authorization');

        // Check if request is from Vercel Cron
        const isVercelCron = request.headers.get('user-agent')?.includes('vercel-cron');

        // OR check secret token
        const hasValidSecret = authHeader === `Bearer ${process.env.CRON_SECRET}`;

        if (!isVercelCron && !hasValidSecret) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Process scheduled notifications
        const result = await processScheduledNotifications();

        // Prune read notifications older than the retention window
        // (default 30 days, configurable via NOTIFICATION_RETENTION_DAYS).
        // Unread notifications are preserved regardless of age.
        let purged = 0;
        try {
            purged = await purgeOldReadNotifications();
        } catch (purgeError) {
            console.error('Notification purge failed (non-fatal):', purgeError);
        }

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            purgedReadNotifications: purged,
            ...result,
        });
    } catch (error) {
        console.error('Error processing scheduled notifications:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// Allow both GET and POST
export async function POST(request: NextRequest) {
    return GET(request);
}
