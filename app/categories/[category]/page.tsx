"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Trophy,
    Calendar,
    MapPin,
    Building2,
    ChevronLeft,
    ChevronRight,
    Award,
    Star,
} from "lucide-react";
import Link from "next/link";
import { getCategoryById } from "@/lib/categories";
import { getSubmissions } from "@/lib/submissions";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 9;

interface StudentAchievement {
    studentName: string;
    studentEmail: string;
    avatar: string;
    achievements: Array<{
        id: string;
        title: string;
        orgName: string;
        location: string;
        achievementDate: string;
        points: number;
    }>;
    totalPoints: number;
    achievementCount: number;
}

export default function CategoryPage() {
    const params = useParams();
    const categoryId = decodeURIComponent(params.category as string);
    const category = getCategoryById(categoryId);

    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<"points" | "recent">("points");

    // Get all approved submissions for this category
    const categoryData = useMemo(() => {
        const submissions = getSubmissions();
        const approvedInCategory = submissions.filter(
            (s) => s.status === "approved" && s.category === categoryId
        );

        // Group by student
        const studentMap = new Map<string, StudentAchievement>();

        approvedInCategory.forEach((submission) => {
            const existing = studentMap.get(submission.studentEmail);
            const achievement = {
                id: submission.id,
                title: submission.title,
                orgName: submission.orgName,
                location: submission.location,
                achievementDate: submission.achievementDate,
                points: submission.points || 0,
            };

            if (existing) {
                existing.achievements.push(achievement);
                existing.totalPoints += achievement.points;
                existing.achievementCount++;
            } else {
                studentMap.set(submission.studentEmail, {
                    studentName: submission.studentName,
                    studentEmail: submission.studentEmail,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${submission.studentName}`,
                    achievements: [achievement],
                    totalPoints: achievement.points,
                    achievementCount: 1,
                });
            }
        });

        return Array.from(studentMap.values());
    }, [categoryId]);

    // Sort students
    const sortedStudents = useMemo(() => {
        const sorted = [...categoryData];
        if (sortBy === "points") {
            sorted.sort((a, b) => b.totalPoints - a.totalPoints);
        } else {
            sorted.sort((a, b) => {
                const aLatest = new Date(
                    Math.max(...a.achievements.map((ach) => new Date(ach.achievementDate).getTime()))
                );
                const bLatest = new Date(
                    Math.max(...b.achievements.map((ach) => new Date(ach.achievementDate).getTime()))
                );
                return bLatest.getTime() - aLatest.getTime();
            });
        }
        return sorted;
    }, [categoryData, sortBy]);

    // Pagination
    const totalPages = Math.ceil(sortedStudents.length / ITEMS_PER_PAGE);
    const paginatedStudents = sortedStudents.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    if (!category) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Category Not Found</h1>
                <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
                    Go Back Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
            {/* Hero Section */}
            <div className={cn("relative overflow-hidden bg-gradient-to-br rounded-b-[3rem]", category.gradient, "text-white")}>
                {/* Animated Background */}
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-grid-white/10" />
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0"
                        animate={{
                            x: ['-100%', '100%'],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    />
                </div>

                <div className="container mx-auto px-4 py-24 relative z-10">
                    <motion.div
                        className="max-w-3xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <motion.div
                            className="text-7xl mb-6"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        >
                            {category.icon}
                        </motion.div>
                        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight drop-shadow-lg">
                            {category.name}
                        </h1>
                        <p className="text-xl md:text-2xl text-white/95 mb-10 leading-relaxed">
                            {category.description}
                        </p>

                        <motion.div
                            className="flex flex-wrap gap-8 text-white/95"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/20">
                                <Trophy className="w-6 h-6" />
                                <div>
                                    <div className="text-2xl font-black">{sortedStudents.length}</div>
                                    <div className="text-sm text-white/80">Students</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/20">
                                <Award className="w-6 h-6" />
                                <div>
                                    <div className="text-2xl font-black">
                                        {sortedStudents.reduce((sum, s) => sum + s.achievementCount, 0)}
                                    </div>
                                    <div className="text-sm text-white/80">Achievements</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/20">
                                <Star className="w-6 h-6" />
                                <div>
                                    <div className="text-2xl font-black">
                                        {sortedStudents.reduce((sum, s) => sum + s.totalPoints, 0)}
                                    </div>
                                    <div className="text-sm text-white/80">Total Points</div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-16">
                {/* Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Top Achievers
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400">
                            Showing {paginatedStudents.length} of {sortedStudents.length} students
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400 px-2">Sort by:</span>
                        <button
                            onClick={() => setSortBy("points")}
                            className={cn(
                                "px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
                                sortBy === "points"
                                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30"
                                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            )}
                        >
                            Points
                        </button>
                        <button
                            onClick={() => setSortBy("recent")}
                            className={cn(
                                "px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
                                sortBy === "recent"
                                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30"
                                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            )}
                        >
                            Recent
                        </button>
                    </div>
                </div>

                {/* Student Grid */}
                {paginatedStudents.length === 0 ? (
                    <motion.div
                        className="text-center py-32"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="text-8xl mb-6 animate-bounce">{category.icon}</div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
                            No achievements yet
                        </h3>
                        <p className="text-xl text-slate-500 dark:text-slate-400 mb-8">
                            Be the first to achieve in {category.name}!
                        </p>
                        <Link
                            href="/student/dashboard"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-blue-500/30 transition-all hover:-translate-y-1"
                        >
                            Submit Achievement
                            <ArrowLeft className="w-5 h-5 rotate-180" />
                        </Link>
                    </motion.div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {paginatedStudents.map((student, index) => (
                                <StudentCard
                                    key={student.studentEmail}
                                    student={student}
                                    index={index}
                                    categoryColor={category.color}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// Student Card Component
function StudentCard({
    student,
    index,
    categoryColor,
}: {
    student: StudentAchievement;
    index: number;
    categoryColor: string;
}) {
    const [expanded, setExpanded] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8 }}
            className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
        >
            {/* Rank Badge */}
            {index < 3 && (
                <motion.div
                    className="absolute top-4 right-4 z-10"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
                >
                    <div
                        className={cn(
                            "w-14 h-14 rounded-full flex items-center justify-center font-black text-lg text-white shadow-xl",
                            index === 0 && "bg-gradient-to-br from-yellow-400 to-amber-500 animate-pulse",
                            index === 1 && "bg-gradient-to-br from-slate-300 to-slate-400",
                            index === 2 && "bg-gradient-to-br from-amber-600 to-amber-700"
                        )}
                    >
                        #{index + 1}
                    </div>
                </motion.div>
            )}

            {/* Avatar Section */}
            <div className="relative h-56 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all duration-500" />
                <motion.img
                    src={student.avatar}
                    alt={student.studentName}
                    className="w-36 h-36 rounded-full border-4 border-white dark:border-slate-800 shadow-2xl relative z-10"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                />
            </div>

            {/* Content */}
            <div className="p-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 truncate">
                    {student.studentName}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 truncate">
                    {student.studentEmail}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                            {student.totalPoints}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                            Points
                        </div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                            {student.achievementCount}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                            Achievements
                        </div>
                    </div>
                </div>

                {/* Achievements List */}
                <div className="space-y-2">
                    {student.achievements.slice(0, expanded ? undefined : 2).map((achievement) => (
                        <div
                            key={achievement.id}
                            className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800"
                        >
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1 line-clamp-1">
                                {achievement.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <Building2 className="w-3 h-3" />
                                <span className="truncate">{achievement.orgName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                <Calendar className="w-3 h-3" />
                                <span>{achievement.achievementDate}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Show More Button */}
                {student.achievements.length > 2 && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="w-full mt-4 py-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                    >
                        {expanded ? "Show Less" : `Show ${student.achievements.length - 2} More`}
                    </button>
                )}
            </div>
        </motion.div>
    );
}

// Pagination Component
function Pagination({
    currentPage,
    totalPages,
    onPageChange,
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    const visiblePages = pages.filter(
        (page) =>
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1)
    );

    return (
        <div className="flex justify-center items-center gap-2">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            {visiblePages.map((page, index) => {
                const prevPage = visiblePages[index - 1];
                const showEllipsis = prevPage && page - prevPage > 1;

                return (
                    <div key={page} className="flex items-center gap-2">
                        {showEllipsis && (
                            <span className="text-slate-400 dark:text-slate-600">...</span>
                        )}
                        <button
                            onClick={() => onPageChange(page)}
                            className={cn(
                                "w-10 h-10 rounded-xl font-bold transition-all",
                                currentPage === page
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            )}
                        >
                            {page}
                        </button>
                    </div>
                );
            })}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
}
