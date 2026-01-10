require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const badges = [
    {
        name: "Early Adopter",
        description: "Joined the platform in its founding month.",
        icon: "Star",
        pointsRequired: 0
    },
    {
        name: "Scientific Pioneer",
        description: "Submit 5 achievements in the Scientific category.",
        icon: "Zap",
        pointsRequired: 50
    },
    {
        name: "Community Hero",
        description: "Complete 3 volunteering activities.",
        icon: "Target",
        pointsRequired: 30
    },
    {
        name: "Elite Scholar",
        description: "Reach the top 10% of the leaderboards.",
        icon: "Trophy",
        pointsRequired: 100
    },
    {
        name: "Achievement Hunter",
        description: "Submit your first achievement.",
        icon: "Medal",
        pointsRequired: 10
    }
];

async function main() {
    console.log('Start seeding badges...');

    for (const badge of badges) {
        const existing = await prisma.badge.findUnique({
            where: { name: badge.name }
        });

        if (!existing) {
            await prisma.badge.create({
                data: badge
            });
            console.log(`Created badge: ${badge.name}`);
        } else {
            console.log(`Badge already exists: ${badge.name}`);
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
