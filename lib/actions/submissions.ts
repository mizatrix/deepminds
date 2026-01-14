'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import {
    notifySubmissionApproved,
    notifySubmissionRejected,
    notifyNewSubmission,
    notifyMilestone,
    getAdminEmails,
} from './notifications';

// Types matching the existing Submission interface
export interface Submission {
    id: string;
    studentEmail: string;
    studentName: string;
    title: string;
    category: string;
    orgName: string;
    location: string;
    achievementDate: string;
    description: string;
    evidenceUrl: string;
    evidenceFileName?: string;
    evidenceFileType?: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
    adminFeedback?: string;
    points?: number;
}

// Helper to convert Prisma model to our Submission type
function toSubmission(s: NonNullable<Awaited<ReturnType<typeof prisma.submission.findUnique>>>): Submission {
    return {
        id: s.id,
        studentEmail: s.studentEmail,
        studentName: s.studentName,
        title: s.title,
        category: s.category,
        orgName: s.orgName,
        location: s.location,
        achievementDate: s.achievementDate,
        description: s.description,
        evidenceUrl: s.evidenceUrl,
        evidenceFileName: s.evidenceFileName ?? undefined,
        evidenceFileType: s.evidenceFileType ?? undefined,
        status: s.status.toLowerCase() as Submission['status'],
        submittedAt: s.submittedAt.toISOString(),
        reviewedAt: s.reviewedAt?.toISOString(),
        reviewedBy: s.reviewedBy ?? undefined,
        adminFeedback: s.adminFeedback ?? undefined,
        points: s.points ?? undefined,
    };
}

/**
 * Create a new submission
 */
export async function createSubmission(data: Omit<Submission, 'id' | 'status' | 'submittedAt'>): Promise<Submission> {
    const submission = await prisma.submission.create({
        data: {
            studentEmail: data.studentEmail,
            studentName: data.studentName,
            title: data.title,
            category: data.category,
            orgName: data.orgName,
            location: data.location,
            achievementDate: data.achievementDate,
            description: data.description,
            evidenceUrl: data.evidenceUrl,
            evidenceFileName: data.evidenceFileName,
            evidenceFileType: data.evidenceFileType,
            status: 'PENDING',
        },
    });

    revalidatePath('/admin');
    revalidatePath('/dashboard');
    revalidatePath('/student');

    // Notify admins about new submission
    try {
        const adminEmails = await getAdminEmails();
        if (adminEmails.length > 0) {
            await notifyNewSubmission(adminEmails, data.studentName, data.title, submission.id);
        }
    } catch (error) {
        console.error('Failed to notify admins about new submission:', error);
    }

    return toSubmission(submission);
}

/**
 * Get all submissions
 */
export async function getSubmissions(): Promise<Submission[]> {
    const submissions = await prisma.submission.findMany({
        orderBy: { submittedAt: 'desc' },
    });
    return submissions.map(toSubmission);
}

/**
 * Get submission by ID
 */
export async function getSubmissionById(id: string): Promise<Submission | null> {
    const submission = await prisma.submission.findUnique({
        where: { id },
    });
    return submission ? toSubmission(submission) : null;
}

/**
 * Update a submission
 */
