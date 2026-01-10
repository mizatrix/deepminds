"use client";

import { motion } from "framer-motion";
import {
    BarChart3,
    Trophy,
    Star,
    Target,
    Zap,
    TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
                { label: "Recognition Points", value: "2,450", icon: Trophy, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
                { label: "Global Rank", value: "#14", icon: Target, shadow: "shadow-blue-500/20", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
                { label: "Badges Earned", value: "8", icon: Star, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
                { label: "Active Streak", value: "12 Days", icon: Zap, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
            ].map((stat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 p-6 rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-300 group"
                >
                    <div className="flex items-center gap-4">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-lg", stat.bg)}>
                            <stat.icon className={cn("w-7 h-7", stat.color)} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-none">{stat.value}</h3>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> +15% this month
                        </span>
                        <div className="h-1.5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                                style={{ width: i === 0 ? "70%" : i === 1 ? "40%" : "85%" }}
                            />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
