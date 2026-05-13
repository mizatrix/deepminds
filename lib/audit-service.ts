'use client';

import { getDeviceInfo, type DeviceInfo } from '@/lib/device-utils';
import { type AuditLog } from '@/lib/submissions';

const AUDIT_LOGS_KEY = 'cs_excellence_audit_logs';

interface CreateAuditLogParams {
    userEmail: string;
    userName: string;
    userRole: 'ADMIN' | 'STUDENT' | 'GUEST';
    action: AuditLog['action'];
    targetType: AuditLog['targetType'];
    targetId?: string;
    targetTitle?: string;
    details: string;
}

/**
 * Create an enhanced audit log with device and location info
 */
export async function createEnhancedAuditLog(params: CreateAuditLogParams): Promise<void> {
    try {
        // Get device info from browser
        const deviceInfo = getDeviceInfo();

        // POST audit log to API (saves to database) and get IP/location info back
        let ipAddress = 'Unknown';
        let city = 'Unknown';
        let country = 'Unknown';

        try {
            const response = await fetch('/api/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userEmail: params.userEmail,
                    userName: params.userName,
                    userRole: params.userRole,
                    action: params.action,
                    targetType: params.targetType,
                    targetId: params.targetId || '',
                    targetTitle: params.targetTitle || '',
                    details: params.details,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                ipAddress = result.data?.ipAddress || 'Unknown';
                city = result.data?.city || 'Unknown';
                country = result.data?.country || 'Unknown';
            }
        } catch (error) {
            console.warn('Could not post audit log:', error);
        }

        // Also save to localStorage for the enhanced audit-logs view
        const auditLog: AuditLog = {
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            userEmail: params.userEmail,
            userName: params.userName,
            userRole: params.userRole,
            action: params.action,
            targetType: params.targetType,
            targetId: params.targetId,
            targetTitle: params.targetTitle,
            details: params.details,
            ipAddress,
            city,
            country,
            userAgent: deviceInfo.userAgent,
            deviceType: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            browserVersion: deviceInfo.browserVersion,
            os: deviceInfo.os
        };

        const logs = getAuditLogs();
        logs.push(auditLog);
        localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs));

    } catch (error) {
        console.error('Failed to create audit log:', error);
    }
}

/**
 * Get all audit logs from localStorage
 */
function getAuditLogs(): AuditLog[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(AUDIT_LOGS_KEY);
    return data ? JSON.parse(data) : [];
}

/**
 * Format audit log for display
 */
export function formatAuditAction(action: AuditLog['action']): string {
    const actionLabels: Record<AuditLog['action'], string> = {
        'login': 'Logged in',
        'logout': 'Logged out',
        'submit': 'Submitted',
        'approve': 'Approved',
        'reject': 'Rejected',
        'delete': 'Deleted',
        'view': 'Viewed',
        'update': 'Updated'
    };
    return actionLabels[action] || action;
}

/**
 * Get action color for UI
 */
export function getAuditActionColor(action: AuditLog['action']): string {
    const colors: Record<AuditLog['action'], string> = {
        'login': 'text-green-600 bg-green-50',
        'logout': 'text-slate-600 bg-slate-50',
        'submit': 'text-blue-600 bg-blue-50',
        'approve': 'text-emerald-600 bg-emerald-50',
        'reject': 'text-red-600 bg-red-50',
        'delete': 'text-red-600 bg-red-50',
        'view': 'text-purple-600 bg-purple-50',
        'update': 'text-amber-600 bg-amber-50'
    };
    return colors[action] || 'text-slate-600 bg-slate-50';
}
