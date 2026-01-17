"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, SortAsc, LayoutGrid, List, Share2, Trophy } from "lucide-react";
import { getSubmissionsByStudent } from "@/lib/actions/submissions";
import { type Submission } from "@/lib/submissions";
import AchievementGalleryCard from "@/components/portfolio/AchievementGalleryCard";
import ShareModal from "@/components/portfolio/ShareModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonDashboard } from "@/components/ui/Skeleton";

export default function PortfolioPage() {
    const { data: session } = useSession();
    const [achievements, setAchievements] = useState<Submission[]>([]);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [filter, setFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<"date" | "points" | "title">("date");
    const [isLoading, setIsLoading] = useState(true);
    const [showShareModal, setShowShareModal] = useState(false);
    const [studentName, setStudentName] = useState("Student");
    const [selectedAchievement, setSelectedAchievement] = useState<Submission | null>(null);

    useEffect(() => {
        if (session?.user?.email) {
            loadAchievements();
        }
        if (session?.user?.name) {
            setStudentName(session.user.name);
        }
    }, [session?.user?.email, session?.user?.name]);

    const loadAchievements = async () => {
        setIsLoading(true);
        try {
            const userEmail = session?.user?.email;
            if (userEmail) {
                const submissions = await getSubmissionsByStudent(userEmail);
                // Only show approved achievements in portfolio
                const approved = submissions.filter(s => s.status === 'approved');
                setAchievements(approved);
            }
        } catch (error) {
            console.error('Error loading achievements:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const categories = Array.from(new Set(achievements.map(a => a.category)));

    const filtered = achievements
        .filter(a => {
            const matchesFilter = filter === "ALL" || a.category === filter;
            const matchesSearch =
                a.title.toLowerCase().includes(search.toLowerCase()) ||
                a.orgName.toLowerCase().includes(search.toLowerCase());
            return matchesFilter && matchesSearch;
        })
        .sort((a, b) => {
            if (sortBy === 'date') return new Date(b.achievementDate).getTime() - new Date(a.achievementDate).getTime();
            if (sortBy === 'points') return (b.points || 0) - (a.points || 0);
            return a.title.localeCompare(b.title);
        });

    const totalPoints = achievements.reduce((sum, a) => sum + (a.points || 0), 0);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 space-y-8">
                <SkeletonDashboard />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black mb-2">
                        <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            My Portfolio
                        </span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">
                        Showcase your verified academic and extracurricular achievements.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                        <span className="font-bold text-amber-900 dark:text-amber-100">{totalPoints} Points</span>
                    </div>
                    <button
                        onClick={() => setShowShareModal(true)}
                        className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <Share2 className="w-4 h-4" />
                        Share Portfolio
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between sticky top-4 z-30">
                <div className="flex items-center gap-2 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search achievements..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-950 border-none rounded-xl focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-950 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                viewMode === 'grid' ? "bg-white dark:bg-slate-800 shadow-sm text-purple-600" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                viewMode === 'list' ? "bg-white dark:bg-slate-800 shadow-sm text-purple-600" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-950 rounded-xl">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-transparent border-none text-sm font-bold text-slate-700 dark:text-slate-300 focus:ring-0 cursor-pointer"
                        >
                            <option value="ALL">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-950 rounded-xl">
                        <SortAsc className="w-4 h-4 text-slate-400" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="bg-transparent border-none text-sm font-bold text-slate-700 dark:text-slate-300 focus:ring-0 cursor-pointer"
                        >
                            <option value="date">Most Recent</option>
                            <option value="points">Highest Points</option>
                            <option value="title">Alphabetical</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Gallery Grid */}
            {filtered.length === 0 ? (
                <EmptyState
                    variant="certificates"
                    title="No Achievements Found"
                    description={search || filter !== 'ALL'
                        ? "No achievements match your filters. Try adjusting your search criteria."
                        : "You haven't earned any achievements yet. Submit your first activity to start building your portfolio!"
                    }
                    actionLabel={search || filter !== 'ALL' ? "Clear Filters" : "Submit Achievement"}
                    actionHref={search || filter !== 'ALL' ? undefined : "/"}
                    onAction={search || filter !== 'ALL' ? () => { setSearch(""); setFilter("ALL"); } : undefined}
                />
            ) : (
                <div className={cn(
                    "grid gap-6 transition-all",
                    viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                )}>
                    <AnimatePresence mode="popLayout">
                        {filtered.map((achievement) => (
                            <AchievementGalleryCard
                                key={achievement.id}
                                achievement={achievement}
                                onView={() => setSelectedAchievement(achievement)}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Share Modal */}
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                studentName={studentName}
            />

            {/* Details Modal (reusing the one from Dashboard or creating a quick view) */}
            {selectedAchievement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-8 space-y-6"
                    >
                        {/* Simple Detail View - duplicate of dashboard modal logic for speed */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedAchievement.title}</h2>
                                <p className="text-slate-500">{selectedAchievement.category}</p>
                            </div>
                            <button onClick={() => setSelectedAchievement(null)} className="p-2 hover:bg-slate-100 rounded-full">
                                <span className="sr-only">Close</span>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="prose dark:prose-invert max-w-none">
                            <p>{selectedAchievement.description}</p>
                        </div>

                        {selectedAchievement.evidenceUrl && selectedAchievement.evidenceUrl !== 'No evidence uploaded' && (
                            <img
                                src={selectedAchievement.evidenceUrl}
                                alt="Evidence"
                                className="w-full h-64 object-cover rounded-xl bg-slate-100"
                            />
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
}

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}
