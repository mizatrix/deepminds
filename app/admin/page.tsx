"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to admin dashboard
        router.push("/admin/dashboard");
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="text-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto" />
                <p className="text-slate-600 dark:text-slate-400">Redirecting to admin dashboard...</p>
            </div>
        </div>
    );
}
