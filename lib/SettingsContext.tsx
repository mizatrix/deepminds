'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSettings, saveSettings, type SystemSettings } from './settings-store';

interface SettingsContextType {
    settings: SystemSettings | null;
    updateSettings: (newSettings: Partial<SystemSettings>) => void;
    portalName: string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<SystemSettings | null>(null);

    useEffect(() => {
        // Load settings from localStorage on mount
        setSettings(getSettings());
    }, []);

    const updateSettings = (newSettings: Partial<SystemSettings>) => {
        if (!settings) return;
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        saveSettings(updated);
    };

    const portalName = settings?.portalName || 'CS Excellence Portal';

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, portalName }}>
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

// Safe hook that won't throw during SSR
export function usePortalName(): string {
    const [mounted, setMounted] = useState(false);
    const [name, setName] = useState('CS Excellence Portal');

    useEffect(() => {
        setMounted(true);
        const settings = getSettings();
        setName(settings.portalName);
    }, []);

    return name;
}
