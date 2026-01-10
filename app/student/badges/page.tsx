"use client";

import { motion } from "framer-motion";
import {
    Trophy,
    Star,
    Zap,
    Target,
    Medal,
    CheckCircle2,
    Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";

// Badge definitions (will be earned through achievements)
// In production, badges will be fetched from the database based on user progress
const allBadges: {
    id: number;
    name: string;
    description: string;
    icon: typeof Star;
    color: string;
    earned: boolean;
    progress: number;
}[] = [];

// Show empty state when no badges earned
const displayBadges = allBadges;

export default function StudentBadgesPage() {
    return (
        <div className="container mx-auto px-4 py-12 min-h-screen">
            <div className="text-center mb-16 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-widest shadow-lg shadow-amber-500/10">
                    <Trophy className="w-4 h-4" />
                    Hall of Fame
                </div>
                <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                    Your Badge Collection
                </h1>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                    Unlock exclusive badges by participating, excelling, and leading in your academic journey.
                </p>
            </div>

            {displayBadges.length === 0 ? (
                <EmptyState
                    variant="badges"
                    title="No Badges Yet"
                    description="Earn your first badge by participating in activities, competitions, and submitting achievements!"
                    actionLabel="Browse Categories"
                    actionHref="/categories"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayBadges.map((badge, i) => (
                        <motion.div
                            key={badge.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={cn(
                                "relative p-8 rounded-[2.5rem] border transition-all duration-300 overflow-hidden group hover:-translate-y-2",
                                badge.earned
                                    ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl"
                                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100"
                            )}
                        >
                            {/* Background Glow */}
                            {badge.earned && (
                                <div className={cn("absolute top-0 right-0 w-64 h-64 bg-gradient-to-br opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2",
                                    badge.color === "amber" && "from-amber-400 to-orange-500",
                                    badge.color === "blue" && "from-blue-400 to-cyan-500",
                                    badge.color === "emerald" && "from-emerald-400 to-green-500",
                                    badge.color === "purple" && "from-purple-400 to-indigo-500",
                                    badge.color === "red" && "from-red-400 to-rose-500",
                                )} />
                            )}

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={cn(
                                        "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                                        badge.earned
                                            ? cn(
                                                badge.color === "amber" && "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
                                                badge.color === "blue" && "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
                                                badge.color === "emerald" && "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
                                                badge.color === "purple" && "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
                                                badge.color === "red" && "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
                                            )
                                            : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                                    )}>
                                        {badge.earned ? <badge.icon className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
                                    </div>
                                    {badge.earned ? (
                                        <div className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Unlocked
                                        </div>
                                    ) : (
                                        <div className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                            {badge.progress}%
                                        </div>
                                    )}
                                </div>

                                <h3 className={cn("text-2xl font-black mb-2", badge.earned ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400")}>
                                    {badge.name}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                    {badge.description}
                                </p>

                                {/* Progress Bar for Locked */}
                                {!badge.earned && (
                                    <div className="mt-6 h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-slate-400 rounded-full transition-all duration-1000"
                                            style={{ width: `${badge.progress}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
