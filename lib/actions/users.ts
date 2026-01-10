'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/config';
import { notifyRolePromotion, notifyBadgeEarned } from './notifications';

export type UserRole = 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN';

export interface UserData {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    faculty?: string;
    status: 'Active' | 'Inactive';
    createdAt: string;
}

/**
 * Get all users (admin only)
 */
export async function getUsers(): Promise<UserData[]> {
    const session = await auth();
    if (!session?.user?.email) {
        throw new Error('Unauthorized');
    }

    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')) {
        throw new Error('Admin access required');
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
    });

    return users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role as UserRole,
        faculty: u.faculty ?? undefined,
        status: 'Active' as const, // TODO: Add status field to User model
        createdAt: u.createdAt.toISOString(),
    }));
}

/**
 * Promote a user to a higher role
 */
export async function promoteUser(userId: string, newRole: UserRole): Promise<{ success: boolean; message: string }> {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, message: 'Unauthorized' };
    }

    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!currentUser) {
        return { success: false, message: 'Current user not found' };
    }

    // Only SUPER_ADMIN can promote users
    if (currentUser.role !== 'SUPER_ADMIN') {
        return { success: false, message: 'Only Super Admin can promote users' };
    }

    // Get target user
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
        return { success: false, message: 'User not found' };
    }

    // Prevent promoting to SUPER_ADMIN if one exists
    if (newRole === 'SUPER_ADMIN') {
        const existingSuperAdmin = await prisma.user.findFirst({
            where: { role: 'SUPER_ADMIN' }
        });
        if (existingSuperAdmin) {
            return { success: false, message: 'Only one Super Admin is allowed' };
        }
    }

    // Update role
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
    });

    // Send notification for promotion to ADMIN or SUPER_ADMIN
    if (newRole === 'ADMIN' || newRole === 'SUPER_ADMIN') {
        try {
            await notifyRolePromotion(updatedUser.email, newRole);
            console.log(`[SUPER_ADMIN ACTION] Promoted ${updatedUser.email} to ${newRole}`);
        } catch (error) {
            console.error('Failed to send role promotion notification:', error);
        }
    }

    return { success: true, message: `${updatedUser.name} promoted to ${newRole}` };
}

/**
 * Demote a user to a lower role
 */
export async function demoteUser(userId: string): Promise<{ success: boolean; message: string }> {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, message: 'Unauthorized' };
    }

    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
        return { success: false, message: 'Only Super Admin can demote users' };
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
        return { success: false, message: 'User not found' };
    }

    // Cannot demote SUPER_ADMIN
    if (targetUser.role === 'SUPER_ADMIN') {
        return { success: false, message: 'Cannot demote Super Admin' };
    }

    // Demote ADMIN to STUDENT
    if (targetUser.role === 'ADMIN') {
        await prisma.user.update({
            where: { id: userId },
            data: { role: 'STUDENT' },
        });
        console.log(`[SUPER_ADMIN ACTION] Demoted ${targetUser.email} to STUDENT`);
        return { success: true, message: `${targetUser.name} demoted to STUDENT` };
    }

    return { success: false, message: 'User is already a STUDENT' };
}

/**
 * Award a badge to a user (for badge notification)
 */
export async function awardBadge(
    userEmail: string,
    badgeName: string,
    badgeDescription?: string
): Promise<void> {
    try {
        await notifyBadgeEarned(userEmail, badgeName, badgeDescription);
    } catch (error) {
        console.error('Failed to send badge notification:', error);
    }
}
