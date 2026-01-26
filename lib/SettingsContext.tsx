'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getSystemSettings, saveSystemSettings, type SystemSettingsData, type AcademicTerm } from './actions/settings';

interface SettingsContextType {
    settings: SystemSettingsData | null;
    loading: boolean;
    updateSettings: (newSettings: SystemSettingsData) => Promise<boolean>;
    refreshSettings: () => Promise<void>;
    portalName: string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<SystemSettingsData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSettings = useCallback(async () => {
        try {
            const data = await getSystemSettings();
            setSettings(data);
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const updateSettings = async (newSettings: SystemSettingsData): Promise<boolean> => {
        const result = await saveSystemSettings(newSettings);
        if (result.success) {
            setSettings(newSettings);
        }
        return result.success;
    };

    const refreshSettings = async () => {
        await fetchSettings();
    };

    const portalName = settings?.portalName || 'CS Excellence Portal';

    return (
        <SettingsContext.Provider value={{ settings, loading, updateSettings, refreshSettings, portalName }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}

// Simple hook for just the portal name
export function usePortalName(): string {
    const [name, setName] = useState('CS Excellence Portal');

    useEffect(() => {
        getSystemSettings().then(settings => {
            setName(settings.portalName);
        });
    }, []);

    return name;
}

// Re-export types
export type { SystemSettingsData, AcademicTerm };
