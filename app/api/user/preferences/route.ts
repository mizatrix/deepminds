import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/user/preferences
 * Get current user's notification preferences
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                emailNotifications: true,
                emailDigestFrequency: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Failed to fetch preferences:', error);
        return NextResponse.json(
            { error: 'Failed to fetch preferences' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/user/preferences
 * Update current user's notification preferences
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { emailNotifications, emailDigestFrequency } = body;

        // Validate input
        const validFrequencies = ['instant', 'daily', 'weekly', 'never'];
        if (emailDigestFrequency && !validFrequencies.includes(emailDigestFrequency)) {
            return NextResponse.json(
                { error: 'Invalid email digest frequency' },
                { status: 400 }
            );
        }

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                emailNotifications: emailNotifications ?? undefined,
                emailDigestFrequency: emailDigestFrequency ?? undefined
            },
            select: {
                emailNotifications: true,
                emailDigestFrequency: true
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Failed to update preferences:', error);
        return NextResponse.json(
            { error: 'Failed to update preferences' },
            { status: 500 }
        );
    }
}
