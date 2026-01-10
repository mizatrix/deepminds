import { User } from '@prisma/client';

interface ProfileCompletionResult {
    percentage: number;
    isComplete: boolean;
    missingFields: string[];
    requiredFields: string[];
}

/**
 * Calculate profile completion percentage based on user role
 */
export function calculateProfileCompletion(user: Partial<User>): ProfileCompletionResult {
    const role = user.role || 'STUDENT';

    if (role === 'STUDENT') {
        return calculateStudentCompletion(user);
    } else {
        return calculateAdminCompletion(user);
    }
}

/**
 * Calculate completion for student profiles
 * Required fields: name, email, avatar, faculty, year, studentId, phone, bio
 */
function calculateStudentCompletion(user: Partial<User>): ProfileCompletionResult {
    const requiredFields = [
        { key: 'name', label: 'Full Name' },
        { key: 'email', label: 'Email' },
        { key: 'avatar', label: 'Profile Photo' },
        { key: 'faculty', label: 'Faculty' },
        { key: 'year', label: 'Academic Year' },
        { key: 'studentId', label: 'Student ID' },
        { key: 'phone', label: 'Phone Number' },
        { key: 'bio', label: 'Bio' },
    ];

    const filledFields = requiredFields.filter(field => {
        const value = user[field.key as keyof User];
        return value !== null && value !== undefined && value !== '';
    });

    const missingFields = requiredFields
        .filter(field => {
            const value = user[field.key as keyof User];
            return value === null || value === undefined || value === '';
        })
        .map(field => field.label);

    const percentage = Math.round((filledFields.length / requiredFields.length) * 100);
    const isComplete = percentage === 100;

    return {
        percentage,
        isComplete,
        missingFields,
        requiredFields: requiredFields.map(f => f.label),
    };
}

/**
 * Calculate completion for admin profiles
 * Required fields: name, email, avatar, department, position, phone
 */
function calculateAdminCompletion(user: Partial<User>): ProfileCompletionResult {
    const requiredFields = [
        { key: 'name', label: 'Full Name' },
        { key: 'email', label: 'Email' },
        { key: 'avatar', label: 'Profile Photo' },
        { key: 'department', label: 'Department' },
        { key: 'position', label: 'Position/Title' },
        { key: 'phone', label: 'Phone Number' },
    ];

    const filledFields = requiredFields.filter(field => {
        const value = user[field.key as keyof User];
        return value !== null && value !== undefined && value !== '';
    });

    const missingFields = requiredFields
        .filter(field => {
            const value = user[field.key as keyof User];
            return value === null || value === undefined || value === '';
        })
        .map(field => field.label);

    const percentage = Math.round((filledFields.length / requiredFields.length) * 100);
    const isComplete = percentage === 100;

    return {
        percentage,
        isComplete,
        missingFields,
        requiredFields: requiredFields.map(f => f.label),
    };
}

/**
 * Get user-friendly field labels
 */
export function getFieldLabel(fieldKey: string): string {
    const labels: Record<string, string> = {
        name: 'Full Name',
        email: 'Email',
        avatar: 'Profile Photo',
        faculty: 'Faculty',
        year: 'Academic Year',
        studentId: 'Student ID',
        department: 'Department',
        position: 'Position/Title',
        phone: 'Phone Number',
        bio: 'Bio',
        linkedIn: 'LinkedIn',
        github: 'GitHub',
        twitter: 'Twitter',
        website: 'Website',
    };

    return labels[fieldKey] || fieldKey;
}
