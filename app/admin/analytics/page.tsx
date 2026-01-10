"use client";

import AdminAnalytics from "@/components/AdminAnalytics";

export default function AnalyticsPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Platform Analytics</h1>
            <AdminAnalytics />
        </div>
    );
}
