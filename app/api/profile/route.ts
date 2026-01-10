import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { calculateProfileCompletion } from '@/lib/profile/completion';
import { notifyProfileComplete } from '@/lib/actions/notifications';

/**
 * GET /api/profile
 * Get current user's profile
 */
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Calculate completion
        const completion = calculateProfileCompletion(user);

        // Don't send password
        const { password, ...userWithoutPassword } = user;

        return NextResponse.json({
            user: userWithoutPassword,
            completion,
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * PUT /api/profile
 * Update current user's profile
 */
export async function PUT(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get current user to check if profile was already complete
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        });
        const wasComplete = currentUser?.profileCompleted ?? false;

        const body = await request.json();

        // Validate and sanitize input
        const allowedFields = [
            'name',
            'avatar',
            'faculty',
            'year',
            'studentId',
            'department',
            'position',
            'phone',
            'bio',
            'linkedIn',
            'github',
            'twitter',
            'website',
        ];

        const updateData: any = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        // Validate bio length
        if (updateData.bio && updateData.bio.length > 500) {
            return NextResponse.json(
                { error: 'Bio must be 500 characters or less' },
                { status: 400 }
            );
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: updateData,
        });

        // Recalculate completion
        const completion = calculateProfileCompletion(updatedUser);

        // Update completion fields
        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                profileCompleted: completion.isComplete,
                completionPercentage: completion.percentage,
            },
        });

        // Send notification if profile just became complete
        if (!wasComplete && completion.isComplete) {
            try {
                await notifyProfileComplete(session.user.email);
            } catch (error) {
                console.error('Failed to send profile complete notification:', error);
            }
        }

        // Don't send password
        const { password, ...userWithoutPassword } = updatedUser;

        return NextResponse.json({
            user: {
                ...userWithoutPassword,
                profileCompleted: completion.isComplete,
                completionPercentage: completion.percentage,
            },
            completion,
            message: 'Profile updated successfully',
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

