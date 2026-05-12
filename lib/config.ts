/**
 * Centralized configuration for behavior that previously lived as magic numbers
 * or hardcoded strings scattered through the codebase. Values fall back to safe
 * defaults so the app keeps running if an env var is missing, but anything that
 * an operator might want to tune in production should come from env.
 */

function envInt(name: string, fallback: number): number {
    const raw = process.env[name];
    if (!raw) return fallback;
    const parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function envStr(name: string, fallback: string): string {
    const raw = process.env[name];
    return raw && raw.trim() ? raw.trim() : fallback;
}

/** Email domain users must sign in with, e.g. "msa.edu.eg". No leading @. */
export const ALLOWED_EMAIL_DOMAIN = envStr('ALLOWED_EMAIL_DOMAIN', 'msa.edu.eg');

/** Returns true if the given email belongs to the allowed institution domain. */
export function isAllowedEmail(email: string | null | undefined): boolean {
    if (!email) return false;
    return email.toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN.toLowerCase()}`);
}

/** Uploads — kept in sync with the storage provider's limits. */
export const upload = {
    maxSizeMB: envInt('MAX_UPLOAD_SIZE_MB', 10),
    get maxSizeBytes() {
        return this.maxSizeMB * 1024 * 1024;
    },
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
    allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
    ],
};

/** Auto-refresh intervals for admin and student dashboards (milliseconds). */
export const polling = {
    submissionListMs: envInt('POLL_SUBMISSIONS_MS', 60_000),
    dashboardStatsMs: envInt('POLL_DASHBOARD_MS', 60_000),
    publicWallMs: envInt('POLL_PUBLIC_WALL_MS', 60_000),
};

/** Session and JWT durations (seconds). */
export const session = {
    maxAgeSec: envInt('SESSION_MAX_AGE_SEC', 30 * 24 * 60 * 60), // 30 days
    updateAgeSec: envInt('SESSION_UPDATE_AGE_SEC', 24 * 60 * 60), // 24h
};
