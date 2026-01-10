const DASHBOARD_PREFS_KEY = 'msa_grad_dashboard_prefs';

export interface StatWidget {
    id: string;
    label: string;
    enabled: boolean;
}

export interface DashboardPreferences {
    widgets: StatWidget[];
}

// Default configuration for dashboard widgets
const defaultWidgets: StatWidget[] = [
    { id: 'total_submissions', label: 'Total Submissions', enabled: true },
    { id: 'total_points', label: 'Total Points', enabled: true },
    { id: 'approved', label: 'Approved', enabled: true },
    { id: 'pending', label: 'Pending', enabled: true },
];

export function getDefaultPreferences(): DashboardPreferences {
    return {
        widgets: [...defaultWidgets],
    };
}

export function getDashboardPreferences(): DashboardPreferences {
    if (typeof window === 'undefined') {
        return getDefaultPreferences();
    }

    const stored = localStorage.getItem(DASHBOARD_PREFS_KEY);
    if (!stored) {
        return getDefaultPreferences();
    }

    try {
        const parsed = JSON.parse(stored) as DashboardPreferences;
        if (!Array.isArray(parsed.widgets)) {
            return getDefaultPreferences();
        }

        // Ensure all default widgets exist (in case new ones were added)
        const existingIds = new Set(parsed.widgets.map(w => w.id));
        for (const defaultWidget of defaultWidgets) {
            if (!existingIds.has(defaultWidget.id)) {
                parsed.widgets.push({ ...defaultWidget });
            }
        }
        return parsed;
    } catch {
        return getDefaultPreferences();
    }
}

export function saveDashboardPreferences(prefs: DashboardPreferences): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(DASHBOARD_PREFS_KEY, JSON.stringify(prefs));
}

export function resetDashboardPreferences(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(DASHBOARD_PREFS_KEY);
}
