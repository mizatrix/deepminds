'use server';

import { prisma } from '@/lib/prisma';
import { sendWelcomeEmail } from '@/lib/email';

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
            // Send welcome-back email (fire and forget)
            sendWelcomeEmail(email.toLowerCase().trim()).catch(() => { });
            return { success: true, message: 'Welcome back! You\'ve been resubscribed.' };
        }

        await prisma.newsletterSubscriber.create({
            data: { email: email.toLowerCase().trim() },
        });

        // Send welcome email (fire and forget)
        sendWelcomeEmail(email.toLowerCase().trim()).catch(() => { });

        return { success: true, message: 'Thanks for subscribing! 🎉' };
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return { success: false, message: 'Something went wrong. Please try again.' };
    }
}


export type NewsletterSubscriberData = {
    id: string;
    email: string;
    subscribedAt: Date;
    isActive: boolean;
};

export async function getNewsletterSubscribers(): Promise<NewsletterSubscriberData[]> {
    const subscribers = await prisma.newsletterSubscriber.findMany({
        orderBy: { subscribedAt: 'desc' },
    });
    return subscribers;
}

export async function deleteNewsletterSubscriber(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await prisma.newsletterSubscriber.delete({ where: { id } });
        return { success: true };
    } catch (error) {
        console.error('Delete subscriber error:', error);
        return { success: false, error: 'Failed to delete subscriber.' };
    }
}

export async function toggleNewsletterSubscriber(id: string): Promise<{ success: boolean; isActive?: boolean; error?: string }> {
    try {
        const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { id } });
        if (!subscriber) return { success: false, error: 'Subscriber not found.' };

        const updated = await prisma.newsletterSubscriber.update({
            where: { id },
            data: { isActive: !subscriber.isActive },
        });
        return { success: true, isActive: updated.isActive };
    } catch (error) {
        console.error('Toggle subscriber error:', error);
        return { success: false, error: 'Failed to toggle subscriber status.' };
    }
}
