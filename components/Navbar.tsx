"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, GraduationCap, LogIn, UserPlus, Shield, User, Settings, LogOut, ChevronDown, Search, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { useRole } from "@/lib/RoleContext";
import { usePortalName } from "@/lib/SettingsContext";
import NotificationBell from "./notifications/NotificationBell";
import GlobalSearch from "./search/GlobalSearch";

const studentItems = [
    { label: "Home", href: "/" },
    { label: "My Dashboard", href: "/student/dashboard" },
    { label: "Leaderboard", href: "/student/leaderboard" },
    // { label: "Certificates", href: "/student/certificates" }, // Hidden for now - will enable when certificate generation is implemented
    { label: "Categories", href: "/#categories" },
    { label: "Badges", href: "/student/badges" },
];

// Admin menu items - only shown when admin is on /admin/* routes
const adminItems = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Submissions", href: "/admin/submissions" },
    { label: "Users", href: "/admin/users" },
    { label: "Analytics", href: "/admin/analytics" },
    { label: "Audit Logs", href: "/admin/audit-logs" },
    { label: "Back to Site", href: "/" },
];

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const { role, isAdmin, isSuperAdmin, isAuthenticated, logout } = useRole();
    const portalName = usePortalName();

    // Show admin items only when admin is on /admin/* routes
    const isOnAdminRoute = pathname?.startsWith('/admin');
    const navItems = (isAdmin && isOnAdminRoute) ? adminItems : studentItems;

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Keyboard shortcut for search (Cmd/Ctrl + K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(true);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Prevent scrolling when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <>
            <nav className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
                                <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-lg leading-none text-slate-900 dark:text-white">
                                    {portalName.split(' ')[0]} <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{portalName.split(' ').slice(1).join(' ') || 'Portal'}</span>
                                </span>
                                <span className="text-[10px] font-bold tracking-widest uppercase text-purple-600 dark:text-purple-400">
                                    Portal
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden lg:flex items-center gap-8">
                            <ul className="flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-400">
                                {navItems.map((item) => (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors py-2 relative group"
                                        >
                                            {item.label}
                                            <motion.span
                                                className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 dark:bg-purple-400"
                                                whileHover={{ width: "100%" }}
                                                transition={{ duration: 0.2 }}
                                            />
                                        </Link>
                                    </li>
                                ))}
                            </ul>

                            {/* Search Button */}
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors group"
                                title="Search (⌘K / Ctrl+K)"
                            >
                                <Search className="w-5 h-5" />
                                <span className="hidden xl:flex items-center gap-1 text-xs text-slate-400 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-colors">
                                    ⌘K
                                </span>
                            </button>

                            {isAuthenticated && <NotificationBell />}
                            <ThemeToggle />

                            {isAuthenticated ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <ChevronDown className={cn("w-4 h-4 text-slate-500 transition-transform", profileDropdownOpen && "rotate-180")} />
                                    </button>
                                    <AnimatePresence>
                                        {profileDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50"
                                            >
                                                <div className="p-3 border-b border-slate-200 dark:border-slate-800">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">My Account</p>
                                                        {isSuperAdmin && (
                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-full">
                                                                <Crown className="w-3 h-3" />
                                                                Super Admin
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500">Manage your profile</p>
                                                </div>
                                                <div className="p-2">
                                                    <Link
                                                        href="/profile"
                                                        onClick={() => setProfileDropdownOpen(false)}
                                                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                                    >
                                                        <User className="w-4 h-4 text-purple-600" />
                                                        My Profile
                                                    </Link>
                                                </div>
                                                <div className="p-2 border-t border-slate-200 dark:border-slate-800">
                                                    <button
                                                        onClick={() => { setProfileDropdownOpen(false); logout(); }}
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        Logout
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-purple-600 transition-colors"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:shadow-lg hover:scale-105 shadow-purple-500/25 transition-all"
                                    >
                                        Join Now
                                    </Link>
                                </>
                            )}
                            {/* Admin quick access - only show if admin and authenticated */}
                            {isAdmin && isAuthenticated && (
                                <Link
                                    href="/admin/dashboard"
                                    className={cn(
                                        "px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2",
                                        isSuperAdmin
                                            ? "text-amber-700 dark:text-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 hover:from-amber-100 hover:to-yellow-100 dark:hover:from-amber-900/30 dark:hover:to-yellow-900/30 border border-amber-200 dark:border-amber-800/50"
                                            : "text-purple-600 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40"
                                    )}
                                >
                                    {isSuperAdmin ? <Crown className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                    {isSuperAdmin ? 'Super Admin' : 'Admin Panel'}
                                </Link>
                            )}
                        </div>

                        {/* Mobile Toggle */}
                        <div className="relative z-50 flex lg:hidden items-center gap-3">
                            <ThemeToggle />
                            <button
                                onClick={() => setIsOpen(true)}
                                className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Premium Left Sliding Drawer */}
            {isMounted && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                key="mobile-backdrop"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsOpen(false)}
                                className="fixed inset-0 bg-black/60 z-[999] lg:hidden backdrop-blur-sm"
                            />

                            {/* Drawer */}
                            <motion.div
                                key="mobile-drawer"
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="fixed inset-y-0 right-0 w-[300px] max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl z-[1000] lg:hidden flex flex-col border-l border-slate-200 dark:border-slate-800"
                            >
                                {/* Header */}
                                <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200/50 dark:border-slate-800/50">
                                    <span className="font-bold text-lg text-slate-900 dark:text-white">Menu</span>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 -mr-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Menu Items */}
                                <div className="flex-1 overflow-y-auto py-6 px-6 flex flex-col gap-6">
                                    <div className="space-y-1">
                                        {navItems.map((item, i) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setIsOpen(false)}
                                                className="block px-4 py-3 text-lg font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800/50 rounded-xl transition-all"
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                                        {/* Admin quick access link */}
                                        {isAdmin && isAuthenticated && (
                                            <Link
                                                href="/admin/dashboard"
                                                onClick={() => setIsOpen(false)}
                                                className="w-full flex items-center justify-center gap-2 py-3 text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-xl transition-colors"
                                            >
                                                <Shield className="w-5 h-5" />
                                                Admin Panel
                                            </Link>
                                        )}

                                        <div className="grid grid-cols-1 gap-3">
                                            {isAuthenticated ? (
                                                <div className="space-y-3">
                                                    <Link
                                                        href="/profile"
                                                        onClick={() => setIsOpen(false)}
                                                        className="flex items-center justify-center gap-2 py-2.5 text-slate-700 dark:text-slate-200 font-bold bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                    >
                                                        <User className="w-4 h-4" />
                                                        My Profile
                                                    </Link>
                                                    <button
                                                        onClick={() => { logout(); setIsOpen(false); }}
                                                        className="w-full flex items-center justify-center gap-2 py-2.5 text-white font-bold bg-red-600 rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/20 transition-colors"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        Logout
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Link
                                                        href="/login"
                                                        onClick={() => setIsOpen(false)}
                                                        className="flex items-center justify-center py-2.5 text-slate-700 dark:text-slate-200 font-bold bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                    >
                                                        Login
                                                    </Link>
                                                    <Link
                                                        href="/register"
                                                        onClick={() => setIsOpen(false)}
                                                        className="flex items-center justify-center py-2.5 text-white font-bold bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-colors"
                                                    >
                                                        Join Now
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* Global Search Modal */}
            <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
    );
}
