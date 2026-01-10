"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Award, Users, Settings, LogOut, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Achievements", href: "/dashboard/achievements", icon: Award },
    { label: "Users", href: "/dashboard/users", icon: Users },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col p-4 fixed left-0 top-0">
            <div className="flex items-center gap-2 mb-8 px-2">
                <GraduationCap className="h-8 w-8 text-blue-400" />
                <span className="font-bold text-lg tracking-wide">Admin Panel</span>
            </div>

            <nav className="space-y-2 flex-1">
                {items.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                            pathname === item.href
                                ? "bg-blue-600 text-white shadow-lg"
                                : "text-slate-400 hover:text-white hover:bg-slate-800"
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                    </Link>
                ))}
            </nav>

            <button className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-colors mt-auto text-sm font-medium w-full text-left">
                <LogOut className="w-5 h-5" />
                Logout
            </button>
        </div>
    );
}
