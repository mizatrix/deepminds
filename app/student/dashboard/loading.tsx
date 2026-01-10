import { SkeletonDashboard } from "@/components/ui/Skeleton";

export default function StudentDashboardLoading() {
    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div className="space-y-2">
                    <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                    <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                </div>
                <div className="h-12 w-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            </div>
            <SkeletonDashboard />
        </div>
    );
}
