// Points calculation for achievements
// All achievements are worth exactly 100 points

export const CATEGORY_POINTS = {
    SCIENTIFIC: 100,
    ARTISTIC: 100,
    'SPECIAL TRAINING': 100,
    COMPETITION: 100,
    HACKATHONS: 100,
    AWARDS: 100,
    SPORTS: 100,
    INTERNSHIPS: 100,
    VOLUNTEERING: 100,
    ENTREPRENEURSHIP: 100,
    'GLOBAL EXCHANGE': 100,
    OTHER: 100,
} as const;

export function calculateSubmissionPoints(
    category: string,
    hasEvidence: boolean,
    isExceptional: boolean = false
): number {
    // All achievements are worth exactly 100 points
    return 100;
}
