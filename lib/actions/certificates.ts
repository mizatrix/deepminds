'use server';

import { prisma } from '@/lib/prisma';

export interface Certificate {
    id: string;
    certificateNo: string;
    title: string;
    category: string;
    recipient: string;
    issuer: string;
    date: string;
    points: number;
    tier: 'standard' | 'honor' | 'excellence';
}

/**
 * Get certificates for a student (from approved submissions with 50+ points)
 */
export async function getStudentCertificates(email: string): Promise<Certificate[]> {
    try {
        const approvedSubmissions = await prisma.submission.findMany({
            where: {
                studentEmail: email,
                status: 'APPROVED',
                points: { gte: 50 } // Minimum points for certificate eligibility
            },
            orderBy: { reviewedAt: 'desc' }
        });

        // Transform submissions into certificates
        return approvedSubmissions.map(sub => ({
            id: sub.id,
            certificateNo: generateCertificateNumber(sub.id, sub.submittedAt),
            title: sub.title,
            category: sub.category,
            recipient: sub.studentName,
            issuer: sub.orgName || 'MSA University',
            date: sub.reviewedAt?.toISOString() || sub.submittedAt.toISOString(),
            points: sub.points || 50,
            tier: getCertificateTier(sub.points || 50)
        }));
    } catch (error) {
        console.error('Error fetching certificates:', error);
        return [];
    }
}

/**
 * Get a single certificate by submission ID
 */
export async function getCertificateBySubmissionId(submissionId: string): Promise<Certificate | null> {
    try {
        const submission = await prisma.submission.findUnique({
            where: { id: submissionId }
        });

        if (!submission || submission.status !== 'APPROVED' || (submission.points || 0) < 50) {
            return null;
        }

        return {
            id: submission.id,
            certificateNo: generateCertificateNumber(submission.id, submission.submittedAt),
            title: submission.title,
            category: submission.category,
            recipient: submission.studentName,
            issuer: submission.orgName || 'MSA University',
            date: submission.reviewedAt?.toISOString() || submission.submittedAt.toISOString(),
            points: submission.points || 50,
            tier: getCertificateTier(submission.points || 50)
        };
    } catch (error) {
        console.error('Error fetching certificate:', error);
        return null;
    }
}

/**
 * Generate unique certificate number
 * Format: CERT-YYYY-AAAAAA (Year + 6-char unique ID from submission)
 */
function generateCertificateNumber(submissionId: string, submittedAt: Date): string {
    const year = submittedAt.getFullYear();
    const uniqueId = submissionId.slice(-6).toUpperCase();
    return `CERT-${year}-${uniqueId}`;
}

/**
 * Get certificate tier based on points
 */
function getCertificateTier(points: number): 'standard' | 'honor' | 'excellence' {
    if (points >= 150) return 'excellence';
    if (points >= 100) return 'honor';
    return 'standard';
}

/**
 * Get all certificates (admin function)
 */
export async function getAllCertificates(): Promise<Certificate[]> {
    try {
        const approvedSubmissions = await prisma.submission.findMany({
            where: {
                status: 'APPROVED',
                points: { gte: 50 }
            },
            orderBy: { reviewedAt: 'desc' }
        });

        return approvedSubmissions.map(sub => ({
            id: sub.id,
            certificateNo: generateCertificateNumber(sub.id, sub.submittedAt),
            title: sub.title,
            category: sub.category,
            recipient: sub.studentName,
            issuer: sub.orgName || 'MSA University',
            date: sub.reviewedAt?.toISOString() || sub.submittedAt.toISOString(),
            points: sub.points || 50,
            tier: getCertificateTier(sub.points || 50)
        }));
    } catch (error) {
        console.error('Error fetching all certificates:', error);
        return [];
    }
}
