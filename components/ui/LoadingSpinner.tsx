"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

/**
 * Gradient loading spinner with purple/blue theme
 */
export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12",
    };

    return (
        <div className={cn("relative", sizeClasses[size], className)}>
            <div className="absolute inset-0 rounded-full border-2 border-slate-200 dark:border-slate-700" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-600 border-r-blue-600 animate-spin" />
        </div>
    );
}

interface InlineSpinnerProps {
    className?: string;
}

/**
 * Small inline spinner for buttons and inline loading states
 */
export function InlineSpinner({ className }: InlineSpinnerProps) {
    return (
        <div className={cn("w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin", className)} />
    );
}

interface FullPageLoaderProps {
    message?: string;
}

/**
 * Full page centered loader with optional message
 */
export function FullPageLoader({ message }: FullPageLoaderProps) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
            <div className="relative">
                {/* Outer glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 blur-xl opacity-30 animate-pulse" />

                {/* Spinner */}
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 border-r-blue-600 animate-spin" />
                </div>
            </div>

            {message && (
                <p className="mt-6 text-sm text-slate-600 dark:text-slate-400 animate-pulse">
                    {message}
                </p>
            )}
        </div>
    );
}

interface ButtonLoaderProps {
    isLoading: boolean;
    children: React.ReactNode;
}

/**
 * Button content wrapper that shows spinner when loading
 */
export function ButtonLoader({ isLoading, children }: ButtonLoaderProps) {
    return (
        <>
            {isLoading && <InlineSpinner className="mr-2" />}
            {children}
        </>
    );
}
