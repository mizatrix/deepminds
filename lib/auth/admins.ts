// List of hardcoded admin emails - ONLY these can access admin routes
const ADMIN_EMAILS = [
    'admin@example.com',
    // Add more admin emails here as needed
];

/**
 * Check if email is a hardcoded admin
 */
export function isHardcodedAdmin(email: string | null | undefined): boolean {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase());
}
