"use client";

import { cn } from "@/lib/utils";
import { LucideIcon, FileText, Award, Trophy, Rocket, Plus } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
    variant?: "default" | "submissions" | "badges" | "certificates";
    className?: string;
}

const variantConfig = {
    default: {
        icon: FileText,
        gradientFrom: "from-purple-500",
        gradientTo: "to-blue-500",
        bgGlow: "bg-purple-500/10",
    },
    submissions: {
        icon: Rocket,
        gradientFrom: "from-purple-600",
        gradientTo: "to-blue-600",
        bgGlow: "bg-purple-500/10",
    },
    badges: {
        icon: Trophy,
        gradientFrom: "from-amber-500",
        gradientTo: "to-orange-500",
        bgGlow: "bg-amber-500/10",
    },
    certificates: {
        icon: Award,
        gradientFrom: "from-blue-500",
        gradientTo: "to-cyan-500",
        bgGlow: "bg-blue-500/10",
    },
};

export function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
    variant = "default",
    className,
}: EmptyStateProps) {
    const config = variantConfig[variant];
    const Icon = icon || config.icon;

    return (
        <div
            className={cn(
                "relative flex flex-col items-center justify-center py-16 px-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden",
                className
            )}
        >
            {/* Background Glow */}
            <div
                className={cn(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl opacity-50 dark:opacity-30",
                    config.bgGlow
                )}
            />

            {/* Decorative rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 rounded-full border border-slate-200 dark:border-slate-800 opacity-50" />
                <div className="absolute w-64 h-64 rounded-full border border-slate-200 dark:border-slate-800 opacity-30" />
                <div className="absolute w-80 h-80 rounded-full border border-slate-200 dark:border-slate-800 opacity-20" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
                {/* Icon Container */}
                <div
                    className={cn(
                        "w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-2xl bg-gradient-to-br",
                        config.gradientFrom,
                        config.gradientTo
                    )}
                >
                    <Icon className="w-10 h-10 text-white" />
                </div>

                {/* Text */}
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                    {title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                    {description}
                </p>

                {/* Action Button */}
                {(actionLabel && (actionHref || onAction)) && (
                    actionHref ? (
                        <Link
                            href={actionHref}
                            className={cn(
                                "inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl bg-gradient-to-r",
                                config.gradientFrom,
                                config.gradientTo
                            )}
                        >
                            <Plus className="w-5 h-5" />
                            {actionLabel}
                        </Link>
                    ) : (
                        <button
                            onClick={onAction}
                            className={cn(
                                "inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl bg-gradient-to-r",
                                config.gradientFrom,
                                config.gradientTo
                            )}
                        >
                            <Plus className="w-5 h-5" />
                            {actionLabel}
                        </button>
                    )
                )}
            </div>
        </div>
    );
}
