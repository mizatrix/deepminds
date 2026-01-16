'use server';

import { prisma } from '@/lib/prisma';
import { sendTemplateNotification } from './motivational-notifications';
import type { AudienceFilter } from './motivational-notifications.types';
import { revalidatePath } from 'next/cache';
import cronParser from 'cron-parser';
import type { NotificationTrigger } from './triggers.types';

/**
 * Create a new trigger
 */
export async function createTrigger(
    name: string,
    type: string,
    schedule: string | null,
    templateId: string,
    audience: string,
    enabled = true
): Promise<NotificationTrigger> {
    const trigger = await prisma.notificationTrigger.create({
        data: {
            name,
            type,
            schedule,
            templateId,
            audience,
            enabled
        }
    });

    revalidatePath('/admin/triggers');
    return trigger as NotificationTrigger;
}

/**
 * Get all triggers
 */
export async function getTriggers(): Promise<NotificationTrigger[]> {
    const triggers = await prisma.notificationTrigger.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return triggers as NotificationTrigger[];
}

/**
 * Toggle trigger enabled/disabled
 */
export async function toggleTrigger(id: string, enabled: boolean): Promise<void> {
    await prisma.notificationTrigger.update({
        where: { id },
        data: { enabled }
    });

    revalidatePath('/admin/triggers');
}

/**
 * Delete a trigger
 */
export async function deleteTrigger(id: string): Promise<void> {
    await prisma.notificationTrigger.delete({
        where: { id }
    });

    revalidatePath('/admin/triggers');
}

/**
 * Execute a trigger manually (for testing)
 */
export async function executeTrigger(triggerId: string): Promise<{ sent: number; failed: number }> {
    const trigger = await prisma.notificationTrigger.findUnique({
        where: { id: triggerId }
    });

    if (!trigger) {
        throw new Error('Trigger not found');
    }

    try {
        const result = await sendTemplateNotification(
            trigger.templateId,
            trigger.audience as AudienceFilter
        );

        // Log execution
        await prisma.triggerExecution.create({
            data: {
                triggerId: trigger.id,
                success: true,
                sent: result.sent,
                failed: result.failed
            }
        });

        // Update last run
        await prisma.notificationTrigger.update({
            where: { id: trigger.id },
            data: { lastRun: new Date() }
        });

        return result;
    } catch (error) {
        // Log failed execution
        await prisma.triggerExecution.create({
            data: {
                triggerId: trigger.id,
                success: false,
                sent: 0,
                failed: 0,
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        });

        throw error;
    }
}

/**
 * Evaluate and execute all due triggers (called by cron)
 */
export async function evaluateTriggers(): Promise<{ processed: number; sent: number; failed: number }> {
    const now = new Date();

    // Get all enabled scheduled triggers
    const triggers = await prisma.notificationTrigger.findMany({
        where: {
            enabled: true,
            type: 'scheduled',
            schedule: { not: null }
        }
    });

    let processed = 0;
    let totalSent = 0;
    let totalFailed = 0;

    for (const trigger of triggers) {
        try {
            if (!trigger.schedule) continue;

            // Parse cron expression
            const interval = (cronParser as any).parseExpression(trigger.schedule);
            const nextRun = interval.next().toDate();

            // Check if trigger should run (within last hour)
            const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
            const shouldRun = !trigger.lastRun || trigger.lastRun < lastHour;

            if (shouldRun) {
                const result = await executeTrigger(trigger.id);
                totalSent += result.sent;
                totalFailed += result.failed;
                processed++;

                // Update next run time
                await prisma.notificationTrigger.update({
                    where: { id: trigger.id },
                    data: { nextRun }
                });
            }
        } catch (error) {
            console.error(`Failed to evaluate trigger ${trigger.id}:`, error);
            totalFailed++;
        }
    }

    return { processed, sent: totalSent, failed: totalFailed };
}

/**
 * Get trigger execution history
 */
export async function getTriggerExecutions(triggerId: string, limit = 10) {
    return await prisma.triggerExecution.findMany({
        where: { triggerId },
        orderBy: { executedAt: 'desc' },
        take: limit
    });
}
