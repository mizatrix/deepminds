/**
 * Certificate Design Configuration
 * Defines colors, fonts, and design elements for each category
 */

export interface CertificateConfig {
    category: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        text: string;
    };
    fonts: {
        title: string;
        body: string;
    };
    seal: {
        color: string;
        style: 'modern' | 'classic' | 'tech' | 'elegant';
    };
}

export const CERTIFICATE_CONFIGS: Record<string, CertificateConfig> = {
    SCIENTIFIC: {
        category: 'Scientific',
        colors: {
            primary: '#1e3a8a',    // Deep Blue
            secondary: '#06b6d4',  // Electric Cyan
            accent: '#94a3b8',     // Silver
            text: '#0f172a'
        },
        fonts: {
            title: 'helvetica',
            body: 'helvetica'
        },
        seal: {
            color: '#06b6d4',
            style: 'modern'
        }
    },
    ARTISTIC: {
        category: 'Artistic',
        colors: {
            primary: '#7c3aed',    // Royal Purple
            secondary: '#fb7185',  // Rose Gold
            accent: '#f59e0b',     // Warm Gold
            text: '#1f2937'
        },
        fonts: {
            title: 'times',
            body: 'helvetica'
        },
        seal: {
            color: '#f59e0b',
            style: 'elegant'
        }
    },
    COMPETITION: {
        category: 'Competition',
        colors: {
            primary: '#eab308',    // Champion Gold
            secondary: '#dc2626',  // Victory Red
            accent: '#e5e7eb',     // Platinum
            text: '#111827'
        },
        fonts: {
            title: 'helvetica',
            body: 'helvetica'
        },
        seal: {
            color: '#eab308',
            style: 'classic'
        }
    },
    HACKATHONS: {
        category: 'Hackathons',
        colors: {
            primary: '#10b981',    // Neon Green
            secondary: '#0f172a',  // Dark Code
            accent: '#fb923c',     // Terminal Orange
            text: '#0f172a'
        },
        fonts: {
            title: 'courier',
            body: 'courier'
        },
        seal: {
            color: '#10b981',
            style: 'tech'
        }
    },
    AWARDS: {
        category: 'Awards',
        colors: {
            primary: '#991b1b',    // Deep Burgundy
            secondary: '#ca8a04',  // Classic Gold
            accent: '#fef3c7',     // Ivory
            text: '#422006'
        },
        fonts: {
            title: 'times',
            body: 'times'
        },
        seal: {
            color: '#ca8a04',
            style: 'classic'
        }
    },
    SPORTS: {
        category: 'Sports',
        colors: {
            primary: '#2563eb',    // Athletic Blue
            secondary: '#ea580c',  // Energy Orange
            accent: '#94a3b8',     // Champion Silver
            text: '#1e293b'
        },
        fonts: {
            title: 'helvetica',
            body: 'helvetica'
        },
        seal: {
            color: '#ea580c',
            style: 'modern'
        }
    },
    INTERNSHIPS: {
        category: 'Internships',
        colors: {
            primary: '#1e40af',    // Corporate Navy
            secondary: '#64748b',  // Professional Gray
            accent: '#059669',     // Success Green
            text: '#0f172a'
        },
        fonts: {
            title: 'helvetica',
            body: 'helvetica'
        },
        seal: {
            color: '#059669',
            style: 'modern'
        }
    },
    VOLUNTEERING: {
        category: 'Volunteering',
        colors: {
            primary: '#ef4444',    // Heart Red
            secondary: '#3b82f6',  // Caring Blue
            accent: '#fbbf24',     // Hope Yellow
            text: '#1f2937'
        },
        fonts: {
            title: 'helvetica',
            body: 'helvetica'
        },
        seal: {
            color: '#ef4444',
            style: 'elegant'
        }
    },
    ENTREPRENEURSHIP: {
        category: 'Entrepreneurship',
        colors: {
            primary: '#f97316',    // Startup Orange
            secondary: '#8b5cf6',  // Innovation Purple
            accent: '#06b6d4',     // Vision Cyan
            text: '#1e293b'
        },
        fonts: {
            title: 'helvetica',
            body: 'helvetica'
        },
        seal: {
            color: '#f97316',
            style: 'modern'
        }
    },
    'GLOBAL EXCHANGE': {
        category: 'Global Exchange',
        colors: {
            primary: '#0284c7',    // World Blue
            secondary: '#d97706',  // Cultural Gold
            accent: '#10b981',     // International Green
            text: '#0f172a'
        },
        fonts: {
            title: 'helvetica',
            body: 'helvetica'
        },
        seal: {
            color: '#0284c7',
            style: 'classic'
        }
    },
    'SPECIAL TRAINING': {
        category: 'Special Training',
        colors: {
            primary: '#16a34a',    // Growth Green
            secondary: '#2563eb',  // Knowledge Blue
            accent: '#fb923c',     // Learning Orange
            text: '#1e293b'
        },
        fonts: {
            title: 'helvetica',
            body: 'helvetica'
        },
        seal: {
            color: '#16a34a',
            style: 'modern'
        }
    },
    OTHER: {
        category: 'Other',
        colors: {
            primary: '#8b5cf6',    // Universal Purple
            secondary: '#6b7280',  // Neutral Gray
            accent: '#14b8a6',     // Accent Teal
            text: '#1f2937'
        },
        fonts: {
            title: 'helvetica',
            body: 'helvetica'
        },
        seal: {
            color: '#8b5cf6',
            style: 'modern'
        }
    }
};

/**
 * Get certificate tier based on points
 */
export function getCertificateTier(points: number): 'standard' | 'honor' | 'excellence' {
    if (points >= 150) return 'excellence';
    if (points >= 100) return 'honor';
    return 'standard';
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: 'standard' | 'honor' | 'excellence'): string {
    const names = {
        standard: 'Certificate of Achievement',
        honor: 'Certificate of Honor',
        excellence: 'Certificate of Excellence'
    };
    return names[tier];
}

/**
 * Normalize category name for lookup
 */
export function normalizeCategoryName(category: string): string {
    return category.toUpperCase().trim();
}

/**
 * Get certificate config for a category
 */
export function getCertificateConfig(category: string): CertificateConfig {
    const normalized = normalizeCategoryName(category);
    return CERTIFICATE_CONFIGS[normalized] || CERTIFICATE_CONFIGS.OTHER;
}
