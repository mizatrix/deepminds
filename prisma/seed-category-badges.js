require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

// Use standard Prisma client (connects via DATABASE_URL)
const prisma = new PrismaClient();

// All category-specific badges + general badges
const badges = [
    // Category-specific badges (first approved submission in each category)
    {
        name: "Scientific Pioneer",
        description: "Get your first Scientific Research submission approved.",
        icon: "Zap",
        color: "blue",
        category: "SCIENTIFIC",
        triggerType: "category_count",
        triggerValue: 1
    },
    {
        name: "Artistic Soul",
        description: "Get your first Artistic Excellence submission approved.",
        icon: "Palette",
        color: "purple",
        category: "ARTISTIC",
        triggerType: "category_count",
        triggerValue: 1
    },
    {
        name: "Competition Champion",
        description: "Get your first Competition submission approved.",
        icon: "Trophy",
        color: "amber",
        category: "COMPETITION",
        triggerType: "category_count",
        triggerValue: 1
    },
    {
        name: "Hackathon Hero",
        description: "Get your first Hackathon submission approved.",
        icon: "Code",
        color: "green",
        category: "HACKATHONS",
        triggerType: "category_count",
        triggerValue: 1
    },
    {
        name: "Award Winner",
        description: "Get your first Award & Honors submission approved.",
        icon: "Award",
        color: "yellow",
        category: "AWARDS",
        triggerType: "category_count",
        triggerValue: 1
    },
    {
        name: "Sports Star",
        description: "Get your first Sports submission approved.",
        icon: "Dumbbell",
        color: "red",
        category: "SPORTS",
        triggerType: "category_count",
        triggerValue: 1
    },
    {
        name: "Intern Pro",
        description: "Get your first Internship submission approved.",
        icon: "Briefcase",
        color: "indigo",
        category: "INTERNSHIPS",
        triggerType: "category_count",
        triggerValue: 1
    },
    {
        name: "Community Helper",
        description: "Get your first Volunteering submission approved.",
        icon: "Heart",
        color: "teal",
        category: "VOLUNTEERING",
        triggerType: "category_count",
        triggerValue: 1
    },
    {
        name: "Entrepreneur",
        description: "Get your first Entrepreneurship submission approved.",
        icon: "Rocket",
        color: "violet",
        category: "ENTREPRENEURSHIP",
        triggerType: "category_count",
        triggerValue: 1
    },
    {
        name: "Global Explorer",
        description: "Get your first Global Exchange submission approved.",
        icon: "Globe",
        color: "sky",
        category: "GLOBAL EXCHANGE",
        triggerType: "category_count",
        triggerValue: 1
    },
    {
        name: "Lifelong Learner",
        description: "Get your first Special Training submission approved.",
        icon: "BookOpen",
        color: "emerald",
        category: "SPECIAL TRAINING",
        triggerType: "category_count",
        triggerValue: 1
    },
    {
        name: "Wildcard",
        description: "Get your first Other category submission approved.",
        icon: "Sparkles",
        color: "slate",
        category: "OTHER",
        triggerType: "category_count",
        triggerValue: 1
    },

    // General badges
    {
        name: "First Steps",
        description: "Submit your first achievement and get it approved.",
        icon: "Star",
        color: "purple",
        category: null,
        triggerType: "first_submission",
        triggerValue: 1
    },
    {
        name: "Point Master",
        description: "Accumulate 100 total points from approved achievements.",
        icon: "Medal",
        color: "amber",
        category: null,
        triggerType: "total_points",
        triggerValue: 100
    },
    {
        name: "Elite Scholar",
        description: "Accumulate 500 total points from approved achievements.",
        icon: "Trophy",
        color: "amber",
        category: null,
        triggerType: "total_points",
        triggerValue: 500
    }
];

async function main() {
    console.log('Start seeding category badges...\n');

    for (const badge of badges) {
        const existing = await prisma.badge.findUnique({
            where: { name: badge.name }
        });

        if (!existing) {
            await prisma.badge.create({
                data: badge
            });
            console.log(`✓ Created badge: ${badge.name}`);
        } else {
            console.log(`⊘ Badge already exists: ${badge.name}`);
        }
    }

    console.log('\n✅ Seeding finished. Total badges:', badges.length);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
