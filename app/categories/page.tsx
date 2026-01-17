"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ACHIEVEMENT_CATEGORIES } from "@/lib/categories";
import { getSubmissions } from "@/lib/actions/submissions";
import { ArrowRight, Users, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export default function CategoriesPage() {
    // State for category stats
    const [categoryStats, setCategoryStats] = useState(
        ACHIEVEMENT_CATEGORIES.map(category => ({
            ...category,
            studentCount: 0,
            achievementCount: 0,
            totalPoints: 0,
        }))
    );

    // Load data from database
    useEffect(() => {
        const loadData = async () => {
            const submissions = await getSubmissions();
            const approved = submissions.filter((s) => s.status === "approved");

            const stats = ACHIEVEMENT_CATEGORIES.map((category) => {
                const categorySubmissions = approved.filter((s) => s.category === category.id);
                const uniqueStudents = new Set(categorySubmissions.map((s) => s.studentEmail)).size;
                const totalPoints = categorySubmissions.reduce((sum, s) => sum + (s.points || 0), 0);

                return {
                    ...category,
                    studentCount: uniqueStudents,
                    achievementCount: categorySubmissions.length,
                    totalPoints,
                };
            });
            setCategoryStats(stats);
        };
        loadData();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
            {/* Hero */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/10" />
                <div className="container mx-auto px-4 py-20 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl"
                    >
                        <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
                            Achievement Categories
                        </h1>
                        <p className="text-xl text-white/90 mb-8">
                            Explore student achievements across different categories. Click any category to see top achievers and their accomplishments.
                        </p>
                        <div className="flex flex-wrap gap-6 text-white/90">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-5 h-5" />
                                <span className="font-bold">
                                    {categoryStats.reduce((sum, c) => sum + c.achievementCount, 0)}
                                </span>
                                <span>Total Achievements</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                <span className="font-bold">
                                    {categoryStats.reduce((sum, c) => sum + c.studentCount, 0)}
                                </span>
                                <span>Active Students</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categoryStats.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link
                                href={`/categories/${category.id}`}
                                className="group block relative bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                            >
                                {/* Header with Gradient */}
                                <div className={cn("relative h-32 bg-gradient-to-br", category.gradient, "flex items-center justify-center")}>
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                                    <div className="text-6xl relative z-10">{category.icon}</div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {category.name}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">
                                        {category.description}
                                    </p>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                                {category.studentCount}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                                Students
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                                                {category.achievementCount}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                                Achievements
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                                                {category.totalPoints}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                                Points
                                            </div>
                                        </div>
                                    </div>

                                    {/* View Button */}
                                    <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 font-bold group-hover:translate-x-2 transition-transform">
                                        <span>View Achievers</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
