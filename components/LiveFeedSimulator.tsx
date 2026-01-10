"use client";

import { useEffect } from "react";
import { useToast } from "@/lib/ToastContext";

export default function LiveFeedSimulator() {
    const { showToast } = useToast();

    useEffect(() => {
        const events = [
            // Achievements
            "🏆 Ahmed M. just earned 'Top Coder' badge!",
            "📄 Sarah K. submitted 'AI Research Paper' in Scientific",
            "⭐ Omar A. reached Level 5!",
            "🎨 Laila H. won 1st Place in Art Exhibition",

            // Campus Life
            "📢 New Hackathon 'CodeRed' registration open!",
            "⚽ Sports Team just won the regional finals!",
            "📚 Library: New specialized journals available",
            "🚌 Shuttle Bus schedule updated for exams",

            // System
            "🚀 System Update: Dark Mode is now smoother",
            "💡 Tip: Use AI Assist to write your submissions",
            "🎓 Graduation Ceremony dates announced"
        ];

        const interval = setInterval(() => {
            // 30% chance to trigger an event every 5 seconds
            if (Math.random() > 0.7) {
                const randomEvent = events[Math.floor(Math.random() * events.length)];
                // Cycle through types to be colorful
                const types = ["info", "success", "warning"] as const;
                const randomType = types[Math.floor(Math.random() * types.length)];

                showToast(randomEvent, randomType);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [showToast]);

    return null; // Renderless component
}
