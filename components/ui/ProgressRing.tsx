"use client";

import { motion } from "framer-motion";

interface ProgressRingProps {
    progress: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    trackColor?: string;
    label?: string;
    subLabel?: string;
}

export default function ProgressRing({
    progress,
    size = 120,
    strokeWidth = 8,
    color = "text-purple-600",
    trackColor = "text-slate-100 dark:text-slate-800",
    label,
    subLabel
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="transform -rotate-90"
            >
                {/* Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className={trackColor}
                />
                {/* Progress */}
                <motion.circle
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    className={color}
                />
            </svg>
            {(label || subLabel) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    {label && (
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">
                            {label}
                        </span>
                    )}
                    {subLabel && (
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                            {subLabel}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
