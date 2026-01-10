"use client";

import { useRole } from "@/lib/RoleContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    const { role } = useRole();
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        if (role !== "STUDENT") {
            router.push("/"); // or /login
        } else {
            setAuthorized(true);
        }
    }, [role, router]);

    if (!authorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return <>{children}</>;
}
