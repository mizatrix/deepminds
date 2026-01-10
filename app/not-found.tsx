"use client";

import { motion } from "framer-motion";
import { Search, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-lg w-full text-center"
            >
                {/* 404 Number with Gradient */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="mb-6"
                >
                    <span className="text-[120px] sm:text-[160px] font-black leading-none bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                        404
                    </span>
                </motion.div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
                    Page not found
                </h1>

                {/* Description */}
                <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    Try searching or go back to the homepage.
                </p>

                {/* Search Suggestion */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm text-slate-500 dark:text-slate-400">
                        <Search className="w-4 h-4" />
                        <span>Press</span>
                        <kbd className="px-2 py-0.5 bg-white dark:bg-slate-700 rounded text-xs font-mono">
                            ⌘K
                        </kbd>
                        <span>to search</span>
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/">
                        <motion.span
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300"
                        >
                            <Home className="w-5 h-5" />
                            Go Home
                        </motion.span>
                    </Link>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go Back
                    </motion.button>
                </div>

                {/* Decorative Elements */}
                <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
                </div>
            </motion.div>
        </div>
    );
}