export async function updateSubmission(
    id: string,
    updates: Partial<Pick<Submission, 'status' | 'adminFeedback' | 'points' | 'reviewedBy'>>
): Promise<Submission> {
    // Get the current submission to check if status is changing
    const existing = await prisma.submission.findUnique({ where: { id } });
    const wasStatusChange = updates.status && existing &&
        existing.status.toLowerCase() !== updates.status.toLowerCase();

    const submission = await prisma.submission.update({
        where: { id },
        data: {
            ...(updates.status && { status: updates.status.toUpperCase() }),
            ...(updates.adminFeedback !== undefined && { adminFeedback: updates.adminFeedback }),
            ...(updates.points !== undefined && { points: updates.points }),
            ...(updates.reviewedBy && { reviewedBy: updates.reviewedBy }),
            ...(updates.status && { reviewedAt: new Date() }),
        },
    });

    // Send notification to student if status changed
    if (wasStatusChange && updates.status) {
        if (updates.status === 'approved') {
            await notifySubmissionApproved(
                submission.studentEmail,
                submission.title,
                submission.points ?? undefined,
                submission.id
            );

            // Check for milestone achievements
            if (submission.points) {
                try {
                    // Calculate total points for this student
                    const stats = await prisma.submission.aggregate({
                        where: {
                            studentEmail: submission.studentEmail,
                            status: 'APPROVED'
                        },
                        _sum: { points: true }
                    });
                    const totalPoints = stats._sum.points || 0;

                    // Check if they just crossed a milestone
                    const previousPoints = totalPoints - submission.points;
                    const milestones = [100, 500, 1000];
                    for (const milestone of milestones) {
                        if (previousPoints < milestone && totalPoints >= milestone) {
                            await notifyMilestone(submission.studentEmail, milestone);
                            break; // Only one milestone notification at a time
                        }
                    }
                } catch (error) {
                    console.error('Failed to check milestone:', error);
                }
            }
        } else if (updates.status === 'rejected') {
            await notifySubmissionRejected(
                submission.studentEmail,
                submission.title,
                updates.adminFeedback,
                submission.id
            );
        }
    }

    revalidatePath('/admin');
    revalidatePath('/dashboard');
    revalidatePath('/student');

    return toSubmission(submission);
}

/**
 * Delete a submission
 */
export async function deleteSubmission(id: string): Promise<void> {
    await prisma.submission.delete({
        where: { id },
    });

    revalidatePath('/admin');
    revalidatePath('/dashboard');
    revalidatePath('/student');
}

/**
 * Bulk delete submissions
 */
export async function bulkDeleteSubmissions(ids: string[]): Promise<number> {
    const result = await prisma.submission.deleteMany({
        where: { id: { in: ids } },
    });

    revalidatePath('/admin');
    revalidatePath('/dashboard');
    revalidatePath('/student');

    return result.count;
}

/**
 * Bulk update submission status
 */
export async function bulkUpdateSubmissionStatus(
    ids: string[],
    status: 'approved' | 'rejected',
    reviewedBy: string,
    feedback?: string
): Promise<number> {
    // Get submissions before update to get student emails
    const submissions = await prisma.submission.findMany({
        where: { id: { in: ids } },
        select: { id: true, studentEmail: true, title: true, status: true },
    });

    const result = await prisma.submission.updateMany({
        where: { id: { in: ids } },
        data: {
            status: status.toUpperCase(),
            reviewedBy,
            reviewedAt: new Date(),
            ...(feedback && { adminFeedback: feedback }),
        },
    });

    // Send notifications to all affected students
    await Promise.all(
        submissions
            .filter(s => s.status.toLowerCase() !== status) // Only notify if status actually changed
            .map(s =>
                status === 'approved'
                    ? notifySubmissionApproved(s.studentEmail, s.title, undefined, s.id)
                    : notifySubmissionRejected(s.studentEmail, s.title, feedback, s.id)
            )
    );

    revalidatePath('/admin');
    revalidatePath('/dashboard');
    revalidatePath('/student');

    return result.count;
}

/**
 * Get submissions by student email
 */
export async function getSubmissionsByStudent(email: string): Promise<Submission[]> {
    const submissions = await prisma.submission.findMany({
        where: { studentEmail: email },
        orderBy: { submittedAt: 'desc' },
    });
    return submissions.map(toSubmission);
}

/**
 * Get submissions by status
 */
export async function getSubmissionsByStatus(status: Submission['status']): Promise<Submission[]> {
    const submissions = await prisma.submission.findMany({
        where: { status: status.toUpperCase() },
        orderBy: { submittedAt: 'desc' },
    });
    return submissions.map(toSubmission);
}

/**
 * Get submission statistics
 */
export async function getSubmissionStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}> {
    const [total, pending, approved, rejected] = await Promise.all([
        prisma.submission.count(),
        prisma.submission.count({ where: { status: 'PENDING' } }),
        prisma.submission.count({ where: { status: 'APPROVED' } }),
        prisma.submission.count({ where: { status: 'REJECTED' } }),
    ]);

    return { total, pending, approved, rejected };
}

/**
 * Generate a unique submission ID (for compatibility with existing code)
 */
export async function generateSubmissionId(): Promise<string> {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
