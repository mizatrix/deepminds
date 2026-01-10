"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function StudentError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Student section error:", error);
    }, [error]);

    return (
        <div className="min-h-[50vh] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl"
            >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Dashboard Error
                </h2>

                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                    We couldn&apos;t load this page. This might be a temporary issue.
                </p>

                <div className="flex gap-3 justify-center">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={reset}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-xl"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                    </motion.button>

                    <Link href="/student/dashboard">
                        <motion.span
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </motion.span>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
