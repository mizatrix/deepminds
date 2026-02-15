"use client";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { cn } from "@/lib/utils";
import {
    TrendingUp,
    Users,
    CheckCircle,
    Clock,
    FileText,
    AlertCircle,
    Target
} from 'lucide-react';
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import ProgressRing from "@/components/ui/ProgressRing";
import { useState, useEffect, useMemo } from 'react';
import { getSubmissions } from '@/lib/actions/submissions';
import { type Submission } from '@/lib/actions/submissions';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const CATEGORY_NAMES: Record<string, string> = {
    'SCIENTIFIC': 'Scientific',
    'SPORTS': 'Sports',
    'ARTISTIC': 'Artistic',
    'COMPETITIONS': 'Competitions',
    'OTHER': 'Other'
};

export default function AdminAnalytics() {
    const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D' | 'ALL'>('30D');
    const [submissions, setSubmissions] = useState<Submission[]>([]);

    useEffect(() => {
        // Load submissions from database
        const loadSubmissions = async () => {
            try {
                const allSubmissions = await getSubmissions();
                setSubmissions(allSubmissions);
            } catch (error) {
                console.error('Error loading submissions for analytics:', error);
            }
        };
        loadSubmissions();
    }, []);

    // Calculate real statistics from submissions
    const stats = useMemo(() => {
        const total = submissions.length;
        const approved = submissions.filter(s => s.status === 'approved').length;
        const pending = submissions.filter(s => s.status === 'pending').length;
        const rejected = submissions.filter(s => s.status === 'rejected').length;
        const approvalRate = total > 0 ? ((approved / total) * 100).toFixed(1) : '0';

        // Get unique students
        const uniqueStudents = new Set(submissions.map(s => s.studentEmail)).size;

        return { total, approved, pending, rejected, approvalRate, uniqueStudents };
    }, [submissions]);

    // Calculate category distribution (as actual percentages)
    const categoryData = useMemo(() => {
        const categoryCounts: Record<string, number> = {};
        submissions.forEach(s => {
            const cat = s.category || 'OTHER';
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });

        const total = submissions.length || 1; // Avoid division by zero
        return Object.entries(categoryCounts).map(([key, count]) => ({
            name: CATEGORY_NAMES[key] || key,
            value: count,
            percentage: Math.round((count / total) * 100)
        }));
    }, [submissions]);

    // Calculate trend data (submissions per month)
    const trendData = useMemo(() => {
        const monthCounts: Record<string, number> = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Initialize last 6 months
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = months[d.getMonth()];
            monthCounts[key] = 0;
        }

        // Count submissions by month
        submissions.forEach(s => {
            const date = new Date(s.submittedAt);
            const monthKey = months[date.getMonth()];
            if (monthCounts[monthKey] !== undefined) {
                monthCounts[monthKey]++;
            }
        });

        return Object.entries(monthCounts).map(([name, submissions]) => ({ name, submissions }));
    }, [submissions]);

    // Calculate target progress
    const targetProgress = useMemo(() => {
        const thisMonth = new Date().getMonth();
        const thisMonthSubmissions = submissions.filter(s => {
            const d = new Date(s.submittedAt);
            return d.getMonth() === thisMonth;
        }).length;

        const target = 20; // Monthly target
        const progress = Math.min(100, Math.round((thisMonthSubmissions / target) * 100));

        const verificationProgress = stats.total > 0
            ? Math.round((stats.approved / stats.total) * 100)
            : 0;

        return { submissions: progress, verifications: verificationProgress };
    }, [submissions, stats]);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">System Insights</h1>
                    <p className="text-slate-500 font-medium">Platform activity and performance metrics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
                        {(['7D', '30D', '90D', 'ALL'] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                    timeRange === range
                                        ? "bg-white dark:bg-slate-800 text-purple-600 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                )}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* KPI Cards - Using Real Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Submissions', value: stats.total, change: stats.total > 0 ? '+' + stats.total : '0', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { label: 'Active Students', value: stats.uniqueStudents, change: stats.uniqueStudents > 0 ? '+' + stats.uniqueStudents : '0', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                    { label: 'Approval Rate', value: parseFloat(stats.approvalRate), suffix: '%', change: stats.approved > 0 ? '+' + stats.approved + ' approved' : '0', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                    { label: 'Pending Review', value: stats.pending, change: stats.pending > 0 ? stats.pending + ' waiting' : '0', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn("p-3 rounded-2xl", kpi.bg)}>
                                <kpi.icon className={cn("w-6 h-6", kpi.color)} />
                            </div>
                            <span className={cn("text-xs font-bold px-2 py-1 rounded-lg",
                                "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            )}>
                                {kpi.change}
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{kpi.label}</p>
                        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                            <AnimatedCounter value={kpi.value} suffix={kpi.suffix} />
                        </h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Trend Area Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            Submission Velocity
                        </h3>
                    </div>
                    <div className="h-[300px] w-full">
                        {trendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                                    />
                                    <Area type="monotone" dataKey="submissions" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSub)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">
                                No submission data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Category Pie Chart */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-8">Category Distribution</h3>
                    <div className="h-[250px] w-full">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value, name, props) => [`${props.payload.percentage}%`, name]} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">
                                No category data
                            </div>
                        )}
                    </div>
                    <div className="mt-6 space-y-3">
                        {categoryData.map((cat, i) => (
                            <div key={i} className="flex items-center justify-between text-sm font-bold">
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    {cat.name}
                                </div>
                                <span className="text-slate-900 dark:text-white">{cat.percentage}%</span>
                            </div>
                        ))}
                        {categoryData.length === 0 && (
                            <p className="text-sm text-slate-400 text-center">No submissions yet</p>
                        )}
                    </div>
                </div>

                {/* Engagement Targets */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Monthly Targets</h3>
                        <Target className="w-5 h-5 text-slate-400" />
                    </div>

                    <div className="flex justify-around items-center py-6">
                        <ProgressRing
                            progress={targetProgress.submissions}
                            size={140}
                            color="text-purple-600"
                            label={`${targetProgress.submissions}%`}
                            subLabel="Submissions"
                        />
                        <ProgressRing
                            progress={targetProgress.verifications}
                            size={100}
                            color="text-emerald-500"
                            strokeWidth={6}
                            label={`${targetProgress.verifications}%`}
                            subLabel="Approved"
                        />
                    </div>

                    <p className="text-center text-sm text-slate-500 font-medium">
                        {stats.pending > 0
                            ? `You have ${stats.pending} submission${stats.pending > 1 ? 's' : ''} pending review.`
                            : 'All submissions have been reviewed!'
                        }
                    </p>
                </div>
            </div>

            {/* Critical Alerts */}
            {stats.pending > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/20 p-6 rounded-3xl border border-amber-100 dark:border-amber-900/50 flex items-start gap-4">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
                        <AlertCircle className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-amber-900 dark:text-amber-300">Pending Submissions</h4>
                        <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                            {stats.pending} submission{stats.pending > 1 ? 's are' : ' is'} waiting for your review. Head to the Submissions page to approve or reject them.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

