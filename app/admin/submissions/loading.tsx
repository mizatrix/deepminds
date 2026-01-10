import { Skeleton } from "@/components/ui/Skeleton";

export default function SubmissionsLoading() {
    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-56" />
                    <Skeleton className="h-4 w-40" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-64 rounded-xl" />
                    <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-24 rounded-xl" />
                ))}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Table Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <div className="grid grid-cols-6 gap-4">
                        {["Student", "Title", "Category", "Date", "Status", "Actions"].map((col) => (
                            <Skeleton key={col} className="h-4 w-20" />
                        ))}
                    </div>
                </div>

                {/* Table Rows */}
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className="p-4 border-b border-slate-100 dark:border-slate-800 last:border-0"
                    >
                        <div className="grid grid-cols-6 gap-4 items-center">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-8 h-8 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                            <div className="flex gap-2">
                                <Skeleton className="w-8 h-8 rounded-lg" />
                                <Skeleton className="w-8 h-8 rounded-lg" />
                                <Skeleton className="w-8 h-8 rounded-lg" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
