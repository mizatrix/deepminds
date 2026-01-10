import { achievements, users } from "@/lib/data";
import { Users, Award, Trophy, Star } from "lucide-react";

export default function StatsPage() {
    const totalStudents = users.length;
    const totalAchievements = achievements.filter(a => a.status === 'approved').length;
    const totalPoints = achievements.filter(a => a.status === 'approved').reduce((acc, curr) => acc + curr.points, 0);

    // Group by category
    const byCategory = achievements.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const maxCat = Math.max(...Object.values(byCategory), 1);

    // Top Students
    const studentPoints = users.map(u => {
        const pts = achievements.filter(a => a.user_id === u.id && a.status === 'approved').reduce((s, a) => s + a.points, 0);
        return { ...u, points: pts };
    }).sort((a, b) => b.points - a.points).slice(0, 5);

    return (
        <div className="space-y-12">
            <section className="text-center py-10">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">Platform Statistics</h1>
                <p className="text-slate-500 dark:text-slate-400">Real-time insights into academic excellence.</p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Students", value: totalStudents, icon: Users, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300" },
                    { label: "Approved Achievements", value: totalAchievements, icon: Star, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-300" },
                    { label: "Total Points Awarded", value: totalPoints, icon: Trophy, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-300" }
                ].map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${stat.color}`}>
                            <stat.icon className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Category Chart */}
                <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Achievements by Category</h3>
                    <div className="space-y-4">
                        {Object.entries(byCategory).map(([cat, count]) => (
                            <div key={cat}>
                                <div className="flex justify-between text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                                    <span className="capitalize">{cat}</span>
                                    <span>{count}</span>
                                </div>
                                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 rounded-full"
                                        style={{ width: `${(count / maxCat) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Top Students */}
                <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Top Performing Students</h3>
                    <div className="space-y-4">
                        {studentPoints.map((student, i) => (
                            <div key={student.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-600'
                                        }`}>
                                        {i + 1}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-slate-100">{student.full_name}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">{student.faculty}</div>
                                    </div>
                                </div>
                                <div className="font-bold text-blue-600 dark:text-blue-400">{student.points} pts</div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
