import { z } from 'zod';

/**
 * Password validation schema
 * Requirements: minimum 12 characters, at least one special character
 */
export const passwordSchema = z
    .string()
    .min(12, 'Password must be at least 12 characters long')
    .regex(
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
        'Password must contain at least one special character'
    );

/**
 * Email validation schema
 */
export const emailSchema = z.string().email('Invalid email address');

/**
 * Registration form validation schema
 */
export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
});

/**
 * Change password validation schema
 */
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

/**
 * Check password strength
 */
export function checkPasswordStrength(password: string): {
    score: number;
    feedback: string[];
} {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 12) {
        score += 25;
    } else {
        feedback.push('Use at least 12 characters');
    }

    if (password.length >= 16) {
        score += 10;
    }

    // Special characters
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        score += 25;
    } else {
        feedback.push('Include at least one special character');
    }

    // Numbers
    if (/\d/.test(password)) {
        score += 20;
    } else {
        feedback.push('Include at least one number');
    }

    // Lowercase
    if (/[a-z]/.test(password)) {
        score += 10;
    } else {
        feedback.push('Include lowercase letters');
    }

    // Uppercase
    if (/[A-Z]/.test(password)) {
        score += 10;
    } else {
        feedback.push('Include uppercase letters');
    }

    return { score, feedback };
}
