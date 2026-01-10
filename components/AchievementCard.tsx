import { Achievement, users } from "@/lib/data";
import { Building2, Calendar, MapPin, Award, Trophy, Briefcase, User as UserIcon, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const categoryConfig: Record<string, { label: string; icon: any; color: string }> = {
    scientific: { label: "Scientific", icon: Lightbulb, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300" },
    artistic: { label: "Artistic", icon: Lightbulb, color: "bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300" },
    training: { label: "Training", icon: Briefcase, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" },
    internship: { label: "Internship", icon: Briefcase, color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300" },
    competition: { label: "Competition", icon: Trophy, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300" },
    award: { label: "Award", icon: Award, color: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300" },
    sports: { label: "Sports", icon: Trophy, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300" },
};

export default function AchievementCard({ achievement }: { achievement: Achievement }) {
    const user = users.find(u => u.id === achievement.user_id);
    const config = categoryConfig[achievement.category] || categoryConfig.scientific;
    const Icon = config.icon;

    return (
        <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-start justify-between mb-4">
                <span className={cn("px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5", config.color)}>
                    <Icon className="w-3 h-3" /> {config.label}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    {achievement.status === 'approved' && 'Verified'}
                </span>
            </div>

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {achievement.title}
            </h3>

            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-3">
                <Building2 className="w-4 h-4" />
                <span className="truncate">{achievement.org_name}</span>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
                {achievement.description}
            </p>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                        <UserIcon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{user?.full_name}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{user?.faculty}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
