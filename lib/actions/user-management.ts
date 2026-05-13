'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/config';
import { revalidatePath } from 'next/cache';

type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'STUDENT';

export interface UserData {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    faculty: string | null;
    isActive: boolean;
    createdAt: Date | string;
    submissionCount?: number;
    points?: number;
}

/**
 * Toggle user active status
 */
export async function toggleUserStatus(userId: string): Promise<{ success: boolean; error?: string; user?: UserData }> {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { success: false, error: 'Unauthorized' };
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')) {
            return { success: false, error: 'Insufficient permissions' };
        }

        const targetUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!targetUser) {
            return { success: false, error: 'User not found' };
        }

        // Cannot deactivate Super Admins
        if (targetUser.role === 'SUPER_ADMIN') {
            return { success: false, error: 'Super Admins cannot be deactivated' };
        }

        // Toggle status
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isActive: !targetUser.isActive }
        });

        revalidatePath('/admin/users');

        return {
            success: true,
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role as UserRole,
                faculty: updatedUser.faculty,
                isActive: updatedUser.isActive,
                createdAt: updatedUser.createdAt.toISOString() as any
            }
        };
    } catch (error) {
        console.error('[toggleUserStatus] Error:', error);
        return { success: false, error: 'Failed to toggle user status' };
    }
}

/**
 * Get all users with submission stats
 * Uses aggregation queries instead of N+1 individual queries to avoid
 * PgBouncer "prepared statement does not exist" errors on Supabase.
 */
export async function getUsers(): Promise<UserData[]> {
    try {
        // Single query to get all users
        const users = await prisma.user.findMany({
            where: { isDeleted: false },
            orderBy: { createdAt: 'desc' }
        });

        // Fetch submission stats with separate error handling
        // so user list still works even if aggregation fails
        let countMap = new Map<string, number>();
        let pointsMap = new Map<string, number>();

        try {
            // Single aggregation query: count submissions per studentEmail
            const submissionCounts = await prisma.submission.groupBy({
                by: ['studentEmail'],
                _count: { id: true },
            });
            countMap = new Map(
                submissionCounts.map(s => [s.studentEmail, s._count.id])
            );
            console.log('[getUsers] Submission counts loaded:', submissionCounts.length, 'groups');
        } catch (aggError) {
            console.error('[getUsers] Failed to load submission counts via groupBy, falling back to count query:', aggError);
            // Fallback: try a simpler approach
            try {
                const allSubmissions = await prisma.submission.findMany({
                    select: { studentEmail: true },
                });
                const counts = new Map<string, number>();
                for (const s of allSubmissions) {
                    counts.set(s.studentEmail, (counts.get(s.studentEmail) || 0) + 1);
                }
                countMap = counts;
                console.log('[getUsers] Fallback submission counts loaded:', allSubmissions.length, 'submissions');
            } catch (fallbackError) {
                console.error('[getUsers] Fallback submission count also failed:', fallbackError);
            }
        }

        try {
            // Single aggregation query: sum points for approved submissions per studentEmail
            const pointSums = await prisma.submission.groupBy({
                by: ['studentEmail'],
                where: { status: 'APPROVED' },
                _sum: { points: true },
            });
            pointsMap = new Map(
                pointSums.map(s => [s.studentEmail, s._sum.points || 0])
            );
        } catch (ptError) {
            console.error('[getUsers] Failed to load point sums:', ptError);
            // Fallback for points
            try {
                const approvedSubs = await prisma.submission.findMany({
                    where: { status: 'APPROVED' },
                    select: { studentEmail: true, points: true },
                });
                const pts = new Map<string, number>();
                for (const s of approvedSubs) {
                    pts.set(s.studentEmail, (pts.get(s.studentEmail) || 0) + (s.points || 0));
                }
                pointsMap = pts;
            } catch (fallbackError) {
                console.error('[getUsers] Fallback points also failed:', fallbackError);
            }
        }

        // Join in-memory — no extra DB calls
        const result = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as UserRole,
            faculty: user.faculty,
            isActive: user.isActive,
            createdAt: user.createdAt.toISOString(),
            submissionCount: countMap.get(user.email) || 0,
            points: pointsMap.get(user.email) || 0,
        }));

        const withSubs = result.filter(u => u.submissionCount > 0).length;
        console.log('[getUsers] Returning', result.length, 'users,', withSubs, 'with submissions');

        return result;
    } catch (error) {
        console.error('[getUsers] Error:', error);
        return [];
    }
}

/**
 * Delete a user (soft delete - marks as deleted, doesn't remove from database)
 */
export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { success: false, error: 'Unauthorized' };
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')) {
            return { success: false, error: 'Insufficient permissions' };
        }

        const targetUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!targetUser) {
            return { success: false, error: 'User not found' };
        }

        // Cannot delete Super Admins
        if (targetUser.role === 'SUPER_ADMIN') {
            return { success: false, error: 'Super Admins cannot be deleted' };
        }

        // Soft delete: mark as deleted instead of removing
        await prisma.user.update({
            where: { id: userId },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                isActive: false // Also deactivate
            }
        });

        revalidatePath('/admin/users');

        return { success: true };
    } catch (error) {
        console.error('[deleteUser] Error:', error);
        return { success: false, error: 'Failed to delete user' };
    }
}

/**
 * Promote user role
 */
export async function promoteUserRole(userId: string): Promise<{ success: boolean; error?: string; newRole?: UserRole }> {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { success: false, error: 'Unauthorized' };
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
            return { success: false, error: 'Only Super Admins can promote users' };
        }

        const targetUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!targetUser) {
            return { success: false, error: 'User not found' };
        }

        let newRole: UserRole;
        if (targetUser.role === 'STUDENT') {
            newRole = 'ADMIN';
        } else if (targetUser.role === 'ADMIN') {
            // Check if there's already a Super Admin
            const existingSuperAdmin = await prisma.user.findFirst({
                where: { role: 'SUPER_ADMIN' }
            });
            if (existingSuperAdmin) {
                return { success: false, error: 'Only one Super Admin is allowed' };
            }
            newRole = 'SUPER_ADMIN';
        } else {
            return { success: false, error: 'Cannot promote this user further' };
        }

        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole }
        });

        revalidatePath('/admin/users');

        return { success: true, newRole };
    } catch (error) {
        console.error('[promoteUserRole] Error:', error);
        return { success: false, error: 'Failed to promote user' };
    }
}

/**
 * Demote user role
 */
export async function demoteUserRole(userId: string): Promise<{ success: boolean; error?: string; newRole?: UserRole }> {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { success: false, error: 'Unauthorized' };
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
            return { success: false, error: 'Only Super Admins can demote users' };
        }

        const targetUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!targetUser) {
            return { success: false, error: 'User not found' };
        }

        if (targetUser.role === 'SUPER_ADMIN') {
            return { success: false, error: 'Super Admins cannot be demoted' };
        }

        if (targetUser.role === 'STUDENT') {
            return { success: false, error: 'Cannot demote this user further' };
        }

        const newRole: UserRole = 'STUDENT';

        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole }
        });

        revalidatePath('/admin/users');

        return { success: true, newRole };
    } catch (error) {
        console.error('[demoteUserRole] Error:', error);
        return { success: false, error: 'Failed to demote user' };
    }
}
