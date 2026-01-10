"use client";

import { useEffect, useState } from "react";

/**
 * Skip to content link for keyboard users.
 * Hidden by default, becomes visible on focus.
 */
export default function SkipLink() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <a
            href="#main-content"
            className="fixed top-4 left-4 z-[100] -translate-y-[150%] focus:translate-y-0 bg-white dark:bg-purple-900 border-2 border-purple-600 text-purple-900 dark:text-white px-6 py-3 rounded-lg font-bold shadow-xl transition-transform duration-200"
        >
            Skip to main content
        </a>
    );
}
