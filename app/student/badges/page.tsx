"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Trophy,
    Star,
    Zap,
    Target,
    Medal,
    CheckCircle2,
    Lock,
    Sparkles,
    Award,
    Globe,
    Briefcase,
    Heart,
    Rocket,
    BookOpen,
    Palette,
    Dumbbell,
    Code
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { getBadgeProgress, BadgeWithProgress } from "@/lib/actions/badges";
import { useSession } from "next-auth/react";

// Map icon names to Lucide icons
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Star,
    Zap,
    Target,
    Medal,
    Trophy,
    Award,
    Globe,
    Briefcase,
    Heart,
    Rocket,
    BookOpen,
    Palette,
    Dumbbell,
    Code,
    Sparkles,
};

// Map color names to Tailwind classes
const colorClasses: Record<string, { bg: string; text: string; glow: string }> = {
    amber: {
        bg: "bg-amber-100 dark:bg-amber-900/40",
        text: "text-amber-600 dark:text-amber-400",
        glow: "from-amber-400 to-orange-500"
    },
    blue: {
        bg: "bg-blue-100 dark:bg-blue-900/40",
        text: "text-blue-600 dark:text-blue-400",
        glow: "from-blue-400 to-cyan-500"
    },
    emerald: {
        bg: "bg-emerald-100 dark:bg-emerald-900/40",
        text: "text-emerald-600 dark:text-emerald-400",
        glow: "from-emerald-400 to-green-500"
    },
    purple: {
        bg: "bg-purple-100 dark:bg-purple-900/40",
        text: "text-purple-600 dark:text-purple-400",
        glow: "from-purple-400 to-indigo-500"
    },
    red: {
        bg: "bg-red-100 dark:bg-red-900/40",
        text: "text-red-600 dark:text-red-400",
        glow: "from-red-400 to-rose-500"
    },
    green: {
        bg: "bg-green-100 dark:bg-green-900/40",
        text: "text-green-600 dark:text-green-400",
        glow: "from-green-400 to-emerald-500"
    },
    indigo: {
        bg: "bg-indigo-100 dark:bg-indigo-900/40",
        text: "text-indigo-600 dark:text-indigo-400",
        glow: "from-indigo-400 to-blue-500"
    },
    teal: {
        bg: "bg-teal-100 dark:bg-teal-900/40",
        text: "text-teal-600 dark:text-teal-400",
        glow: "from-teal-400 to-cyan-500"
    },
    violet: {
        bg: "bg-violet-100 dark:bg-violet-900/40",
        text: "text-violet-600 dark:text-violet-400",
        glow: "from-violet-400 to-purple-500"
    },
    sky: {
        bg: "bg-sky-100 dark:bg-sky-900/40",
        text: "text-sky-600 dark:text-sky-400",
        glow: "from-sky-400 to-blue-500"
    },
    yellow: {
        bg: "bg-yellow-100 dark:bg-yellow-900/40",
        text: "text-yellow-600 dark:text-yellow-400",
        glow: "from-yellow-400 to-amber-500"
    },
    slate: {
        bg: "bg-slate-100 dark:bg-slate-900/40",
        text: "text-slate-600 dark:text-slate-400",
        glow: "from-slate-400 to-gray-500"
    },
};

export default function StudentBadgesPage() {
    const { data: session, status } = useSession();
    const [badges, setBadges] = useState<BadgeWithProgress[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadBadges() {
            if (session?.user?.email) {
                try {
                    const badgeData = await getBadgeProgress(session.user.email);
                    setBadges(badgeData);
                } catch (error) {
                    console.error("Failed to load badges:", error);
                }
            }
            setLoading(false);
        }

        if (status !== "loading") {
            loadBadges();
        }
    }, [session, status]);

    const earnedCount = badges.filter(b => b.earned).length;

    if (loading || status === "loading") {
        return (
            <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-500">Loading your badges...</p>
                </div>
            </div>
        );
    }

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
                {badges.length > 0 && (
                    <p className="text-lg text-purple-600 dark:text-purple-400 font-semibold">
                        {earnedCount} of {badges.length} badges earned
                    </p>
                )}
            </div>

            {badges.length === 0 ? (
                <EmptyState
                    variant="badges"
                    title="No Badges Available"
                    description="Badge definitions haven't been set up yet. Check back soon!"
                    actionLabel="Browse Categories"
                    actionHref="/categories"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {badges.map((badge, i) => {
                        const IconComponent = iconMap[badge.icon] || Star;
                        const colors = colorClasses[badge.color] || colorClasses.purple;

                        return (
                            <motion.div
                                key={badge.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={cn(
                                    "relative p-8 rounded-[2.5rem] border transition-all duration-300 overflow-hidden group hover:-translate-y-2",
                                    badge.earned
                                        ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl"
                                        : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100"
                                )}
                            >
                                {/* Background Glow */}
                                {badge.earned && (
                                    <div className={cn(
                                        "absolute top-0 right-0 w-64 h-64 bg-gradient-to-br opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2",
                                        colors.glow
                                    )} />
                                )}

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={cn(
                                            "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                                            badge.earned
                                                ? cn(colors.bg, colors.text)
                                                : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                                        )}>
                                            {badge.earned ? <IconComponent className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
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

                                    {/* Category Tag */}
                                    {badge.category && (
                                        <div className="mt-4">
                                            <span className={cn(
                                                "px-2 py-1 rounded-md text-xs font-medium",
                                                badge.earned
                                                    ? cn(colors.bg, colors.text)
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                            )}>
                                                {badge.category}
                                            </span>
                                        </div>
                                    )}

                                    {/* Progress Bar for Locked */}
                                    {!badge.earned && (
                                        <div className="mt-6 h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full rounded-full transition-all duration-1000", colors.bg.replace("bg-", "bg-").replace("-100", "-500"))}
                                                style={{ width: `${badge.progress}%` }}
                                            />
                                        </div>
                                    )}

                                    {/* Earned Date */}
                                    {badge.earned && badge.earnedAt && (
                                        <p className="mt-4 text-xs text-slate-400">
                                            Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
