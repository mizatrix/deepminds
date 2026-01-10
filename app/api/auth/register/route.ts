import { NextResponse } from 'next/server';
import { createUser } from '@/lib/auth/users';
import { registerSchema } from '@/lib/auth/validation';
import { notifyWelcome } from '@/lib/actions/notifications';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input
        const validation = registerSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.issues },
                { status: 400 }
            );
        }

        const { email, password, name } = validation.data;

        // Create user
        const user = await createUser({
            email,
            password,
            name,
            role: 'STUDENT', // Default role for self-registration
        });

        // Send welcome notification
        try {
            await notifyWelcome(user.email, user.name);
        } catch (notifError) {
            console.error('Failed to send welcome notification:', notifError);
            // Don't fail registration if notification fails
        }

        // Return user (without password)
        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error: any) {
        console.error('Registration error:', error);

        if (error.message?.includes('already exists')) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
