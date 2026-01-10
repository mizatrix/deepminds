"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global error:", error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full text-center"
            >
                {/* Error Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/25"
                >
                    <AlertTriangle className="w-10 h-10 text-white" />
                </motion.div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                    Something went wrong
                </h1>

                {/* Description */}
                <p className="text-slate-600 dark:text-slate-400 mb-8">
                    We encountered an unexpected error. Don&apos;t worry, your data is safe.
                    Try refreshing the page or go back to the homepage.
                </p>

                {/* Error digest for debugging (dev only) */}
                {process.env.NODE_ENV === "development" && error.digest && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                        Error ID: {error.digest}
                    </p>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={reset}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Try Again
                    </motion.button>

                    <Link href="/">
                        <motion.span
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300"
                        >
                            <Home className="w-5 h-5" />
                            Go Home
                        </motion.span>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
