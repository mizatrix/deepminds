import { achievements, users } from "@/lib/data";
import { Check, X, Eye } from "lucide-react";
import Link from "next/link";

export default function ManageAchievementsPage() {
    const allAchievements = achievements;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Manage Achievements</h1>
                    <p className="text-slate-500">Review and approve student submissions.</p>
                </div>
                <Link href="/dashboard/achievements/new" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    New Achievement
                </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-xs border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {allAchievements.map((achievement) => {
                                const user = users.find(u => u.id === achievement.user_id);
                                return (
                                    <tr key={achievement.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">{achievement.title}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span>{user?.full_name}</span>
                                                <span className="text-xs text-slate-400">{user?.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded text-xs font-semibold bg-slate-100 uppercase tracking-wide">
                                                {achievement.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{achievement.start_date}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${achievement.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                achievement.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                {achievement.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-1 rounded hover:bg-emerald-100 text-emerald-600 transition-colors" title="Approve">
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors" title="Reject">
                                                    <X className="w-4 h-4" />
                                                </button>
                                                <button className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors" title="View Details">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
