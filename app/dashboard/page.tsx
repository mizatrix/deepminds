import { achievements, users } from "@/lib/data";
import { Users, CheckCircle, Clock, Trophy } from "lucide-react";

export default function DashboardPage() {
    const pending = achievements.filter(a => a.status === 'pending').length;
    const approved = achievements.filter(a => a.status === 'approved').length;
    const totalUsers = users.length;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard Overview</h1>
                <p className="text-slate-500 dark:text-slate-400">Welcome back, Admin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[
                    { label: "Pending Requests", value: pending, icon: Clock, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" },
                    { label: "Approved Items", value: approved, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" },
                    { label: "Total Students", value: totalUsers, icon: Users, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" },
                    { label: "Platform Score", value: "98%", icon: Trophy, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400" },
                ].map(stat => (
                    <div key={stat.label} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Recent Activity</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">No recent activity logs available.</p>
            </div>
        </div>
    );
}
