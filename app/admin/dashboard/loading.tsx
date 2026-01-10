import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminDashboardLoading() {
    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="flex justify-between items-center mb-12">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="w-12 h-12 rounded-full" />
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
                    >
                        <Skeleton className="w-14 h-14 rounded-2xl mb-6" />
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3 mt-1" />
                    </div>
                ))}
            </div>
        </div>
    );
}
