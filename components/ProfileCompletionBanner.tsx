"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, ArrowRight } from "lucide-react";
import Link from "next/link";

interface CompletionData {
    percentage: number;
    isComplete: boolean;
    missingFields: string[];
}

export default function ProfileCompletionBanner() {
    const [completion, setCompletion] = useState<CompletionData | null>(null);
    const [isDismissed, setIsDismissed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if banner was dismissed in this session
        const dismissed = sessionStorage.getItem("profileBannerDismissed");
        if (dismissed === "true") {
            setIsDismissed(true);
            setLoading(false);
            return;
        }

        fetchCompletion();
    }, []);

    const fetchCompletion = async () => {
        try {
            const res = await fetch("/api/profile");
            const data = await res.json();
            setCompletion(data.completion);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch profile completion:", error);
            setLoading(false);
        }
    };

    const handleDismiss = () => {
        setIsDismissed(true);
        sessionStorage.setItem("profileBannerDismissed", "true");
    };

    if (loading || !completion || completion.isComplete || isDismissed) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="mb-8"
            >
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                                Complete Your Profile ({completion.percentage}%)
                            </h3>

                            {/* Progress Bar */}
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-3">
                                <motion.div
                                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-2.5 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${completion.percentage}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                            </div>

                            {/* Missing Fields */}
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                <span className="font-bold">Missing:</span>{" "}
                                {completion.missingFields?.length > 0
                                    ? completion.missingFields.join(", ")
                                    : "None"}
                            </p>

                            {/* Action Button */}
                            <Link
                                href="/profile"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all group"
                            >
                                Complete Now
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {/* Dismiss Button */}
                        <button
                            onClick={handleDismiss}
                            className="flex-shrink-0 p-2 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg transition-colors"
                            aria-label="Dismiss"
                        >
                            <X className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
