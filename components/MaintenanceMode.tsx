'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Construction, ArrowRight } from 'lucide-react';
import { getSettings } from '@/lib/settings-store';
import { useRole } from '@/lib/RoleContext';

/**
 * MaintenanceMode component - Wraps the app and shows maintenance page when enabled
 * Only blocks student users - admins can still access everything
 */
export default function MaintenanceMode({ children }: { children: React.ReactNode }) {
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { isAdmin, isAuthenticated } = useRole();
    const pathname = usePathname();

    useEffect(() => {
        const settings = getSettings();
        setIsMaintenanceMode(settings.maintenanceMode);
        setIsLoading(false);
    }, [pathname]); // Re-check on navigation

    // Don't block during initial load to prevent flash
    if (isLoading) {
        return <>{children}</>;
    }

    // Allow admins through always
    if (isAdmin) {
        return <>{children}</>;
    }

    // Allow login/register pages so admins can log in
    const allowedPaths = ['/login', '/register', '/api'];
    if (allowedPaths.some(path => pathname.startsWith(path))) {
        return <>{children}</>;
    }

    // Show maintenance page for non-admins when enabled
    if (isMaintenanceMode) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
                <div className="max-w-lg text-center space-y-6">
                    {/* Animated Icon */}
                    <div className="relative">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-500/30">
                            <Construction className="w-12 h-12 text-white animate-pulse" />
                        </div>
                        <div className="absolute inset-0 w-24 h-24 mx-auto bg-amber-500 rounded-3xl animate-ping opacity-20" />
                    </div>

                    {/* Message */}
                    <div className="space-y-3">
                        <h1 className="text-4xl font-bold text-white">
                            Under Maintenance
                        </h1>
                        <p className="text-lg text-slate-300">
                            We're performing scheduled maintenance to improve your experience.
                        </p>
                        <p className="text-slate-400">
                            Please check back shortly. We apologize for any inconvenience.
                        </p>
                    </div>

                    {/* Admin Login Link */}
                    <div className="pt-6">
                        <a
                            href="/login"
                            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm"
                        >
                            Administrator Login
                            <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>

                    {/* Decorative Elements */}
                    <div className="flex justify-center gap-2 pt-8">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
