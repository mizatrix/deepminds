'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// AuditLog type
export interface AuditLog {
    id: string;
    timestamp: string;
    action: 'submit' | 'approve' | 'reject' | 'delete';
    performedBy: string;
    performedByName: string;
    submissionId: string;
    submissionTitle: string;
    details?: string;
}

// Helper to convert Prisma model to our AuditLog type
function toAuditLog(log: NonNullable<Awaited<ReturnType<typeof prisma.auditLog.findUnique>>>): AuditLog {
    return {
        id: log.id,
        timestamp: log.timestamp.toISOString(),
        action: log.action as AuditLog['action'],
        performedBy: log.performedBy,
        performedByName: log.performedByName,
        submissionId: log.submissionId,
        submissionTitle: log.submissionTitle,
        details: log.details ?? undefined,
    };
}

/**
 * Create a new audit log entry
 */
export async function createAuditLog(data: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    const log = await prisma.auditLog.create({
        data: {
            action: data.action,
            performedBy: data.performedBy,
            performedByName: data.performedByName,
            submissionId: data.submissionId,
            submissionTitle: data.submissionTitle,
            details: data.details,
        },
    });

    revalidatePath('/admin');

    return toAuditLog(log);
}

/**
 * Get all audit logs
 */
export async function getAuditLogs(): Promise<AuditLog[]> {
    const logs = await prisma.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
    });
    return logs.map(toAuditLog);
}

/**
 * Get recent audit logs (limited)
 */
export async function getRecentAuditLogs(limit: number = 10): Promise<AuditLog[]> {
    const logs = await prisma.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: limit,
    });
    return logs.map(toAuditLog);
}

/**
 * Get audit logs by submission ID
 */
export async function getAuditLogsBySubmission(submissionId: string): Promise<AuditLog[]> {
    const logs = await prisma.auditLog.findMany({
        where: { submissionId },
        orderBy: { timestamp: 'desc' },
    });
    return logs.map(toAuditLog);
}

/**
 * Get audit logs by performer
 */
export async function getAuditLogsByPerformer(performedBy: string): Promise<AuditLog[]> {
    const logs = await prisma.auditLog.findMany({
        where: { performedBy },
        orderBy: { timestamp: 'desc' },
    });
    return logs.map(toAuditLog);
}

/**
 * Get audit log statistics
 */
export async function getAuditLogStats(): Promise<{
    total: number;
    submits: number;
    approvals: number;
    rejections: number;
    deletions: number;
}> {
    const [total, submits, approvals, rejections, deletions] = await Promise.all([
        prisma.auditLog.count(),
        prisma.auditLog.count({ where: { action: 'submit' } }),
        prisma.auditLog.count({ where: { action: 'approve' } }),
        prisma.auditLog.count({ where: { action: 'reject' } }),
        prisma.auditLog.count({ where: { action: 'delete' } }),
    ]);

    return { total, submits, approvals, rejections, deletions };
}
