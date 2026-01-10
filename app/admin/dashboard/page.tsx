"use client";

import Link from "next/link";
import ProfileCompletionBanner from "@/components/ProfileCompletionBanner";
import {
    Users,
    FileText,
    TrendingUp,
    Settings,
    Bell
} from "lucide-react";

const cards = [
    {
        title: "Review Submissions",
        description: "12 pending achievements waiting for approval.",
        href: "/admin/submissions",
        icon: FileText,
        color: "blue"
    },
    {
        title: "User Management",
        description: "Manage student accounts and roles.",
        href: "/admin/users",
        icon: Users,
        color: "emerald"
    },
    {
        title: "Analytics",
        description: "View platform growth and engagement stats.",
        href: "/admin/analytics",
        icon: TrendingUp,
        color: "amber"
    },
    {
        title: "Settings",
        description: "Configure system preferences.",
        href: "/admin/settings",
        icon: Settings,
        color: "slate"
    }
];

export default function AdminDashboardPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            {/* Profile Completion Banner */}
            <ProfileCompletionBanner />

            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Admin Console</h1>
                    <p className="text-slate-500 dark:text-slate-400">Welcome back, Admin. Here's what's happening today.</p>
                </div>
                <button className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:shadow-md transition-all relative">
                    <Bell className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                    <Link
                        key={card.title}
                        href={card.href}
                        className="group p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
                    >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors group-hover:scale-110 duration-300 bg-${card.color}-100 dark:bg-${card.color}-900/30 text-${card.color}-600 dark:text-${card.color}-400`}>
                            <card.icon className="w-7 h-7" />
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                            {card.title}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            {card.description}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
