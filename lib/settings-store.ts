/**
 * Settings Store - Manages system settings with localStorage persistence
 */

export interface AcademicTerm {
    id: string;
    name: string;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
    createdAt: string;
}

export interface SystemSettings {
    // General
    portalName: string;

    // Terms
    terms: AcademicTerm[];

    // Access & Security
    maintenanceMode: boolean;
    allowRegistrations: boolean;

    // Automation
    emailNotifications: boolean;
    autoApproveScientific: boolean;
}

const SETTINGS_KEY = 'cs_excellence_settings';

// Default settings with initial terms
const defaultSettings: SystemSettings = {
    portalName: 'CS Excellence Portal',
    terms: [
        {
            id: 'term_1',
            name: 'Fall 2024',
            startDate: '2024-09-01',
            endDate: '2024-12-31',
            isActive: true,
            createdAt: new Date().toISOString()
        },
        {
            id: 'term_2',
            name: 'Spring 2025',
            startDate: '2025-01-15',
            endDate: '2025-05-15',
            isActive: false,
            createdAt: new Date().toISOString()
        }
    ],
    maintenanceMode: false,
    allowRegistrations: true,
    emailNotifications: true,
    autoApproveScientific: false
};

/**
 * Get all system settings
 */
export function getSettings(): SystemSettings {
    if (typeof window === 'undefined') return defaultSettings;

    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Merge with defaults to ensure all keys exist
            return { ...defaultSettings, ...parsed };
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }

    return defaultSettings;
}

/**
 * Save system settings
 */
export function saveSettings(settings: SystemSettings): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

/**
 * Get the active term
 */
export function getActiveTerm(): AcademicTerm | null {
    const settings = getSettings();
    return settings.terms.find(t => t.isActive) || null;
}

/**
 * Set a term as active (deactivates all others)
 */
export function setActiveTerm(termId: string): void {
    const settings = getSettings();
    settings.terms = settings.terms.map(term => ({
        ...term,
        isActive: term.id === termId
    }));
    saveSettings(settings);
}

/**
 * Add a new term
 */
export function addTerm(name: string, startDate?: string, endDate?: string): AcademicTerm {
    const settings = getSettings();
    const newTerm: AcademicTerm = {
        id: `term_${Date.now()}`,
        name,
        startDate,
        endDate,
        isActive: false,
        createdAt: new Date().toISOString()
    };
    settings.terms.push(newTerm);
    saveSettings(settings);
    return newTerm;
}

/**
 * Update an existing term
 */
export function updateTerm(termId: string, updates: Partial<Omit<AcademicTerm, 'id' | 'createdAt'>>): void {
    const settings = getSettings();
    settings.terms = settings.terms.map(term =>
        term.id === termId ? { ...term, ...updates } : term
    );
    saveSettings(settings);
}

/**
 * Delete a term
 */
export function deleteTerm(termId: string): boolean {
    const settings = getSettings();
    const term = settings.terms.find(t => t.id === termId);

    // Don't delete the active term
    if (term?.isActive) {
        return false;
    }

    settings.terms = settings.terms.filter(t => t.id !== termId);
    saveSettings(settings);
    return true;
}

/**
 * Update a specific setting
 */
export function updateSetting<K extends keyof SystemSettings>(
    key: K,
    value: SystemSettings[K]
): void {
    const settings = getSettings();
    settings[key] = value;
    saveSettings(settings);
}

/**
 * Check if maintenance mode is enabled
 */
export function isMaintenanceMode(): boolean {
    return getSettings().maintenanceMode;
}

/**
 * Check if registrations are allowed
 */
export function isRegistrationAllowed(): boolean {
    return getSettings().allowRegistrations;
}

/**
 * Generate unique term ID
 */
export function generateTermId(): string {
    return `term_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
