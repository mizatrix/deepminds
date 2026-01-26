'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface AcademicTerm {
    id: string;
    name: string;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
    createdAt: string;
}

export interface SystemSettingsData {
    portalName: string;
    terms: AcademicTerm[];
    maintenanceMode: boolean;
    allowRegistrations: boolean;
    emailNotifications: boolean;
    autoApproveScientific: boolean;
}

const SINGLETON_ID = 'singleton';

const defaultSettings: SystemSettingsData = {
    portalName: 'CS Excellence Portal',
    terms: [
        {
            id: 'term_1',
            name: 'Fall 2024',
            startDate: '2024-09-01',
            endDate: '2024-12-31',
            isActive: true,
            createdAt: new Date().toISOString()
        }
    ],
    maintenanceMode: false,
    allowRegistrations: true,
    emailNotifications: true,
    autoApproveScientific: false
};

/**
 * Get system settings from database
 */
export async function getSystemSettings(): Promise<SystemSettingsData> {
    try {
        const settings = await prisma.systemSettings.findUnique({
            where: { id: SINGLETON_ID }
        });

        if (!settings) {
            // Return defaults if no settings exist yet
            return defaultSettings;
        }

        // Parse terms from JSON
        let terms: AcademicTerm[] = [];
        try {
            terms = JSON.parse(settings.termsJson || '[]');
        } catch {
            terms = defaultSettings.terms;
        }

        return {
            portalName: settings.portalName,
            terms,
            maintenanceMode: settings.maintenanceMode,
            allowRegistrations: settings.allowRegistrations,
            emailNotifications: settings.emailNotifications,
            autoApproveScientific: settings.autoApproveScientific,
        };
    } catch (error) {
        console.error('Error fetching system settings:', error);
        return defaultSettings;
    }
}

/**
 * Get just the portal name (for navbar/pages)
 */
export async function getPortalName(): Promise<string> {
    try {
        const settings = await prisma.systemSettings.findUnique({
            where: { id: SINGLETON_ID },
            select: { portalName: true }
        });
        return settings?.portalName || defaultSettings.portalName;
    } catch {
        return defaultSettings.portalName;
    }
}

/**
 * Save system settings to database
 */
export async function saveSystemSettings(
    data: SystemSettingsData,
    updatedBy?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await prisma.systemSettings.upsert({
            where: { id: SINGLETON_ID },
            create: {
                id: SINGLETON_ID,
                portalName: data.portalName,
                maintenanceMode: data.maintenanceMode,
                allowRegistrations: data.allowRegistrations,
                emailNotifications: data.emailNotifications,
                autoApproveScientific: data.autoApproveScientific,
                termsJson: JSON.stringify(data.terms),
                updatedBy,
            },
            update: {
                portalName: data.portalName,
                maintenanceMode: data.maintenanceMode,
                allowRegistrations: data.allowRegistrations,
                emailNotifications: data.emailNotifications,
                autoApproveScientific: data.autoApproveScientific,
                termsJson: JSON.stringify(data.terms),
                updatedBy,
            },
        });

        // Revalidate all pages that might use settings
        revalidatePath('/', 'layout');

        return { success: true };
    } catch (error) {
        console.error('Error saving system settings:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Check if maintenance mode is enabled
 */
export async function isMaintenanceMode(): Promise<boolean> {
    try {
        const settings = await prisma.systemSettings.findUnique({
            where: { id: SINGLETON_ID },
            select: { maintenanceMode: true }
        });
        return settings?.maintenanceMode || false;
    } catch {
        return false;
    }
}
