"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
    className?: string;
}

/**
 * Base skeleton component with shimmer animation
 */
export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800",
                className
            )}
        />
    );
}

/**
 * Skeleton for stat cards on dashboard
 */
export function SkeletonStatCard() {
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>
        </div>
    );
}

/**
 * Skeleton for submission list items
 */
export function SkeletonSubmissionItem() {
    return (
        <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                        <Skeleton className="w-4 h-4 rounded-full" />
                        <Skeleton className="h-5 w-48" />
                    </div>
                    <Skeleton className="h-3 w-36" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="w-8 h-8 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

/**
 * Skeleton for profile page header section
 */
export function SkeletonProfileHeader() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl mb-8">
            {/* Cover */}
            <div className="h-32 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 animate-pulse" />

            {/* Avatar & Basic Info */}
            <div className="px-8 pb-8 -mt-16 relative">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                    {/* Avatar */}
                    <Skeleton className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-900" />

                    {/* Name & Role */}
                    <div className="flex-1 text-center md:text-left space-y-3">
                        <Skeleton className="h-10 w-64 mx-auto md:mx-0" />
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                    </div>

                    {/* Edit Button */}
                    <Skeleton className="h-12 w-36 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}

/**
 * Skeleton for profile info cards
 */
export function SkeletonProfileCard() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-lg">
            <div className="flex items-center gap-2 mb-6">
                <Skeleton className="w-6 h-6 rounded" />
                <Skeleton className="h-7 w-48" />
            </div>
            <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-5 w-full max-w-xs" />
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Complete skeleton for the entire profile page
 */
export function SkeletonProfilePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <SkeletonProfileHeader />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SkeletonProfileCard />
                    <div className="space-y-8">
                        <SkeletonProfileCard />
                        <SkeletonProfileCard />
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Skeleton for dashboard loading state
 */
export function SkeletonDashboard() {
    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <SkeletonStatCard key={i} />
                ))}
            </div>

            {/* Submissions List */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <Skeleton className="h-7 w-40 mb-4" />
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <SkeletonSubmissionItem key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}
