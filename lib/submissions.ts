// Submission and Audit Log Types
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

export interface AuditLog {
    id: string;
    timestamp: string;

    // Who performed the action
    userEmail: string;
    userName: string;
    userRole: 'ADMIN' | 'STUDENT' | 'GUEST';

    // What action was performed
    action: 'login' | 'logout' | 'submit' | 'approve' | 'reject' | 'delete' | 'view' | 'update';
    targetType: 'submission' | 'user' | 'system';
    targetId?: string;
    targetTitle?: string;
    details: string;

    // Location info
    ipAddress: string;
    city: string;
    country: string;

    // Device info
    userAgent: string;
    deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    browser: string;
    browserVersion: string;
    os: string;
}

// Legacy interface for backward compatibility
export interface LegacyAuditLog {
    id: string;
    timestamp: string;
    action: 'submit' | 'approve' | 'reject' | 'delete';
    performedBy: string;
    submissionId: string;
    submissionTitle: string;
    details: string;
}

// Storage Keys
const SUBMISSIONS_KEY = 'cs_excellence_submissions';
const AUDIT_LOGS_KEY = 'cs_excellence_audit_logs';

// Submission Management Functions
export function saveSubmission(submission: Submission): void {
    const submissions = getSubmissions();
    submissions.push(submission);
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
}

export function getSubmissions(): Submission[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(SUBMISSIONS_KEY);
    return data ? JSON.parse(data) : [];
}

export function getSubmissionById(id: string): Submission | undefined {
    const submissions = getSubmissions();
    return submissions.find(s => s.id === id);
}

export function updateSubmission(id: string, updates: Partial<Submission>): void {
    const submissions = getSubmissions();
    const index = submissions.findIndex(s => s.id === id);
    if (index !== -1) {
        submissions[index] = { ...submissions[index], ...updates };
        localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
    }
}

export function deleteSubmission(id: string): void {
    const submissions = getSubmissions();
    const filtered = submissions.filter(s => s.id !== id);
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(filtered));
}

export function getSubmissionsByStudent(email: string): Submission[] {
    const submissions = getSubmissions();
    return submissions.filter(s => s.studentEmail === email);
}

export function getSubmissionsByStatus(status: Submission['status']): Submission[] {
    const submissions = getSubmissions();
    return submissions.filter(s => s.status === status);
}

// Audit Log Functions
export function createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const auditLog: AuditLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        ...log
    };

    const logs = getAuditLogs();
    logs.push(auditLog);
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs));
}

export function getAuditLogs(): AuditLog[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(AUDIT_LOGS_KEY);
    return data ? JSON.parse(data) : [];
}

export function getAuditLogsBySubmission(submissionId: string): AuditLog[] {
    const logs = getAuditLogs();
    return logs.filter(log => log.targetId === submissionId && log.targetType === 'submission');
}

// Helper to generate unique IDs
export function generateSubmissionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
