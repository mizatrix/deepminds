import { auth } from './config';

/**
 * Get the current user session (server-side)
 */
export async function getSession() {
    return await auth();
}

/**
 * Get the current user (server-side)
 */
export async function getCurrentUser() {
    const session = await getSession();
    return session?.user;
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth() {
    const session = await getSession();

    if (!session?.user) {
        throw new Error('Unauthorized');
    }

    return session.user;
}

/**
 * Require admin role - throws if not admin
 */
export async function requireAdmin() {
    const user = await requireAuth();

    if ((user as any).role !== 'ADMIN') {
        throw new Error('Forbidden - Admin access required');
    }

    return user;
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: 'STUDENT' | 'ADMIN') {
    const session = await getSession();
    return (session?.user as any)?.role === role;
}
