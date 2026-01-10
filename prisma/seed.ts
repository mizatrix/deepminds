import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({});

async function main() {
    console.log('🌱 Seeding database...');

    // Hash passwords at runtime
    const superAdminPassword = bcrypt.hashSync('SuperAdmin@123456!', 10);

    // Create super admin user
    const superAdmin = await prisma.user.upsert({
        where: { email: 'superadmin@example.com' },
        update: {
            // Update password if user exists (in case hash was wrong)
            password: superAdminPassword,
            role: 'SUPER_ADMIN',
        },
        create: {
            email: 'superadmin@example.com',
            name: 'Super Admin',
            password: superAdminPassword,
            role: 'SUPER_ADMIN',
            emailVerified: true,
            department: 'System Administration',
            position: 'System Administrator',
        },
    });

    console.log('✅ Created super admin user:', superAdmin.email);

    // Create admin user
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            password: '$2b$10$xVYGGLawurGkOgJ4NXRdJummm1OTUQLpoP/N3BHrU6UYEXBEoR.T2', // Admin@123456!
            role: 'ADMIN',
            emailVerified: true,
            department: 'Computer Science',
            position: 'Department Head',
        },
    });

    console.log('✅ Created admin user:', admin.email);

    // Create student user
    const student = await prisma.user.upsert({
        where: { email: 'student@example.com' },
        update: {},
        create: {
            email: 'student@example.com',
            name: 'Ahmed Hassan',
            password: '$2b$10$BVqPHcdhYSYcO1CxAtK2.usTcmV6JOxFrMokHj6Dd3ZIAF5EFS92m', // Student@123456!
            role: 'STUDENT',
            emailVerified: true,
            faculty: 'Computer Science',
            year: '4th Year',
            studentId: 'CS2024001',
        },
    });

    console.log('✅ Created student user:', student.email);

    // Create sample submissions
    const submissions = [
        {
            studentEmail: 'student@example.com',
            studentName: 'Ahmed Hassan',
            title: 'First Place in National Coding Competition',
            category: 'competition',
            orgName: 'Egyptian Ministry of Technology',
            location: 'Cairo, Egypt',
            achievementDate: '2025-12-15',
            description: 'Won first place in the National Collegiate Programming Competition, competing against 200+ teams from universities across Egypt.',
            evidenceUrl: '/uploads/sample-certificate.pdf',
            status: 'APPROVED',
            points: 100,
            reviewedBy: 'admin@example.com',
            reviewedAt: new Date('2025-12-20'),
            adminFeedback: 'Excellent achievement! This brings great recognition to our department.',
        },
        {
            studentEmail: 'student@example.com',
            studentName: 'Ahmed Hassan',
            title: 'Published Research Paper on Machine Learning',
            category: 'publication',
            orgName: 'IEEE Conference on AI',
            location: 'Dubai, UAE',
            achievementDate: '2025-11-10',
            description: 'Co-authored a research paper on "Deep Learning Approaches for Arabic NLP" which was accepted and presented at the IEEE International Conference.',
            evidenceUrl: '/uploads/sample-paper.pdf',
            status: 'APPROVED',
            points: 80,
            reviewedBy: 'admin@example.com',
            reviewedAt: new Date('2025-11-15'),
            adminFeedback: 'Great research contribution!',
        },
        {
            studentEmail: 'student@example.com',
            studentName: 'Ahmed Hassan',
            title: 'Volunteer Teaching at Community Center',
            category: 'volunteer',
            orgName: 'Cairo Community Center',
            location: 'Cairo, Egypt',
            achievementDate: '2025-10-05',
            description: 'Volunteered to teach basic programming skills to underprivileged youth for 3 months.',
            evidenceUrl: '/uploads/sample-volunteer.jpg',
            status: 'PENDING',
        },
    ];

    for (const sub of submissions) {
        await prisma.submission.upsert({
            where: { id: `seed_${sub.title.slice(0, 20).replace(/\s/g, '_')}` },
            update: {},
            create: {
                id: `seed_${sub.title.slice(0, 20).replace(/\s/g, '_')}`,
                ...sub,
            },
        });
    }

    console.log('✅ Created sample submissions:', submissions.length);

    // Create sample audit logs
    const auditLogs = [
        {
            action: 'submit',
            performedBy: 'student@example.com',
            performedByName: 'Ahmed Hassan',
            submissionId: 'seed_First_Place_in_Nati',
            submissionTitle: 'First Place in National Coding Competition',
            details: 'Submitted achievement for review',
        },
        {
            action: 'approve',
            performedBy: 'admin@example.com',
            performedByName: 'Admin User',
            submissionId: 'seed_First_Place_in_Nati',
            submissionTitle: 'First Place in National Coding Competition',
            details: 'Approved with 100 points',
        },
    ];

    for (const log of auditLogs) {
        await prisma.auditLog.create({
            data: log,
        });
    }

    console.log('✅ Created sample audit logs:', auditLogs.length);

    console.log('🎉 Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

