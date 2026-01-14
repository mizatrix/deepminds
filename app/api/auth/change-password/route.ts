import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { changePassword } from '@/lib/auth/users-db';
import { changePasswordSchema } from '@/lib/auth/validation';

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate input
        const validation = changePasswordSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.issues },
                { status: 400 }
            );
        }

        const { currentPassword, newPassword } = validation.data;
        const userId = (session.user as any).id;

        // Change password
        const success = await changePassword(userId, currentPassword, newPassword);

        if (!success) {
            return NextResponse.json(
                { error: 'Current password is incorrect' },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
