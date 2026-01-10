"use client";

import { motion } from "framer-motion";
import { ExternalLink, Calendar, MapPin, Building2, Trophy, Eye } from "lucide-react";
import { Submission } from "@/lib/submissions";
import { cn } from "@/lib/utils";

interface AchievementGalleryCardProps {
    achievement: Submission;
    onView: () => void;
}

export default function AchievementGalleryCard({ achievement, onView }: AchievementGalleryCardProps) {
    const categoryColors = {
        SCIENTIFIC: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
        ARTISTIC: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
        COMPETITION: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        SPORTS: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
        DEFAULT: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
    };

    const colorClass = categoryColors[achievement.category as keyof typeof categoryColors] || categoryColors.DEFAULT;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -5 }}
            className="group relative bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
        >
            {/* Image/Evidence Preview */}
            <div className="h-48 bg-slate-100 dark:bg-slate-950/50 relative overflow-hidden">
                {achievement.evidenceFileType?.startsWith('image/') ? (
                    <img
                        src={achievement.evidenceUrl}
                        alt={achievement.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-950">
                        <Trophy className="w-16 h-16 text-slate-300 dark:text-slate-700" />
                    </div>
                )}

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                    <button
                        onClick={onView}
                        className="p-3 bg-white/90 text-slate-900 rounded-full hover:scale-110 transition-transform shadow-lg"
                        title="View Details"
                    >
                        <Eye className="w-5 h-5" />
                    </button>
                    {achievement.evidenceUrl && achievement.evidenceUrl !== 'No evidence uploaded' && (
                        <a
                            href={achievement.evidenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-white/90 text-slate-900 rounded-full hover:scale-110 transition-transform shadow-lg"
                            title="View Evidence"
                        >
                            <ExternalLink className="w-5 h-5" />
                        </a>
                    )}
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                    <span className={cn("px-3 py-1 rounded-full text-xs font-bold border shadow-sm backdrop-blur-md", colorClass)}>
                        {achievement.category}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2" title={achievement.title}>
                    {achievement.title}
                </h3>

                <div className="space-y-3 mt-auto">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Building2 className="w-4 h-4 text-purple-500" />
                        <span className="truncate">{achievement.orgName}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <MapPin className="w-4 h-4 text-rose-500" />
                        <span className="truncate">{achievement.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>{new Date(achievement.achievementDate).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Points Badge */}
                {achievement.points && (
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                            <Trophy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                                +{achievement.points} Points
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
