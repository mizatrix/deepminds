import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export interface User {
    id: string;
    email: string;
    password?: string;
    name: string;
    role: 'STUDENT' | 'ADMIN';
    image?: string;
    createdAt: string;
    emailVerified?: boolean;
    provider?: 'credentials' | 'google' | 'github' | 'microsoft' | 'facebook';
}

const SALT_ROUNDS = 10;

// Helper to convert Prisma null to undefined for TypeScript compatibility
function toUser(u: NonNullable<Awaited<ReturnType<typeof prisma.user.findUnique>>>): User {
    return {
        id: u.id,
        email: u.email,
        password: u.password ?? undefined,
        name: u.name,
        role: u.role as 'STUDENT' | 'ADMIN',
        image: u.image ?? undefined,
        createdAt: u.createdAt.toISOString(),
        emailVerified: u.emailVerified,
        provider: (u.provider ?? undefined) as User['provider'],
    };
}

/**
 * Get all users from database
 */
export async function getUsers(): Promise<User[]> {
    const users = await prisma.user.findMany();
    return users.map(toUser);
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) return null;
    return toUser(user);
}

/**
 * Find user by ID
 */
export async function findUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
        where: { id },
    });

    if (!user) return null;
    return toUser(user);
}

/**
 * Create a new user
 */
export async function createUser(data: {
    email: string;
    name: string;
    password?: string;
    role?: 'STUDENT' | 'ADMIN';
    image?: string;
    provider?: string;
}): Promise<User> {
    const hashedPassword = data.password
        ? await bcrypt.hash(data.password, SALT_ROUNDS)
        : undefined;

    const user = await prisma.user.create({
        data: {
            email: data.email,
            name: data.name,
            password: hashedPassword,
            role: data.role || 'STUDENT',
            image: data.image,
            provider: data.provider || 'credentials',
            emailVerified: false,
        },
    });

    return toUser(user);
}

/**
 * Update user
 */
export async function updateUser(id: string, data: Partial<User>): Promise<User> {
    const user = await prisma.user.update({
        where: { id },
        data: {
            ...(data.name && { name: data.name }),
            ...(data.email && { email: data.email }),
            ...(data.role && { role: data.role }),
            ...(data.image && { image: data.image }),
            ...(data.emailVerified !== undefined && { emailVerified: data.emailVerified }),
        },
    });

    return toUser(user);
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<void> {
    await prisma.user.delete({
        where: { id },
    });
}

/**
 * Verify password and return user if valid
 */
export async function verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await findUserByEmail(email);

    if (!user || !user.password) {
        return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
}

/**
 * Change user password
 */
export async function changePassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });
}
