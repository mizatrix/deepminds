'use server';

import { prisma } from '@/lib/prisma';

export async function subscribeToNewsletter(email: string): Promise<{ success: boolean; message: string }> {
    if (!email || !email.includes('@')) {
        return { success: false, message: 'Please enter a valid email address.' };
    }

    try {
        // Check if already subscribed
        const existing = await prisma.newsletterSubscriber.findUnique({
            where: { email: email.toLowerCase().trim() },
        });

        if (existing) {
            if (existing.isActive) {
                return { success: false, message: 'You\'re already subscribed!' };
            }
            // Reactivate if previously unsubscribed
            await prisma.newsletterSubscriber.update({
                where: { email: email.toLowerCase().trim() },
                data: { isActive: true },
            });
            return { success: true, message: 'Welcome back! You\'ve been resubscribed.' };
        }

        await prisma.newsletterSubscriber.create({
            data: { email: email.toLowerCase().trim() },
        });

        return { success: true, message: 'Thanks for subscribing! 🎉' };
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return { success: false, message: 'Something went wrong. Please try again.' };
    }
}
