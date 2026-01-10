// Points calculation for achievements

export const CATEGORY_POINTS = {
    SCIENTIFIC: 100,
    ARTISTIC: 80,
    'SPECIAL TRAINING': 85,
    COMPETITION: 150,
    HACKATHONS: 120,
    AWARDS: 200,
    SPORTS: 90,
    INTERNSHIPS: 110,
    VOLUNTEERING: 70,
    ENTREPRENEURSHIP: 130,
    'GLOBAL EXCHANGE': 140,
    OTHER: 50,
} as const;

export function calculateSubmissionPoints(
    category: string,
    hasEvidence: boolean,
    isExceptional: boolean = false
): number {
    let basePoints = CATEGORY_POINTS[category as keyof typeof CATEGORY_POINTS] || 50;

    // Bonus for evidence
    if (hasEvidence) {
        basePoints *= 1.05; // +5%
    }

    // Bonus for exceptional achievements
    if (isExceptional) {
        basePoints *= 1.20; // +20%
    }

    return Math.round(basePoints);
}
